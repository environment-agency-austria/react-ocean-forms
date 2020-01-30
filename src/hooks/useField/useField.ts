/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module useField
 * @category Hooks
 * @preferred
 */
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';

import { getDeepValue, noopFunction } from '../../utils';
import { useFormContext } from '../useFormContext';
import { useValidation, IValidationArgs, IBasicValidationState } from '../useValidation';
import { useFullName, useFieldRegistration } from '../internal';

import {
  IFieldComponentFieldProps,
  IFieldComponentMeta,
  IFieldChangedEvent,
  IUseFieldProps,
  IUseFieldResult,
  IUseFieldState,
  IValueMeta,
  TValueCallback,
} from './useField.types';
import { noopFieldValueFunction } from './useField.utils';

/**
 * Hook for writing custom fields. Will handle the internal state
 * of the field, the validation and all communication with the
 * form context.
 * @param props Field props @see IUseFieldProps
 * @typeparam TDisplayValue Type of the value that will be displayed (consumed by the displaying component)
 * @typeparam TSubmitValue Type of the value that will be submitted to the form
 */
export function useField<TDisplayValue = unknown, TSubmitValue = TDisplayValue>(
  props: IUseFieldProps<TDisplayValue, TSubmitValue>
): IUseFieldResult<TDisplayValue> {
  const formContext = useFormContext();
  const fullName = useFullName(props.name);

  const {
    label,
    getDisplayValue = noopFieldValueFunction as TValueCallback<TSubmitValue, TDisplayValue>,
    getSubmitValue = noopFieldValueFunction as TValueCallback<TDisplayValue, TSubmitValue>,
    onChange = noopFunction,
    onBlur = noopFunction,
    asyncValidateOnChange = formContext.asyncValidateOnChange,
    defaultValue = getDeepValue<TSubmitValue>(fullName, formContext.defaultValues),
    value = getDeepValue<TSubmitValue>(fullName, formContext.values),
    disabled = formContext.disabled,
    plaintext = formContext.plaintext,
  } = props;

  const [fieldState, setFieldState] = useState<IUseFieldState<TDisplayValue>>(
    // Initialize the field state with an empty string provided to getDisplayValue
    // Note: the correct defaultValue / value from props will be overriden in an
    // effect later on
    () => ({
      touched: false,
      dirty: false,
      value: getDisplayValue(defaultValue, { plaintext, disabled }),
    })
  );
  const { validationState, validate, resetValidation, updateValidationState } = useValidation(
    props
  );

  /**
   * Contains the memoized value meta for passing to
   * getSubmitValue and getDisplayValue
   */
  const valueMeta: IValueMeta = useMemo(
    () => ({
      disabled,
      plaintext,
    }),
    [disabled, plaintext]
  );

  /**
   * Returns the current submit value using the getSubmitValue
   * callback and the correct value and value meta parameters
   */
  const getFieldValue = useCallback(
    (valueOverride?: TDisplayValue) => {
      return getSubmitValue(
        valueOverride !== undefined ? valueOverride : fieldState.value,
        valueMeta
      );
    },
    [getSubmitValue, fieldState.value, valueMeta]
  );

  /**
   * Resets the field to its initial state.
   */
  const resetField = useCallback(() => {
    const overridenValue = value === undefined ? defaultValue : value;
    const displayValue = getDisplayValue(overridenValue, valueMeta);

    setFieldState({
      value: displayValue,
      touched: false,
      dirty: false,
    });
    resetValidation();
    onChange(getSubmitValue(displayValue, valueMeta));
  }, [value, defaultValue, getDisplayValue, valueMeta, resetValidation, onChange, getSubmitValue]);

  /**
   * Calls the validation method with the current field value
   */
  const validateField = useCallback(
    async (args?: Partial<IValidationArgs>): Promise<IBasicValidationState> => {
      return validate(getFieldValue(), args);
    },
    [getFieldValue, validate]
  );

  /**
   * Register / unregister the field in the form context
   */
  const registerFieldState = useMemo(
    () => ({
      label,
      isGroup: false,
      updateValidation: updateValidationState,
      validate: validateField,
      reset: resetField,
      getValue: getFieldValue,
    }),
    [getFieldValue, label, resetField, updateValidationState, validateField]
  );
  useFieldRegistration(fullName, registerFieldState);

  /**
   * Effect for overwriting the current field value with either
   * defaultValue or value provided through the props / form context
   */
  const oldPropValue = useRef(value);
  useEffect(() => {
    // If the Field.value / FormContext.value did not change and
    // the field is dirty, do nothing
    if (oldPropValue.current === value && fieldState.dirty) {
      oldPropValue.current = value;
      return;
    }

    // Remember the prop value for later change checks
    oldPropValue.current = value;

    // Check if we have either a defaultValue or a value
    const overridenValue = value === undefined ? defaultValue : value;
    if (overridenValue === undefined) return;

    // Update the field state with the overriden values
    setFieldState({
      value: getDisplayValue(overridenValue, valueMeta),
      touched: false,
      dirty: false,
    });
  }, [defaultValue, fieldState.dirty, getDisplayValue, value, valueMeta]);

  /**
   * Handles the field change event - will run any validations,
   * notify the form context about the change and update its
   * internal state
   */
  const handleFieldChanged = useCallback(
    (event: IFieldChangedEvent<TDisplayValue>) => {
      const updatedValue = event.target.value;
      setFieldState({
        value: updatedValue,
        touched: true,
        dirty: true,
      });

      const submitValue = getFieldValue(updatedValue);

      validate(submitValue, { checkAsync: asyncValidateOnChange });

      formContext.notifyFieldEvent(fullName, 'change', submitValue);
      onChange(submitValue);
    },
    [asyncValidateOnChange, formContext, fullName, getFieldValue, onChange, validate]
  );

  /**
   * Handles the field blur event - will run validations if the
   * field is dirty and the asyncValidateOnChange prop is false
   * (otherwise the async validators would never be called).
   * Notifies the form context and calls the onBlur callback
   */
  const handleFieldBlur = useCallback(() => {
    if (fieldState.dirty && !asyncValidateOnChange) {
      validate(getFieldValue());
    }
    formContext.notifyFieldEvent(fullName, 'blur');
    onBlur();
  }, [
    asyncValidateOnChange,
    fieldState.dirty,
    formContext,
    fullName,
    getFieldValue,
    onBlur,
    validate,
  ]);

  /**
   * Memoize the field props which are designed to be used directly
   * in an input like that:
   * ```jsx
   * <Input {...fieldProps} />
   * ```
   * @see IFieldComponentFieldProps
   */
  const fieldProps = useMemo(
    (): IFieldComponentFieldProps<TDisplayValue> => ({
      value: fieldState.value,
      disabled,
      id: fullName,
      name: fullName,
      onChange: handleFieldChanged,
      onBlur: handleFieldBlur,
    }),
    [fieldState.value, disabled, fullName, handleFieldChanged, handleFieldBlur]
  );

  /**
   * Memoize various meta informations
   * @see IFieldComponentMeta for further details
   */
  const metaProps = useMemo(
    (): IFieldComponentMeta => ({
      valid: validationState.valid,
      error: validationState.error,
      isValidating: validationState.isValidating,
      isRequired: validationState.isRequired,
      touched: fieldState.touched,
      stringFormatter: formContext.stringFormatter,
      plaintext,
    }),
    [
      fieldState.touched,
      formContext.stringFormatter,
      plaintext,
      validationState.error,
      validationState.isRequired,
      validationState.isValidating,
      validationState.valid,
    ]
  );

  return {
    fieldProps,
    metaProps,
  };
}
