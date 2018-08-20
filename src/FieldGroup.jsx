/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { formContextShape, validationShape, fieldValueShape } from './shapes';
import withValidation from './hocs/withValidation';
import FormContext from './FormContext';

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

    this.checkFormContext();

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
   * Generates the form context for the FieldGroup children
   * Overrides fieldPrefix and notifyFieldEvent from the
   * parent context, and overrides defaultValues and values
   * for the group items if needed
   */
  getSubContext() {
    const { context } = this.props;

    return {
      ...context,
      ...this.state,
      ...this.overrideContextValues('defaultValues'),
      ...this.overrideContextValues('values'),
    };
  }

  /**
   * Checks if the FieldGroup is inside a valid form context
   * and throws an user friendly error if not
   */
  checkFormContext() {
    const { context, fullName } = this.props;
    if (!context || typeof context.registerField !== 'function') {
      throw new Error(
        `Could not find a form context for field group "${fullName}". `
        + 'Fields can only be used inside a Form tag.',
      );
    }
  }

  /**
   * Checks if the FieldGroup has a prop with the given name
   * and overrides the according value in the parent form context.
   * @param {string} name Property name
   */
  overrideContextValues(name) {
    const {
      fullName,
      context: { [name]: contextValue },
      [name]: propValue,
    } = this.props;

    if (propValue === undefined) {
      return {
        [name]: contextValue,
      };
    }

    return {
      [name]: {
        ...contextValue,
        ...{
          [fullName]: propValue,
        },
      },
    };
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
      const asyncValidateOnChange = this.getAsyncValidateOnChangeSetting();
      if (event === 'change') {
        const localName = name.substring(fullName.length + 1);

        validate(
          {
            ...this.getGroupValue(),
            ...{
              // Override the value of the event sender, because
              // the Field didn't update its state yet, making the
              // Form.getValues() returning an old Field value.
              [localName]: args,
            },
          },
          { checkAsync: asyncValidateOnChange },
        );
      } else if (!asyncValidateOnChange) {
        validate(this.getGroupValue());
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

    const subContext = this.getSubContext();

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
  defaultValues: undefined,
  values: undefined,
};

FieldGroup.propTypes = {
  fullName: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  context: formContextShape.isRequired,
  render: PropTypes.func.isRequired,
  validation: validationShape.isRequired,
  asyncValidateOnChange: PropTypes.bool,
  defaultValues: PropTypes.objectOf(fieldValueShape),
  values: PropTypes.objectOf(fieldValueShape),
};

export const BaseFieldGroup = FieldGroup;
export default withValidation(FieldGroup);
