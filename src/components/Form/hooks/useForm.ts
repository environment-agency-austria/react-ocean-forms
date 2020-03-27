/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module Form
 */
import { useMemo, useState, useCallback } from 'react';

import {
  stringFormatter as defaultStringFormatter,
  noopFunction,
  parseValidationError,
  getDeepValue,
} from '../../../utils';
import { IBasicValidationState } from '../../../hooks';
import { IFormContext, IFieldValues } from '../../FormContext';
import { IFormProps } from '../Form.types';
import { useFieldEvents, useFieldStates, useIsUnmounted } from '../../../hooks/internal';

/**
 * @hidden
 */
export function useForm<TFieldValues extends Record<string, unknown> = IFieldValues>(
  props: IFormProps<TFieldValues>
): IFormContext<TFieldValues> {
  const [busyState, setBusyState] = useState(false);

  const {
    defaultValues = {},
    values,
    asyncValidationWait = 400,
    asyncValidateOnChange = false,
    formatString = defaultStringFormatter,
    disabled = false,
    plaintext = false,
    busy = busyState,
    resetOnSubmit,
    onReset = noopFunction,
    onSubmit = noopFunction,
    onValidate = noopFunction,
  } = props;

  const { registerListener, unregisterListener, notifyListeners } = useFieldEvents();
  const { getFieldState, registerField, unregisterField, forEachFieldState } = useFieldStates();
  const isUnmounted = useIsUnmounted();

  /**
   * Generates and returns an object that contains
   * all values from all the fields.
   * @returns Current values in form of { name: value, name2: value2, ... }
   */
  const getValues = useCallback((): TFieldValues => {
    const values = {} as TFieldValues;

    forEachFieldState((state, name) => {
      if (state.isGroup === true) {
        return;
      }

      const nameParts = name.split('.');
      let valueRef: Record<string, unknown> = values;

      nameParts.forEach((key, index) => {
        if (nameParts.length === 1 || index === nameParts.length - 1) {
          valueRef[key] = state.getValue();
        } else {
          if (valueRef[key] === undefined) {
            valueRef[key] = {};
          }
          valueRef = valueRef[key] as TFieldValues;
        }
      });
    });

    return values;
  }, [forEachFieldState]);

  /**
   * Sets the state of all fields back
   * to the default state.
   */
  const reset = useCallback((): void => {
    forEachFieldState((state) => {
      state.reset();
    });

    onReset();
  }, [forEachFieldState, onReset]);

  /**
   * Triggers the form wide validation callback if given
   * @returns Validation state of the form
   */
  const triggerFormValidation = useCallback((): boolean => {
    const values = getValues();
    const result = onValidate(values);

    // If the callback returned null then the form is valid
    if (result === null || result === undefined) {
      return true;
    }

    // Otherwise parse the result object and update the
    // field states.
    let allFieldsValid = true;
    forEachFieldState((state, name) => {
      const fieldError = parseValidationError(getDeepValue(name, result));
      const isValid = fieldError === null || typeof fieldError !== 'object';

      if (isValid) {
        return;
      }

      state.updateValidation({
        valid: false,
        error: fieldError,
      });
      allFieldsValid = false;
    });

    return allFieldsValid;
  }, [forEachFieldState, getValues, onValidate]);

  /**
   * Submits the form - triggers any validations if needed
   * and raises the onFormSubmit prop callback if the
   * form is currently valid.
   * @param submitArgs Arguments that will be passed
   * to the onSubmit callback
   */
  const submit = useCallback(
    async (submitArgs?: unknown): Promise<void> => {
      setBusyState(true);

      // Iterate through all fields and validate them
      // if needed.
      const validations: Promise<IBasicValidationState>[] = [];
      forEachFieldState((field) => {
        validations.push(
          field.validate({
            checkAsync: true,
            immediateAsync: true,
          })
        );
      });
      const validationStates = await Promise.all(validations);

      const notifyInvalid = (): void => {
        notifyListeners('_form', 'submit-invalid');
        setBusyState(false);
      };

      // Check if all fields are valid
      const allValid = validationStates.every((state) => state.valid === true);
      if (allValid === false) {
        notifyInvalid();
        return;
      }

      // Call the form wide validation
      const formValid = triggerFormValidation();
      if (formValid === false) {
        notifyInvalid();
        return;
      }

      // Await the result from callOnSubmit
      const callOnSubmitResult = onSubmit(getValues(), submitArgs);

      // Make sure the state is cleaned up before
      const cleanup = (resetForm: boolean | undefined): void => {
        if (isUnmounted.current) return;

        setBusyState(false);
        if (resetForm) {
          reset();
        }
      };
      if (callOnSubmitResult instanceof Promise) {
        void callOnSubmitResult.then(() => {
          cleanup(resetOnSubmit);
        });
      } else {
        cleanup(resetOnSubmit);
      }
    },
    [
      forEachFieldState,
      getValues,
      isUnmounted,
      notifyListeners,
      onSubmit,
      reset,
      resetOnSubmit,
      triggerFormValidation,
    ]
  );

  const formContext: IFormContext<TFieldValues> = useMemo(
    () => ({
      fieldPrefix: null,
      defaultValues,
      values,
      asyncValidationWait,
      stringFormatter: formatString,
      disabled,
      plaintext,
      busy,
      asyncValidateOnChange,

      registerField,
      unregisterField,

      notifyFieldEvent: notifyListeners,
      registerListener,
      unregisterListener,

      getFieldState: getFieldState,
      getValues: getValues,

      reset,
      submit,
    }),
    [
      asyncValidateOnChange,
      asyncValidationWait,
      busy,
      defaultValues,
      disabled,
      formatString,
      getFieldState,
      getValues,
      notifyListeners,
      plaintext,
      registerField,
      registerListener,
      reset,
      submit,
      unregisterField,
      unregisterListener,
      values,
    ]
  );

  return formContext;
}
