/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';

import { getDeepValue, parseValidationError, stringFormatter as defaultStringFormatter } from './utils';
import FormContext from './FormContext';
import { fieldValueShape } from './shapes';

/**
 * Wrapper for managed forms
 */
class Form extends React.Component {
  constructor(props) {
    super(props);

    this.registerField = this.registerField.bind(this);
    this.unregisterField = this.unregisterField.bind(this);
    this.notifyFieldEvent = this.notifyFieldEvent.bind(this);

    this.getFieldState = this.getFieldState.bind(this);
    this.getValues = this.getValues.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.submit = this.submit.bind(this);

    this.state = {
      context: {
        fieldPrefix: null,

        registerField: this.registerField,
        unregisterField: this.unregisterField,
        notifyFieldEvent: this.notifyFieldEvent,

        registerListener: (name, callback) => { this.eventListeners[name] = callback; },
        unregisterListener: (name) => { delete this.eventListeners[name]; },

        getFieldState: this.getFieldState,
        getValues: this.getValues,

        submit: this.submit,

        busy: false,
        disabled: false,
      },
    };

    this.fields = {};
    this.eventListeners = {};
  }

  /**
   * Returns the current state of the given field
   * @param {string} name Field name
   * @returns {object} Current field state or default field state
   */
  getFieldState(name) {
    return this.fields[name];
  }

  /**
   * Generates and returns an object that contains
   * all values from all the fields.
   * @returns {object} Current values in form of { name: value, name2: value2, ... }
   */
  getValues() {
    const fields = Object.entries(this.fields);
    const values = {};

    fields.forEach(([name, state]) => {
      if (state.isGroup === true) return;

      const nameParts = name.split('.');
      let valueRef = values;

      nameParts.forEach((key, index) => {
        if (nameParts.length === 1 || index === nameParts.length - 1) {
          valueRef[key] = state.getValue();
        } else {
          if (valueRef[key] === undefined) valueRef[key] = {};
          valueRef = valueRef[key];
        }
      });
    });

    return values;
  }

  /**
   * Gets called when a field triggers an event
   * @param {string} name Field name
   * @param {string} event Event name
   * @param {object} args Event args
   */
  notifyFieldEvent(name, event, args) {
    if (event === 'change') {
      const { onFieldValueChanged } = this.props;
      if (onFieldValueChanged !== null) {
        onFieldValueChanged(name, args);
      }
    }

    if (event === 'validation') {
      const { [name]: { label } } = this.fields;
      this.notifyListeners(name, event, { ...args, label });
    } else {
      this.notifyListeners(name, event, args);
    }
  }

  /**
   * Notifies the event listeners about an event
   * @param {string} name Field name
   * @param {string} event Event name
   * @param {object} args Event args
   */
  notifyListeners(name, event, args) {
    const listeners = Object.entries(this.eventListeners);
    listeners.forEach(([, callback]) => callback(name, event, args));
  }

  /**
   * Handles the submit event of the form - prevents
   * the default and runs the submit logic
   * @param {object} event Event object
   */
  handleSubmit(event) {
    event.preventDefault();
    this.submit();
  }

  /**
   * Submits the form - triggers any validations if needed
   * and raises the onFormSubmit prop callback if the
   * form is currently valid.
   * @param {object} submitArgs Arguments that will be passed
   * to the onSubmit callback
   */
  async submit(submitArgs) {
    this.updateBusyState(true);

    // Iterate through all fields and validate them
    // if needed.
    const fields = Object.entries(this.fields);
    const validations = fields.map(([, state]) => state.validate({
      checkAsync: true,
      immediateAsync: true,
    }));

    const validationStates = await Promise.all(validations);

    // Check if all fields are valid
    const allValid = validationStates.every(state => state.valid === true);
    if (allValid === false) {
      this.notifyFieldEvent('_form', 'submit-invalid');
      this.updateBusyState(false);
      return;
    }

    // Call the form wide validation
    const formValid = this.triggerFormValidation();
    if (formValid === false) {
      this.notifyFieldEvent('_form', 'submit-invalid');
      this.updateBusyState(false);
      return;
    }

    this.callOnSubmit(submitArgs);
  }

  /**
   * Updates the busy state in the form context
   * @param {boolean} busy Busy state
   */
  updateBusyState(busy) {
    this.setState(prevState => ({
      context: {
        ...prevState.context,
        busy,
      },
    }));
  }

  /**
   * Triggers the form wide validation callback if given
   * @returns {bool} Validation state of the form
   */
  triggerFormValidation() {
    const { onValidate } = this.props;
    if (onValidate === null) return true;

    const values = this.getValues();
    const result = onValidate(values);

    // If the callback returned null then the form is valid
    if (result === null) return true;

    // Otherwise parse the result object and update the
    // field states.
    const fields = Object.entries(this.fields);

    fields.forEach(([name, state]) => {
      const fieldError = parseValidationError(name, getDeepValue(name, result));
      const isValid = typeof fieldError !== 'object';

      if (!isValid) {
        state.updateValidation({
          valid: false,
          error: fieldError,
        });
      }
    });

    return false;
  }

  /**
   * Gathers all the data and calls the onSubmit callback
   * if provided.
   * @param {object} submitArgs Arguments that will be passed
   * to the onSubmit callback
   */
  callOnSubmit(submitArgs) {
    const { onSubmit } = this.props;
    if (onSubmit !== null) {
      const values = this.getValues();
      const submitResult = onSubmit(values, submitArgs);

      if (submitResult instanceof Promise) {
        submitResult.then(() => {
          this.updateBusyState(false);
        });

        return;
      }
    }

    this.updateBusyState(false);
  }

  /**
   * Handles the reset event of the form - prevents
   * the default and sets the state of all fields back
   * to the default state.
   * @param {object} event Event object
   */
  handleReset(event) {
    event.preventDefault();

    const fields = Object.entries(this.fields);
    fields.forEach(([, state]) => state.reset());

    const { onReset } = this.props;
    if (onReset !== null) {
      onReset();
    }
  }

  /**
   * Registers a new field to the form.
   * @param {string} name Field name
   * @param {object} fieldState Field state
   */
  registerField(name, fieldState) {
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('[Form] registerField: name is required');
    }

    if (typeof fieldState !== 'object') {
      throw new Error('[Form] registerField: field state is required');
    }

    if (
      typeof fieldState.label !== 'string'
      || typeof fieldState.validate !== 'function'
      || typeof fieldState.updateValidation !== 'function'
      || typeof fieldState.reset !== 'function'
      || typeof fieldState.getValue !== 'function'
    ) {
      throw new Error('[Form] registerField: invalid field state given');
    }

    this.fields[name] = fieldState;
  }

  /**
   * Unregisters a field from the form.
   * @param {string} name Field name
   */
  unregisterField(name) {
    this.notifyListeners(name, 'validation', {
      label: this.fields[name].label,
      valid: true,
    });
    delete this.fields[name];
  }

  /**
   * Combines the local form context with
   * the values from the props to form the
   * full form context passed to the form
   * components.
   */
  prepareFormContext() {
    const { context } = this.state;
    const {
      defaultValues,
      asyncValidateOnChange,
      asyncValidationWait,
      formatString: stringFormatter,
      disabled,
      plaintext,
    } = this.props;

    return {
      ...context,
      defaultValues,
      asyncValidateOnChange,
      asyncValidationWait,
      stringFormatter,
      disabled,
      plaintext,
    };
  }

  /**
   * Renders the form and wraps all its children
   * in a FormContext provider and a html form.
   */
  render() {
    const {
      children,
      className,
      plaintext,
    } = this.props;

    const context = this.prepareFormContext();

    let formClass = className || '';
    if (plaintext) formClass = `${formClass} plaintext`;

    return (
      <FormContext.Provider value={context}>
        <form className={formClass} onSubmit={this.handleSubmit} onReset={this.handleReset}>
          {children}
        </form>
      </FormContext.Provider>
    );
  }
}

Form.displayName = 'Form';

Form.defaultProps = {
  defaultValues: {},
  asyncValidateOnChange: false,
  asyncValidationWait: 400,
  formatString: defaultStringFormatter,
  onSubmit: null,
  onValidate: null,
  onReset: null,
  onFieldValueChanged: null,
  disabled: false,
  className: undefined,
  plaintext: false,
};

Form.propTypes = {
  defaultValues: PropTypes.objectOf(fieldValueShape),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  asyncValidateOnChange: PropTypes.bool,
  asyncValidationWait: PropTypes.number,
  formatString: PropTypes.func,
  onSubmit: PropTypes.func,
  onValidate: PropTypes.func,
  onReset: PropTypes.func,
  onFieldValueChanged: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  plaintext: PropTypes.bool,
};

export default Form;
