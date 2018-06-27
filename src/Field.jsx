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
import { formContextShape, validationShape } from './shapes';

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
      value: '',
    };
  }

  /**
   * Updates the default value if a change has
   * been detected
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    const { fullName, context: { defaultValues: newDefaultValues } } = nextProps;
    const newDefaultValue = getDeepValue(fullName, newDefaultValues);

    const { defaultValue: oldDefaultValue } = prevState;

    if (newDefaultValue !== oldDefaultValue) {
      return ({
        value: newDefaultValue || '',
        defaultValue: newDefaultValue,
      });
    }

    return null;
  }

  /**
   * Unregisters the field from the form
   */
  componentWillUnmount() {
    this.props.context.unregisterField(this.props.fullName);
  }

  /**
   * Returns the current field value
   */
  getValue() {
    const { value } = this.state;
    return value;
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
    const { defaultValue } = this.state;
    const { validation: { reset } } = this.props;

    const value = defaultValue || '';
    this.setState({
      touched: false,
      dirty: false,
      value,
    });
    reset();

    this.callOnChange(value);
  }

  /**
   * Validates the field
   * @param {object} args Validation arguments
   */
  async validate(args) {
    const { value } = this.state;
    const { validation: { validate } } = this.props;

    return validate(value, args);
  }

  /**
   * Handles the change event of an input field -
   * triggers any validation if needed and updates
   * the field state accordingly.
   * @param {object} event Event object
   */
  handleFieldChanged(event) {
    const { value } = event.target;
    const { fullName, context, validation: { validate } } = this.props;

    this.setState({
      dirty: true,
      touched: true,
      value,
    });

    const asyncValidateOnChange = this.getAsyncValidateOnChangeSetting();

    validate(
      value,
      { checkAsync: asyncValidateOnChange },
    );

    context.notifyFieldEvent(fullName, 'change', value);
    this.callOnChange(value);
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
    } = this.props;
    const { value, dirty } = this.state;

    const asyncValidateOnChange = this.getAsyncValidateOnChangeSetting();

    if (dirty && !asyncValidateOnChange) validate(value);
    context.notifyFieldEvent(fullName, 'blur');
    if (onBlur) onBlur();
  }

  /**
   * Calls the onChange callback if existing
   * @param {any} value Field value
   */
  callOnChange(value) {
    if (this.props.onChange) this.props.onChange(value);
  }

  render() {
    const {
      component: InputComponent,
      context: {
        disabled,
        stringFormatter,
        plaintext,
      },
      fullName,
      validation: {
        valid,
        error,
        isValidating,
      },
      onChange,
      onBlur,
      ...attributes
    } = this.props;

    const {
      value,
      touched,
    } = this.state;

    const field = {
      id: fullName,
      name: fullName,
      value,
      disabled,
      onChange: this.handleFieldChanged,
      onBlur: this.handleFieldBlurred,
    };

    // Sprinkle some metadata in
    const meta = {
      valid,
      error,
      isValidating,
      touched,
      stringFormatter,
      plaintext,
    };

    return (
      <InputComponent
        {...attributes}
        field={field}
        meta={meta}
      />
    );
  }
}

Field.defaultProps = {
  asyncValidateOnChange: null,
  onChange: null,
  onBlur: null,
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
  validation: validationShape.isRequired,
  asyncValidateOnChange: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
};

export const BaseField = Field;
export default withValidation(Field);
