/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { getDisplayName, parseValidationError } from '../utils';
import { withForm } from './withForm';
import { formContextShape } from '../shapes';

/**
 * Injects a ValidatedComponent
 * @param {object} WrappedComponent Wrapped component
 */
export function baseWithValidation(WrappedComponent) {
  /**
   * Component that handles validation of the
   * wrapped component.
   */
  class ValidatedComponent extends React.Component {
    constructor(props) {
      super(props);

      this.validate = this.validate.bind(this);
      this.reset = this.reset.bind(this);
      this.updateValidationState = this.updateValidationState.bind(this);

      const { name, context } = props;
      const fullName = context.fieldPrefix
        ? context.fieldPrefix.concat('.', name)
        : name;

      this.state = {
        fullName,
        valid: true,
        error: null,
        isValidating: false,
        asyncTimeout: null,
      };

      this.unmounted = false;
    }

    /**
     * Unregisters the field from the form
     */
    componentWillUnmount() {
      const { asyncTimeout } = this.state;
      if (asyncTimeout !== null) clearTimeout(asyncTimeout);
      this.unmounted = true;
    }

    /**
     * Resets the validation state to the default
     */
    reset() {
      const { asyncTimeout } = this.state;
      if (asyncTimeout !== null) clearTimeout(asyncTimeout);

      this.updateAndNotify({
        valid: true,
        error: null,
        isValidating: false,
        asyncTimeout: null,
      });
    }

    /**
     * Updates the validation state
     * @param {object} state New state
     */
    updateValidationState(state) {
      const oldState = this.state;
      const newState = {
        ...oldState,
        ...state,
      };

      this.updateAndNotify(newState);
    }

    /**
     * Triggers the validation of a field.
     * @param {object} value Value of the field
     * @param {object} options @see checkAsync @see immediateAsync
     * @param {boolean} checkAsync True if the async validators should be triggered as well
     * @param {boolean} immediateAsync True if the async validators should fire immediately
     */
    async validate(
      value,
      {
        checkAsync = true,
        immediateAsync = false,
      } = {},
    ) {
      const {
        validators,
        asyncValidators,
        context: formContext,
      } = this.props;
      const {
        fullName,
        asyncTimeout,
      } = this.state;

      const validationState = {
        valid: true,
        error: null,
        isValidating: false,
        asyncTimeout: null,
      };

      // Clear the old timeout so we only run the
      // async validators after the waiting period
      // when the value didn't change in the meantime
      if (asyncTimeout !== null) {
        clearTimeout(asyncTimeout);
        validationState.asyncTimeout = null;
      }

      // No validators - nothing to do here
      if (!Array.isArray(validators) && !Array.isArray(asyncValidators)) {
        this.setState(validationState);
        return validationState;
      }

      // Synchronous validators
      if (Array.isArray(validators)) {
        validationState.valid = validators.every((validator) => {
          const result = validator(value, formContext);
          const parsedResult = parseValidationError(fullName, result);

          if (typeof parsedResult === 'object') {
            validationState.error = parsedResult;
            return false;
          }

          return true;
        });
      }

      // Ignore async validation if sync validation is already false
      if (validationState.valid === false) {
        this.updateAndNotify(validationState);
        return validationState;
      }

      // Only run async validation if needed
      if (!checkAsync || !Array.isArray(asyncValidators)) {
        this.updateAndNotify(validationState);
        return validationState;
      }

      // Asynchronous validators
      const performAsyncValidation = async () => {
        const validatorFunctions = asyncValidators.map(validator => validator(
          value,
          formContext,
        ));

        const errors = await Promise.all(validatorFunctions);
        const parsedErrors = errors.map(error => parseValidationError(fullName, error));

        validationState.error = parsedErrors.filter(error => typeof error === 'object');
        validationState.valid = validationState.error.length === 0;

        if (validationState.error.length === 0) validationState.error = null;

        validationState.isValidating = false;
        validationState.asyncTimeout = null;

        this.updateAndNotify(validationState);
        return validationState;
      };

      validationState.isValidating = true;

      if (immediateAsync === true) {
        this.updateAndNotify(validationState);
        return performAsyncValidation();
      }

      // Get the correct wait setting
      const { asyncValidationWait: propAsyncValidationWait } = this.props;
      const asyncValidationWait = propAsyncValidationWait === null
        ? formContext.asyncValidationWait
        : propAsyncValidationWait;

      validationState.asyncTimeout = setTimeout(performAsyncValidation, asyncValidationWait);

      this.updateAndNotify(validationState);
      return validationState;
    }

    /**
     * Updates the validation state and notifies the form
     * @param {object} newState New validation state
     */
    updateAndNotify(newState) {
      const { context } = this.props;
      const { fullName } = this.state;

      // Don't do anything if the component has already been
      // unmounted. This can happen when the validated Field
      // is already removed while there are async validators
      // running in the background.
      if (this.unmounted) return;

      this.setState(newState);
      context.notifyFieldEvent(fullName, 'validation', newState);
    }

    render() {
      const {
        fullName,
        isValidating,
        valid,
        error,
      } = this.state;

      const validation = {
        validate: this.validate,
        reset: this.reset,
        update: this.updateValidationState,

        isValidating,
        valid,
        error,
      };

      return (
        <WrappedComponent
          fullName={fullName}
          validation={validation}
          {...this.props}
        />
      );
    }
  }

  ValidatedComponent.defaultProps = {
    validators: undefined,
    asyncValidators: undefined,
    asyncValidationWait: null,
  };
  ValidatedComponent.propTypes = {
    name: PropTypes.string.isRequired,
    validators: PropTypes.arrayOf(PropTypes.func),
    asyncValidators: PropTypes.arrayOf(PropTypes.func),
    asyncValidationWait: PropTypes.number,
    context: formContextShape.isRequired,
  };
  ValidatedComponent.displayName = `ValidatedComponent(${getDisplayName(WrappedComponent)})`;

  return ValidatedComponent;
}

/**
 * Injects a ValidatedComponent
 * @param {object} WrappedComponent Wrapped component
 */
export default function withValidation(WrappedComponent) {
  return withForm(baseWithValidation(WrappedComponent));
}
