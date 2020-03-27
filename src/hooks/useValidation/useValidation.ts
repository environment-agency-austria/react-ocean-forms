/**
 * Copyright (c) 2019-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module useValidation
 * @category Hooks
 * @preferred
 */

import { useCallback, useState, useMemo } from 'react';

import { useFormContext } from '../useFormContext';
import { useIsUnmounted, useTimeout, useFullName } from '../internal';

import {
  IBasicValidationState,
  IUseValidationResult,
  IValidationArgs,
  IUseValidationArgs,
} from './useValidation.types';
import {
  createInitialValidationState,
  isRequired,
  runSyncValidators,
  runAsyncValidators,
} from './useValidation.utils';

export function useValidation<TFieldValue = unknown>(
  args: IUseValidationArgs<TFieldValue>
): IUseValidationResult<TFieldValue> {
  const formContext = useFormContext();
  const isUnmounted = useIsUnmounted();
  const [validationState, setValidationState] = useState<IBasicValidationState>(
    createInitialValidationState()
  );
  const [setAsyncTimeout, clearAsyncTimeout] = useTimeout();
  const fullName = useFullName(args.name);

  const {
    label,
    validators,
    asyncValidators,
    asyncValidationWait = formContext.asyncValidationWait,
  } = args;

  /**
   * Updates the current validation state and raises
   * a `validation` form event for the current field
   */
  const updateAndNotify = useCallback(
    (newState: Partial<IBasicValidationState>): void => {
      if (isUnmounted.current) return;

      setValidationState((prevState) => {
        const fullNewState = {
          ...prevState,
          ...newState,
        };

        formContext.notifyFieldEvent(fullName, 'validation', { ...fullNewState, label });
        return fullNewState;
      });
    },
    [isUnmounted, formContext, fullName, label]
  );

  /**
   * Resets the validation state to the initial value and
   * clears any pending async validations
   */
  const reset = useCallback(() => {
    clearAsyncTimeout();
    updateAndNotify(createInitialValidationState());
  }, [clearAsyncTimeout, updateAndNotify]);

  /**
   * Performs the sync and async validation logic
   */
  const validate = useCallback(
    async (
      value: TFieldValue | undefined,
      { checkAsync = true, immediateAsync = false }: Partial<IValidationArgs> = {}
    ): Promise<IBasicValidationState> => {
      let temporaryValidationState = createInitialValidationState();

      // Clear the old timeout so we only run the
      // async validators after the waiting period
      // when the value didn't change in the meantime
      clearAsyncTimeout();

      // No validators - nothing to do here
      if (!Array.isArray(validators) && !Array.isArray(asyncValidators)) {
        setValidationState(temporaryValidationState);
        return temporaryValidationState;
      }

      // Update the local validation state with the results of sync validation
      temporaryValidationState = {
        ...temporaryValidationState,
        ...runSyncValidators(validators, value, formContext),
      };

      // Ignore async validation if sync validation is already false
      // or checkAsync is disabled or there are no async validators
      if (
        temporaryValidationState.valid === false ||
        !checkAsync ||
        !Array.isArray(asyncValidators)
      ) {
        updateAndNotify(temporaryValidationState);
        return temporaryValidationState;
      }

      // Calls the async validators, updates and notifies the field / form
      // about the validation results
      const performAsyncValidation = async (): Promise<IBasicValidationState> => {
        clearAsyncTimeout();

        const asyncValidationResult = await runAsyncValidators(asyncValidators, value, formContext);
        updateAndNotify(asyncValidationResult);
        return asyncValidationResult;
      };

      // Execute async validators immediatly if configured
      if (immediateAsync === true) {
        return performAsyncValidation();
      }

      // Sets a timeout to run the async validation and notifies the form
      // about the is validating status
      setAsyncTimeout(performAsyncValidation, asyncValidationWait);
      temporaryValidationState.isValidating = true;
      updateAndNotify(temporaryValidationState);
      return temporaryValidationState;
    },
    [
      clearAsyncTimeout,
      validators,
      asyncValidators,
      setAsyncTimeout,
      asyncValidationWait,
      updateAndNotify,
      formContext,
    ]
  );

  const validationResult = useMemo<IUseValidationResult<TFieldValue>>(
    () => ({
      validationState: {
        ...validationState,
        isRequired: isRequired(validators),
      },
      validate,
      resetValidation: reset,
      updateValidationState: updateAndNotify,
    }),
    [reset, updateAndNotify, validate, validationState, validators]
  );

  return validationResult;
}
