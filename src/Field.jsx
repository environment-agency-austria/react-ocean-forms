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
      getDisplayValue,
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
      value: getDisplayValue(
        '',
        Field.getValueMeta(context),
      ),
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
   * Updates the default value if a change has
   * been detected
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      fullName,
      context,
      context: {
        defaultValues: newDefaultValues,
        disabled: newDisabled,
        plaintext: newPlaintext,
      },
      getDisplayValue,
      defaultValue: newDefaultValue,
    } = nextProps;

    const defaultValue = newDefaultValue || getDeepValue(fullName, newDefaultValues);

    const {
      contextMeta: {
        defaultValue: oldDefaultValue,
        disabled: oldDisabled,
        plaintext: oldPlaintext,
      },
      touched,
    } = prevState;

    const hasDefaultValueChanged = defaultValue !== oldDefaultValue;
    const hasDisabledChanged = newDisabled !== oldDisabled;
    const hasPlaintextChanged = newPlaintext !== oldPlaintext;

    if (!touched
      && (
        hasDefaultValueChanged
        || hasDisabledChanged
        || hasPlaintextChanged
      )
    ) {
      return ({
        value: getDisplayValue(
          defaultValue || '',
          Field.getValueMeta(context),
        ),
        touched: false,
        dirty: false,
        contextMeta: {
          defaultValue,
          disabled: newDisabled,
          plaintext: newPlaintext,
        },
      });
    }

    return null;
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
    const { contextMeta: { defaultValue } } = this.state;
    const {
      validation,
      getDisplayValue,
      onChange,
      context,
    } = this.props;

    const value = getDisplayValue(
      defaultValue || '',
      Field.getValueMeta(context),
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
  validation: validationShape.isRequired,
  asyncValidateOnChange: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  getDisplayValue: PropTypes.func,
  getSubmitValue: PropTypes.func,
};

export const BaseField = Field;
export default withValidation(Field);
