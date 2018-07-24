/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { formContextShape, validationShape } from './shapes';
import withValidation from './hocs/withValidation';
import { FormContext } from './hocs/withForm';

/**
 * Wrapper for groups of input fields
 * managed by the form component
 */
class FieldGroup extends React.Component {
  constructor(props) {
    super(props);

    this.validate = this.validate.bind(this);
    this.reset = this.reset.bind(this);

    this.notifyFieldEvent = this.notifyFieldEvent.bind(this);

    const {
      fullName,
      label,
      context,
      validation: {
        update: updateValidation,
      },
    } = props;

    // Our state will overwrite the parts of the formContext
    this.state = {
      fieldPrefix: fullName,
      notifyFieldEvent: this.notifyFieldEvent,
    };

    // Register the group in the formContext, so the group
    // validation can be called on form submit.
    context.registerField(
      fullName,
      {
        label,

        validate: this.validate,
        updateValidation,
        reset: this.reset,
        getValue: () => ({}),

        isGroup: true,
      },
    );
  }

  /**
   * Unregisters the field from the form
   */
  componentWillUnmount() {
    const { context, fullName } = this.props;
    context.unregisterField(fullName);
  }

  /**
   * Helper function to get the correct value
   * of the group (including all values of the nested fields)
   */
  getGroupValue() {
    const { context, fullName } = this.props;
    const formValues = context.getValues();
    return formValues[fullName] || '';
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
   * Resets the validation state
   */
  reset() {
    const { validation: { reset } } = this.props;
    reset();
  }

  /**
   * Listens to child field events, triggers validation if
   * needed and passes them to the higher context
   * @param {string} name Field name
   * @param {string} event Event name
   * @param {object} args Event args
   */
  notifyFieldEvent(name, event, args) {
    const { fullName, context, validation: { validate } } = this.props;
    context.notifyFieldEvent(name, event, args);

    if (event === 'change' || event === 'blur') {
      const groupValue = this.getGroupValue();

      const asyncValidateOnChange = this.getAsyncValidateOnChangeSetting();
      if (event === 'change') {
        const localName = name.substring(fullName.length + 1);
        groupValue[localName] = args;

        validate(
          groupValue,
          { checkAsync: asyncValidateOnChange },
        );
      } else if (!asyncValidateOnChange) {
        validate(groupValue);
      }
    }
  }

  /**
   * Triggers the validation of the group
   * @param {object} args Options for the validate call
   */
  validate(args) {
    const { validation: { validate } } = this.props;

    // Overwrite the value of the group state with
    // the parsed one.
    const value = this.getGroupValue();
    return validate(value, args);
  }

  render() {
    const {
      context,
      fullName,
      validation: {
        isValidating,
        valid,
        error,
      },
      render: renderProp,
    } = this.props;

    const groupState = {
      fullName,
      isValidating,
      valid,
      error,
    };

    const subContext = {
      ...context,
      ...this.state,
    };

    return (
      <FormContext.Provider value={subContext}>
        {renderProp(groupState)}
      </FormContext.Provider>
    );
  }
}

FieldGroup.displayName = 'FieldGroup';

FieldGroup.defaultProps = {
  asyncValidateOnChange: null,
};

FieldGroup.propTypes = {
  fullName: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  context: formContextShape.isRequired,
  render: PropTypes.func.isRequired,
  validation: validationShape.isRequired,
  asyncValidateOnChange: PropTypes.bool,
};

export const BaseFieldGroup = FieldGroup;
export default withValidation(FieldGroup);
