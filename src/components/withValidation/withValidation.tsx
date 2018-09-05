/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';

import { getDisplayName, parseValidationError, Subtract } from '../../utils';
import { TAsyncValidator, TValidator } from '../../validators';
import { TFieldValue } from '../Field';
import { IFormContextProps, withForm } from '../withForm';
import { IValidationArgs, IValidationComponentState, IValidationProps, IValidationState } from './withValidation.types';

interface IValidatedComponentProps extends IFormContextProps {
  name: string;
  validators: TValidator[];
  asyncValidators: TAsyncValidator[];
  asyncValidationWait?: number;
}

/**
 * Injects a ValidatedComponent
 * @param WrappedComponent Wrapped component
 */
// tslint:disable-next-line:max-func-body-length
export const baseWithValidation = <T extends IValidationProps>(WrappedComponent: React.ComponentType<T>):
  React.Component<Subtract<T, IValidationProps> & IValidatedComponentProps> => {

  /**
   * Component that handles validation of the
   * wrapped component.
   */
  class ValidatedComponent extends React.Component<IValidatedComponentProps, IValidationComponentState> {
    public static displayName: string = `ValidatedComponent(${getDisplayName(WrappedComponent)})`;

    private unmounted: boolean = false;

    constructor(props: IValidatedComponentProps) {
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
        asyncTimeout: undefined,
      };
    }

    /**
     * Unregisters the field from the form
     */
    public componentWillUnmount(): void {
      const { asyncTimeout } = this.state;
      if (asyncTimeout !== undefined) { clearTimeout(asyncTimeout); }
      this.unmounted = true;
    }

    /**
     * Resets the validation state to the default
     */
    private reset(): void {
      const { asyncTimeout } = this.state;
      if (asyncTimeout !== undefined) { clearTimeout(asyncTimeout); }

      this.updateAndNotify({
        valid: true,
        error: null,
        isValidating: false,
        asyncTimeout: undefined,
      });
    }

    /**
     * Updates the validation state
     * @param state New state
     */
    private updateValidationState(state: IValidationComponentState): void {
      const oldState = this.state;
      const newState = {
        ...oldState,
        ...state,
      };

      this.updateAndNotify(newState);
    }

    /**
     * Triggers the validation of a field.
     * @param value Value of the field
     * @param options Validation params @see checkAsync @see immediateAsync
     * @param checkAsync True if the async validators should be triggered as well
     * @param immediateAsync True if the async validators should fire immediately
     */
    // tslint:disable-next-line:max-func-body-length
    private async validate(
      value: TFieldValue,
      {
        checkAsync = true,
        immediateAsync = false,
      }: Partial<IValidationArgs> = {},
    ): Promise<IValidationState> {
      const {
        validators,
        asyncValidators,
        context: formContext,
      } = this.props;
      const {
        fullName,
        asyncTimeout,
      } = this.state;

      const validationState: IValidationState = {
        valid: true,
        error: null,
        isValidating: false,
        asyncTimeout: undefined,
      };

      // Clear the old timeout so we only run the
      // async validators after the waiting period
      // when the value didn't change in the meantime
      if (asyncTimeout !== undefined) {
        clearTimeout(asyncTimeout);
        validationState.asyncTimeout = undefined;
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
      const performAsyncValidation = async (): Promise<IValidationState> => {
        const validatorFunctions = asyncValidators.map(validator => validator(
          value,
          formContext,
        ));

        const errors = await Promise.all(validatorFunctions);
        const parsedErrors = errors.map(error => parseValidationError(fullName, error));

        validationState.error = parsedErrors.filter(error => typeof error === 'object');
        validationState.valid = validationState.error.length === 0;

        if (validationState.error.length === 0) { validationState.error = null; }

        validationState.isValidating = false;
        validationState.asyncTimeout = undefined;

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
     * @param newState New validation state
     */
    private updateAndNotify(newState: IValidationState): void {
      const { context } = this.props;
      const { fullName } = this.state;

      // Don't do anything if the component has already been
      // unmounted. This can happen when the validated Field
      // is already removed while there are async validators
      // running in the background.
      if (this.unmounted) { return; }

      this.setState(newState);
      context.notifyFieldEvent(fullName, 'validation', newState);
    }

    // tslint:disable-next-line:member-ordering
    public render(): JSX.Element {
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

  return ValidatedComponent;
};

/**
 * Injects a ValidatedComponent
 * @param WrappedComponent Wrapped component
 */
export const withValidation = <T extends IValidationProps>(WrappedComponent: React.ComponentType<T>) => {
  return withForm(baseWithValidation(WrappedComponent));
};
