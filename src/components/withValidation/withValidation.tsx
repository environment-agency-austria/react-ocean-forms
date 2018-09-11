/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';

import { getDisplayName, parseValidationError, Subtract } from '../../utils';
import { isIFieldErrorObject } from '../../validators';
import { TFieldValue } from '../Field';
import { IFormContextProps, withForm } from '../withForm';
import {
  IBaseValidationProps,
  IValidatedComponentProps,
  IValidationArgs,
  IValidationProps,
  IValidationState,
} from './withValidation.types';

type TWrappedValidatedComponentProps<T extends IValidationProps> = Subtract<T, IBaseValidationProps> & IValidatedComponentProps;

/**
 * Injects a ValidatedComponent
 * @param WrappedComponent Wrapped component
 */
// tslint:disable-next-line:max-func-body-length
export const baseWithValidation = <T extends IValidationProps>(WrappedComponent: React.ComponentType<T>):
  React.ComponentType<TWrappedValidatedComponentProps<T>> => {

  /**
   * Component that handles validation of the
   * wrapped component.
   */
  class ValidatedComponent extends React.Component<TWrappedValidatedComponentProps<T>, IValidationState> {
    public static displayName: string = `ValidatedComponent(${getDisplayName(WrappedComponent)})`;

    private unmounted: boolean = false;

    private asyncTimeout?: number;

    private get fullName(): string {
      const { name, context } = this.props;

      return context.fieldPrefix
        ? context.fieldPrefix.concat('.', name)
        : name;
    }

    constructor(props: TWrappedValidatedComponentProps<T>) {
      super(props);

      this.validate = this.validate.bind(this);
      this.reset = this.reset.bind(this);
      this.updateValidationState = this.updateValidationState.bind(this);

      this.state = {
        valid: true,
        error: null,
        isValidating: false,
      };
    }

    /**
     * Unregisters the field from the form
     */
    public componentWillUnmount(): void {
      this.clearValidationTimeout();
      this.unmounted = true;
    }

    /**
     * Clears the validation timeout if currently
     * running
     */
    private clearValidationTimeout(): void {
      if (this.asyncTimeout !== undefined) {
        clearTimeout(this.asyncTimeout);
        this.asyncTimeout = undefined;
      }
    }

    /**
     * Resets the validation state to the default
     */
    private reset(): void {
      this.clearValidationTimeout();

      this.updateAndNotify({
        valid: true,
        error: null,
        isValidating: false,
      });
    }

    /**
     * Updates the validation state
     * @param state New state
     */
    private updateValidationState(state: IValidationState): void {
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

      const validationState: IValidationState = {
        valid: true,
        error: null,
        isValidating: false,
      };

      // Clear the old timeout so we only run the
      // async validators after the waiting period
      // when the value didn't change in the meantime
      this.clearValidationTimeout();

      // No validators - nothing to do here
      if (!Array.isArray(validators) && !Array.isArray(asyncValidators)) {
        this.setState(validationState);

        return validationState;
      }

      // Synchronous validators
      if (Array.isArray(validators)) {
        validationState.valid = validators.every((validator) => {
          const result = validator(value, formContext);
          const parsedResult = parseValidationError(this.fullName, result);

          if (isIFieldErrorObject(parsedResult)) {
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
        const parsedErrors = errors.map(error => parseValidationError(this.fullName, error));

        validationState.error = parsedErrors.filter(isIFieldErrorObject);
        validationState.valid = validationState.error.length === 0;

        if (validationState.error.length === 0) { validationState.error = null; }

        validationState.isValidating = false;
        this.asyncTimeout = undefined;

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

      this.asyncTimeout = setTimeout(performAsyncValidation, asyncValidationWait);

      this.updateAndNotify(validationState);

      return validationState;
    }

    /**
     * Updates the validation state and notifies the form
     * @param newState New validation state
     */
    private updateAndNotify(newState: IValidationState): void {
      const { context } = this.props;

      // Don't do anything if the component has already been
      // unmounted. This can happen when the validated Field
      // is already removed while there are async validators
      // running in the background.
      if (this.unmounted) { return; }

      this.setState(newState);
      context.notifyFieldEvent(this.fullName, 'validation', newState);
    }

    // tslint:disable-next-line:member-ordering
    public render(): JSX.Element {
      const {
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
          fullName={this.fullName}
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
export const withValidation = <T extends IValidationProps & IFormContextProps>(WrappedComponent: React.ComponentType<T>):
  React.ComponentType<Subtract<TWrappedValidatedComponentProps<T>, IFormContextProps>> => {
  return withForm(baseWithValidation(WrappedComponent));
};
