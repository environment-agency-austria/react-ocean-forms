import { useMemo, useState, useCallback } from 'react';

import { IBaseFieldProps, IValidatedComponentProps, IFieldComponentFieldProps, IFieldComponentMeta, TBasicFieldValue, IFieldChangedEvent } from '../components';
import { useFormContext } from './useFormContext';
import { useFullName } from './useFullName';
import { useValidation, IValidationArgs, IBasicValidationState } from './useValidation';
import { useFieldRegistration } from './useFieldRegistration';

export interface IUseFieldProps extends IBaseFieldProps, IValidatedComponentProps { }

export interface IUseFieldResult {
  fieldProps: IFieldComponentFieldProps;
  metaProps: IFieldComponentMeta;
}

interface IUseFieldState {
  touched: boolean;
  dirty: boolean;
  value: TBasicFieldValue;
}

function noopFunction(): void { }

function noopFieldValueFunction(value: TBasicFieldValue): TBasicFieldValue {
  return value;
}

export function useField(props: IUseFieldProps): IUseFieldResult {
  const {
    getSubmitValue = noopFieldValueFunction,
    getDisplayValue = noopFieldValueFunction,
    onChange = noopFunction,
    onBlur = noopFunction,
  } = props;

  const [ fieldState, setFieldState ] = useState<IUseFieldState>({ touched: false, dirty: false, value: '' })
  const formContext = useFormContext();
  const fullName = useFullName(props.name);
  const { validationState, validate, resetValidation, updateValidationState } = useValidation(
    fullName,
    props.validators,
    props.asyncValidators,
    props.asyncValidationWait,
  );

  const isDisabled = props.disabled === undefined ? formContext.disabled : props.disabled;
  const isPlaintext = props.plaintext === undefined ? formContext.plaintext : props.plaintext;

  const getFieldValue = useCallback(
    () => {
      return getSubmitValue(
        fieldState.value,
        {
          disabled: isDisabled,
          plaintext: isPlaintext,
        },
      );
    },
    [fieldState.value, isDisabled, isPlaintext, getSubmitValue],
  );

  const resetField = useCallback(
    () => {
      const displayValue = getDisplayValue(
        fieldState.value === undefined ? '' : fieldState.value,
        {
          disabled: isDisabled,
          plaintext: isPlaintext,
        },
      );

      setFieldState({
        value: displayValue,
        touched: false,
        dirty: false,
      });
      resetValidation();
      onChange(displayValue);
    },
    [fieldState.value, getDisplayValue, isDisabled, isPlaintext, onChange, resetValidation],
  );

  const validateField = useCallback(
    async (args?: Partial<IValidationArgs>): Promise<IBasicValidationState> => {
      return validate(
        getSubmitValue(
          fieldState.value,
          {
            disabled: isDisabled,
            plaintext: isPlaintext,
          },
        ),
        args,
      );
    },
    [fieldState.value, getSubmitValue, isDisabled, isPlaintext, validate],
  );

  useFieldRegistration(
    fullName,
    props.label,
    false,
    updateValidationState,
    validateField,
    resetField,
    getFieldValue,
  );

  const asyncValidateOnChange = props.asyncValidateOnChange === undefined ? formContext.asyncValidateOnChange : props.asyncValidateOnChange;

  const handleFieldChanged = useCallback(
    (event: IFieldChangedEvent) => {
      setFieldState({
        value: event.target.value,
        touched: true,
        dirty: true,
      });

      const submitValue = getSubmitValue(
        fieldState.value,
        {
          disabled: isDisabled,
          plaintext: isPlaintext,
        },
      );

      validate(
        submitValue,
        { checkAsync: asyncValidateOnChange },
      );

      formContext.notifyFieldEvent(fullName, 'change', submitValue);
      onChange(submitValue);
    },
    [asyncValidateOnChange, fieldState.value, formContext, fullName, getSubmitValue, isDisabled, isPlaintext, onChange, validate],
  );

  const handleFieldBlur = useCallback(
    () => {
      const submitValue = getSubmitValue(
        fieldState.value,
        {
          disabled: isDisabled,
          plaintext: isPlaintext,
        },
      );

      if (fieldState.dirty && !asyncValidateOnChange) {
        validate(submitValue);
      }
      formContext.notifyFieldEvent(fullName, 'blur');
      onBlur();
    },
    [asyncValidateOnChange, fieldState.dirty, fieldState.value, formContext, fullName, getSubmitValue, isDisabled, isPlaintext, onBlur, validate],
  );

  const fieldProps = useMemo(
    (): IFieldComponentFieldProps => ({
      value: fieldState.value,
      disabled: isDisabled,
      id: fullName,
      name: fullName,
      onChange: handleFieldChanged,
      onBlur: handleFieldBlur,
    }),
    [fieldState.value, isDisabled, fullName, handleFieldChanged, handleFieldBlur],
  );

  const metaProps = useMemo(
    (): IFieldComponentMeta => ({
      valid: validationState.valid,
      error: validationState.error,
      isValidating: validationState.isValidating,
      isRequired: validationState.isRequired,
      touched: fieldState.touched,
      stringFormatter: formContext.stringFormatter,
      plaintext: props.plaintext === undefined ? formContext.plaintext : props.plaintext,
    }),
    [formContext.plaintext, formContext.stringFormatter, props.plaintext, fieldState.touched, validationState.error, validationState.isRequired, validationState.isValidating, validationState.valid],
  );

  return {
    fieldProps,
    metaProps,
  }
}
