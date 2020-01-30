/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module FieldGroup
 */
import { useCallback, useMemo } from 'react';

import {
  useFormContext,
  useValidation,
  IValidationArgs,
  IBasicValidationState,
} from '../../../hooks';
import { useFullName, useFieldRegistration } from '../../../hooks/internal';
import { IFormContext, IFieldValues } from '../../FormContext';

import { getGroupValue } from './useFieldGroup.utils';
import { IUseFieldGroupArgs, IUseFieldGroupResult } from './useFieldGroup.types';

/**
 * @hidden
 */
export function useFieldGroup<TFieldValue = unknown>(
  props: IUseFieldGroupArgs<TFieldValue>
): IUseFieldGroupResult {
  const formContext = useFormContext();

  const {
    name,
    label,
    defaultValues,
    values,
    disabled = formContext.disabled,
    plaintext = formContext.plaintext,
    asyncValidateOnChange = formContext.asyncValidateOnChange,
  } = props;

  const fullName = useFullName(name);
  const { validationState, validate, resetValidation, updateValidationState } = useValidation(
    props
  );

  /**
   * Triggers the validation of the group
   */
  const validateGroup = useCallback(
    (args?: Partial<IValidationArgs>): Promise<IBasicValidationState> => {
      const groupValue = getGroupValue<TFieldValue>(formContext, fullName);
      return validate(groupValue, args);
    },
    [formContext, fullName, validate]
  );

  // Register the group in the formContext, so the group
  // validation can be called on form submit.
  const registerFieldState = useMemo(
    () => ({
      label,
      isGroup: true,
      updateValidation: updateValidationState,
      validate: validateGroup,
      reset: resetValidation,
      getValue: () => ({}),
    }),
    [label, resetValidation, updateValidationState, validateGroup]
  );
  useFieldRegistration(fullName, registerFieldState);

  /**
   * Listens to child field events, triggers validation if
   * needed and passes them to the higher context
   * @param name Field name
   * @param event Event name
   * @param args Event args
   */
  const notifyFieldEvent = useCallback(
    (name: string, event: string, args?: unknown): void => {
      formContext.notifyFieldEvent(name, event, args);

      if (event !== 'change' && event !== 'blur') {
        return;
      }

      if (event === 'change') {
        const localName = name.substring(fullName.length + 1);

        const currentGroupValue = getGroupValue<TFieldValue>(formContext, fullName);
        const intermediateGroupValue = {
          ...(currentGroupValue === undefined ? {} : currentGroupValue),
          ...{
            // Override the value of the event sender, because
            // the Field didn't update its state yet, making the
            // Form.getValues() returning an old Field value.
            [localName]: args,
          },
        };

        void validate(intermediateGroupValue as TFieldValue, { checkAsync: asyncValidateOnChange });
      } else if (!asyncValidateOnChange) {
        void validate(getGroupValue(formContext, fullName));
      }
    },
    [asyncValidateOnChange, formContext, fullName, validate]
  );

  const subContext: IFormContext = useMemo(
    () => ({
      ...formContext,
      fieldPrefix: fullName,
      notifyFieldEvent,
      disabled,
      plaintext,
      defaultValues: (defaultValues === undefined
        ? formContext.defaultValues
        : { ...formContext.defaultValues, ...{ [fullName]: defaultValues } }) as Partial<
        IFieldValues
      >,
      values: (values === undefined
        ? formContext.values
        : { ...formContext.values, ...{ [fullName]: values } }) as Partial<IFieldValues>,
    }),
    [defaultValues, disabled, formContext, fullName, notifyFieldEvent, plaintext, values]
  );

  const groupState = useMemo(
    () => ({
      fullName,
      isValidating: validationState.isValidating,
      isRequired: validationState.isRequired,
      valid: validationState.valid,
      error: validationState.error,
    }),
    [fullName, validationState]
  );

  return {
    groupFormContext: subContext,
    renderParams: groupState,
  };
}
