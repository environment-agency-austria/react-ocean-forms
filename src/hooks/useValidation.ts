/**
 * Copyright (c) 2019-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useState, useMemo } from 'react';

import { TBasicFieldValue } from '../components';
import { TFieldErrors, TValidator, isDefaultValidator, TAsyncValidator, isIFieldErrorObject } from '../validators';
import { parseValidationError } from '../utils';

import { useFormContext } from './useFormContext';
import { useIsUnmounted } from './useIsUnmounted';
import { useTimeout } from './useTimeout';

export interface IBasicValidationState {
  /**
   * True, if the field is currently validating
   * (asynchronous validation running in background)
   */
  isValidating: boolean;
  /**
   * True, if all validators report a valid state
   */
  valid: boolean;
  /**
   * Contains any errors if available
   */
  error: TFieldErrors;
}

/**
 * Arguments for the validate method
 */
export interface IValidationArgs {
  /**
   * True, if the async validators should
   * be triggered as well, otherwise only
   * the sync validators are triggered
   *
   * Default: true
   */
  checkAsync: boolean;
  /**
   * True, if the async validators should
   * be triggered without any delay
   *
   * Default: false
   */
  immediateAsync: boolean;
}

export interface IValidationState extends IBasicValidationState {
  /**
   * True, if the field is a required field
   * (has a required validator attached)
   */
  isRequired: boolean;
}

export type TValidateMethod<TFieldValue = TBasicFieldValue> = (value: TFieldValue | undefined, args?: Partial<IValidationArgs>) => Promise<IBasicValidationState>;
export type TResetMethod = () => void;
export type TUpdateMethod = (state: Partial<IBasicValidationState>) => void;

export interface IUseValidationResult {
  validationState: IValidationState;
  validate: TValidateMethod;
  resetValidation: TResetMethod;
  updateValidationState: TUpdateMethod;
}

/**
 * Checks if the given validators contain at least one default
 * validator
 * @param validators Sync validators provided through props
 */
function isRequired(validators?: TValidator[]): boolean {
  return Array.isArray(validators) && validators.some(isDefaultValidator);
}

/**
 * Creates the initial / default validation state of a
 * validated component
 * @param validators Sync validators provied through props
 */
function createInitialValidationState(): IBasicValidationState {
  return {
    valid: true,
    error: null,
    isValidating: false,
  }
}

export function useValidation(
  fullName: string,
  validators?: TValidator[],
  asyncValidators?: TAsyncValidator[],
  asyncValidationWait?: number,
): IUseValidationResult {
  const formContext = useFormContext();
  const isUnmounted = useIsUnmounted();
  const [validationState, setValidationState] = useState<IBasicValidationState>(createInitialValidationState());
  const [setAsyncTimeout, clearAsyncTimeout] = useTimeout();

  const updateAndNotify = useCallback(
    (newState: Partial<IBasicValidationState>) => {
      if (isUnmounted.current) { return; }

      const fullNewState = {
        ...validationState,
        ...newState,
      };

      setValidationState(fullNewState);
      formContext.notifyFieldEvent(fullName, 'validation', fullNewState);
    },
    [ isUnmounted, fullName, formContext, validationState ],
  );

  const reset = useCallback(
    () => updateAndNotify(createInitialValidationState()),
    [ updateAndNotify ],
  );

  const validate = useCallback(
    async <TFieldValue = TBasicFieldValue>(
      value: TFieldValue,
      {
        checkAsync = true,
        immediateAsync = false,
      }: Partial<IValidationArgs> = {},
    ): Promise<IBasicValidationState> => {
      const temporaryValidationState = createInitialValidationState();

      // Clear the old timeout so we only run the
      // async validators after the waiting period
      // when the value didn't change in the meantime
      clearAsyncTimeout();

      // No validators - nothing to do here
      if (!Array.isArray(validators) && !Array.isArray(asyncValidators)) {
        setValidationState(temporaryValidationState);
        return temporaryValidationState;
      }

      // Synchronous validators
      if (Array.isArray(validators)) {
        temporaryValidationState.valid = validators.every((validator) => {
          const result = validator(value as unknown as TBasicFieldValue, formContext);
          const parsedResult = parseValidationError(fullName, result);

          if (isIFieldErrorObject(parsedResult)) {
            temporaryValidationState.error = parsedResult;

            return false;
          }

          return true;
        });
      }

      // Ignore async validation if sync validation is already false
      if (temporaryValidationState.valid === false) {
        updateAndNotify(temporaryValidationState);

        return temporaryValidationState;
      }

      // Only run async validation if needed
      if (!checkAsync || !Array.isArray(asyncValidators)) {
        updateAndNotify(temporaryValidationState);

        return temporaryValidationState;
      }

      // Asynchronous validators
      const performAsyncValidation = async (): Promise<IBasicValidationState> => {
        const validatorFunctions = asyncValidators.map(async validator => validator(
          value as unknown as TBasicFieldValue,
          formContext,
        ));

        const errors = await Promise.all(validatorFunctions);
        const parsedErrors = errors.map(error => parseValidationError(fullName, error));

        temporaryValidationState.error = parsedErrors.filter(isIFieldErrorObject);
        temporaryValidationState.valid = temporaryValidationState.error.length === 0;

        if (temporaryValidationState.error.length === 0) { temporaryValidationState.error = null; }

        temporaryValidationState.isValidating = false;

        clearAsyncTimeout();
        updateAndNotify(temporaryValidationState);

        return temporaryValidationState;
      };

      temporaryValidationState.isValidating = true;

      if (immediateAsync === true) {
        updateAndNotify(temporaryValidationState);

        return performAsyncValidation();
      }

      // Get the correct wait setting
      const correctAsyncValidationWait = asyncValidationWait === undefined
        ? formContext.asyncValidationWait
        : asyncValidationWait;

      setAsyncTimeout(performAsyncValidation, correctAsyncValidationWait);
      updateAndNotify(temporaryValidationState);

      return temporaryValidationState;
    },
    [
      clearAsyncTimeout,
      setAsyncTimeout,
      updateAndNotify,
      validators,
      asyncValidators,
      asyncValidationWait,
      fullName,
      formContext,
    ],
  );

  const fullValidationState = useMemo(() => ({
    ...validationState,
    isRequired: isRequired(validators),
  }), [ validators, validationState ]);

  return {
    validationState: fullValidationState,
    validate,
    resetValidation: reset,
    updateValidationState: updateAndNotify,
  }
}
