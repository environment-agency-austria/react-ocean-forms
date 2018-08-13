/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { getDeepValue } from './utils';
import withValidation from './hocs/withValidation';
import { formContextShape, validationShape, fieldValueShape } from './shapes';

/**
 * Wrapper for input fields managed by
 * the form component
 */
class Field extends React.Component {
  /**
   * Correctly calls the getDisplayValue callback
   * @param {Object} props Field props
   * @param {Object} value Field value
   */
  static callGetDisplayValue(props, value) {
    const { getDisplayValue, context } = props;

    return getDisplayValue(
      value || '',
      Field.getValueMeta(context),
    );
  }

  constructor(props) {
    super(props);

    this.handleFieldChanged = this.handleFieldChanged.bind(this);
    this.handleFieldBlurred = this.handleFieldBlurred.bind(this);

    this.reset = this.reset.bind(this);
    this.getValue = this.getValue.bind(this);
    this.validate = this.validate.bind(this);

    const {
      fullName,
      label,
      context,
      validation: {
        update: updateValidation,
      },
    } = props;

    context.registerField(
      fullName,
      {
        label,

        validate: this.validate,
        updateValidation,
        reset: this.reset,
        getValue: this.getValue,
      },
    );

    this.state = {
      touched: false,
      dirty: false,
      value: Field.callGetDisplayValue(props, ''),
      contextMeta: {
        disabled: false,
        plaintext: false,
      },
    };
  }

  /**
   * Unregisters the field from the form
   */
  componentWillUnmount() {
    const { context, fullName } = this.props;
    context.unregisterField(fullName);
  }

  /**
   * Changes the field value based on changes in Form.defaultValues,
   * Form.values, Field.defaultValue or Field.value. The Field props
   * always override the Form props. Changes in defaultValue will only
   * update the field value, if there is no values or value prop present
   * and if the field hasn't been touched.
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      context: {
        disabled: newDisabled,
        plaintext: newPlaintext,
      },
    } = nextProps;

    // Get the default value from Field.defaultValue or Form.defaultValues
    const defaultValue = Field.getDefaultValue(nextProps);
    // Get the "external" value from Field.value or Form.values
    const externalValue = Field.getExternalValue(nextProps);

    // Get changes in default or external value and meta information (plaintext, disabled)
    // Meta information must trigger a state change as well, because they are passed to
    // Field.getDisplayValue and could result in a different return value of that function
    const changes = Field.getPropChanges(nextProps, prevState, defaultValue, externalValue);
    // Get the new value based on the information above, or undefined if we don't need any
    // value changes.
    const propValue = Field.getPropValue(defaultValue, externalValue, changes);

    // Update the Field state if needed, also remember the current prop values so we can
    // detect changes in the next call of getDerivedStateFromProps.
    if (propValue !== undefined) {
      return ({
        value: Field.callGetDisplayValue(nextProps, propValue),
        touched: false,
        dirty: false,
        contextMeta: {
          defaultValue,
          externalValue,
          disabled: newDisabled,
          plaintext: newPlaintext,
        },
      });
    }

    return null;
  }

  /**
   * Calculates the new state value based on the parameters - it will return
   * the externalValue if it exists and has changes, or the default value
   * otherwise. If no state update is needed it will return undefined. Meta
   * changes will trigger a state change as well.
   * @param {Object} defaultValue Default value
   * @param {Object} externalValue External value
   * @param {Object} changes Changes object
   */
  static getPropValue(defaultValue, externalValue, changes) {
    const hasExternalValue = externalValue !== undefined;

    if (hasExternalValue && (changes.externalValue || changes.meta)) {
      return externalValue;
    }

    if (!hasExternalValue && (changes.defaultValue || changes.meta)) {
      return defaultValue;
    }

    return undefined;
  }

  /**
   * Detects changes in the defaultValue, the externalValue and in
   * context.disabled or context.plaintext (merged as meta prop)
   * @param {Object} props Field props
   * @param {Object} state Field state
   * @param {Object} defaultValue Default value
   * @param {Object} externalValue External value
   */
  static getPropChanges(props, state, defaultValue, externalValue) {
    const {
      context: {
        disabled: newDisabled,
        plaintext: newPlaintext,
      },
    } = props;

    const {
      contextMeta: {
        defaultValue: oldDefaultValue,
        externalValue: oldExternalValue,
        disabled: oldDisabled,
        plaintext: oldPlaintext,
      },
      touched,
    } = state;

    return {
      defaultValue: !touched && defaultValue !== oldDefaultValue,
      externalValue: externalValue !== oldExternalValue,
      meta: newDisabled !== oldDisabled || newPlaintext !== oldPlaintext,
    };
  }

  /**
   * Returns the local value if existing, otherwise tries to
   * extract the correct context value based on the fullName.
   * @param {Object} localValue Local value
   * @param {Object} contextValue Context value
   * @param {String} fullName Field.fullName
   */
  static getLocalOverridenValue(localValue, contextValue, fullName) {
    return localValue || getDeepValue(fullName, contextValue);
  }

  /**
   * Returns either the Field.value or the correct value from
   * Form.values
   * @param {props} props Field props
   */
  static getExternalValue(props) {
    const { fullName, context: { values }, value } = props;
    return Field.getLocalOverridenValue(value, values, fullName);
  }

  /**
   * Returns either the Field.defaultValue or the correct default value
   * from Form.defaultValues
   * @param {Object} props Field props
   */
  static getDefaultValue(props) {
    const { fullName, context: { defaultValues }, defaultValue } = props;
    return Field.getLocalOverridenValue(defaultValue, defaultValues, fullName);
  }

  /**
   * Returns a meta object for the value lifecycle hooks
   * @param {FormContext} context Form context
   */
  static getValueMeta(context) {
    return {
      disabled: context.disabled,
      plaintext: context.plaintext,
    };
  }

  /**
   * Returns the current field value
   */
  getValue() {
    const { value } = this.state;
    const { getSubmitValue, context } = this.props;

    return getSubmitValue(
      value,
      Field.getValueMeta(context),
    );
  }

  /**
   * Returns the correct asyncValidateOnChange setting,
   * where the field setting takes priorty over the
   * form setting
   */
  getAsyncValidateOnChangeSetting() {
    const {
      asyncValidateOnChange: propChange,
      context: { asyncValidateOnChange: contextChange },
    } = this.props;

    return propChange === null ? contextChange : propChange;
  }

  /**
   * Resets the field to its default state
   */
  reset() {
    const { contextMeta: { externalValue, defaultValue } } = this.state;
    const { validation, onChange } = this.props;

    const value = Field.callGetDisplayValue(
      this.props,
      externalValue || defaultValue,
    );

    this.setState({
      touched: false,
      dirty: false,
      value,
    });

    validation.reset();
    onChange(value);
  }

  /**
   * Validates the field
   * @param {object} args Validation arguments
   */
  async validate(args) {
    const { value } = this.state;
    const { validation: { validate }, getSubmitValue, context } = this.props;

    return validate(
      getSubmitValue(
        value,
        Field.getValueMeta(context),
      ),
      args,
    );
  }

  /**
   * Handles the change event of an input field -
   * triggers any validation if needed and updates
   * the field state accordingly.
   * @param {object} event Event object
   */
  handleFieldChanged(event) {
    const { value } = event.target;
    const {
      fullName,
      context,
      validation: { validate },
      getSubmitValue,
      onChange,
    } = this.props;

    this.setState({
      dirty: true,
      touched: true,
      value,
    });

    const asyncValidateOnChange = this.getAsyncValidateOnChangeSetting();
    const submitValue = getSubmitValue(
      value,
      Field.getValueMeta(context),
    );

    validate(
      submitValue,
      { checkAsync: asyncValidateOnChange },
    );

    context.notifyFieldEvent(fullName, 'change', submitValue);
    onChange(submitValue);
  }

  /**
   * Handles the blur event of an input field -
   * triggers any validation if needed and updates
   * the field state accordingly.
   */
  handleFieldBlurred() {
    const {
      fullName,
      validation: { validate },
      context,
      onBlur,
      getSubmitValue,
    } = this.props;
    const { value, dirty } = this.state;

    const asyncValidateOnChange = this.getAsyncValidateOnChangeSetting();
    const submitValue = getSubmitValue(
      value,
      Field.getValueMeta(context),
    );

    if (dirty && !asyncValidateOnChange) validate(submitValue);
    context.notifyFieldEvent(fullName, 'blur');
    onBlur();
  }

  /**
   * Creates the properties that can be directly
   * mapped to the input component (e.g. html input)
   */
  createFieldProps() {
    const { context: { disabled }, fullName } = this.props;
    const { value } = this.state;

    return {
      id: fullName,
      name: fullName,
      value,
      disabled,
      onChange: this.handleFieldChanged,
      onBlur: this.handleFieldBlurred,
    };
  }

  /**
   * Creates the meta properties with meta information
   * used by the input component
   */
  createMetaProps() {
    const {
      context: {
        stringFormatter,
        plaintext,
      },
      validation: {
        valid,
        error,
        isValidating,
      },
    } = this.props;

    const { touched } = this.state;

    return {
      valid,
      error,
      isValidating,
      touched,
      stringFormatter,
      plaintext,
    };
  }

  render() {
    const {
      component: InputComponent,
      context,
      fullName,
      validation,
      onChange,
      onBlur,
      ...attributes
    } = this.props;

    const field = this.createFieldProps();
    const meta = this.createMetaProps();

    return (
      <InputComponent
        {...attributes}
        field={field}
        meta={meta}
      />
    );
  }
}

Field.displayName = 'Field';

Field.defaultProps = {
  asyncValidateOnChange: null,
  defaultValue: undefined,
  value: undefined,
  onChange: () => {},
  onBlur: () => {},
  getDisplayValue: value => (value),
  getSubmitValue: value => (value),
};

Field.propTypes = {
  name: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  component: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  context: formContextShape.isRequired,
  defaultValue: fieldValueShape,
  value: fieldValueShape,
  validation: validationShape.isRequired,
  asyncValidateOnChange: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  getDisplayValue: PropTypes.func,
  getSubmitValue: PropTypes.func,
};

export const BaseField = Field;
export default withValidation(Field);
