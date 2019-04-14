import { useMemo, useState, useRef, useCallback } from 'react';

import { stringFormatter as defaultStringFormatter, noopFunction, parseValidationError, getDeepValue } from '../../../utils';
import { IBasicValidationState } from '../../../hooks';
import { IFormContext, IFieldState, IFieldValues } from '../../FormContext';
import { IFormProps } from '../Form.types';
import { useFieldEvents } from '../../../hooks/internal';

export function useForm(props: IFormProps): IFormContext {
  const [ busyState, setBusyState ] = useState(false);
  const fields = useRef(new Map<string, IFieldState>());

  const {
    defaultValues = { },
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

  /**
   * Returns the current state of the given field
   * @param name Field name
   * @returns Current field state or default field state
   */
  const getFieldState = useCallback((name: string): IFieldState => {
    const fieldState = fields.current.get(name);
    if (fieldState === undefined) {
      throw new Error(`[Form] getFieldState: Could not find state of field '${name}'`);
    }

    return fieldState;
  }, []);

  /**
   * Generates and returns an object that contains
   * all values from all the fields.
   * @returns Current values in form of { name: value, name2: value2, ... }
   */
  const getValues = useCallback((): IFieldValues => {
    const values: IFieldValues = {};

    fields.current.forEach((state, name) => {
      if (state.isGroup === true) { return; }

      const nameParts = name.split('.');
      let valueRef = values;

      nameParts.forEach((key, index) => {
        if (nameParts.length === 1 || index === nameParts.length - 1) {
          valueRef[key] = state.getValue();
        } else {
          if (valueRef[key] === undefined) { valueRef[key] = {}; }
          valueRef = valueRef[key] as IFieldValues;
        }
      });
    });

    return values;
  }, []);

  /**
   * Registers a new field to the form.
   * @param name Field name
   * @param fieldState Field state
   */
  const registerField = useCallback((name: string, fieldState: IFieldState): void => {
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

    fields.current.set(name, fieldState);
  }, []);

  /**
   * Unregisters a field from the form.
   * @param name Field name
   */
  const unregisterField = useCallback((name: string): void => {
    const { label } = getFieldState(name);
    notifyListeners(name, 'validation', {
      label,
      valid: true,
    });
    fields.current.delete(name);
  }, [getFieldState, notifyListeners]);

  /**
   * Sets the state of all fields back
   * to the default state.
   */
  const reset = useCallback((): void => {
    fields.current.forEach((state) => {
      state.reset();
    });

    if (onReset !== undefined) {
      onReset();
    }
  }, [onReset]);

  /**
   * Triggers the form wide validation callback if given
   * @returns Validation state of the form
   */
  const triggerFormValidation = useCallback((): boolean => {
    const values = getValues();
    const result = onValidate(values);

    // If the callback returned null then the form is valid
    if (result === null || result === undefined) { return true; }

    // Otherwise parse the result object and update the
    // field states.
    let allFieldsValid = true;
    fields.current.forEach((state, name) => {
      const fieldError = parseValidationError(getDeepValue(name, result));
      const isValid = fieldError === null || typeof fieldError !== 'object';

      if (isValid) { return; }

      state.updateValidation({
        valid: false,
        error: fieldError,
      });
      allFieldsValid = false;
    });

    return allFieldsValid;
  }, [getValues, onValidate]);

  /**
   * Submits the form - triggers any validations if needed
   * and raises the onFormSubmit prop callback if the
   * form is currently valid.
   * @param submitArgs Arguments that will be passed
   * to the onSubmit callback
   */
  const submit = useCallback(async (submitArgs?: unknown): Promise<void> => {
    setBusyState(true);

    // Iterate through all fields and validate them
    // if needed.
    const validations: Promise<IBasicValidationState>[] = [];
    fields.current.forEach(field => {
      validations.push(field.validate({
        checkAsync: true,
        immediateAsync: true,
      }));
    });

    const validationStates = await Promise.all(validations);

    // Check if all fields are valid
    const allValid = validationStates.every(state => state.valid === true);
    if (allValid === false) {
      notifyListeners('_form', 'submit-invalid');
      setBusyState(false);

      return;
    }

    // Call the form wide validation
    const formValid = triggerFormValidation();
    if (formValid === false) {
      notifyListeners('_form', 'submit-invalid');
      setBusyState(false);

      return;
    }

    // Await the result from callOnSubmit
    const callOnSubmitResult = onSubmit(getValues(), submitArgs);

    // Make sure the state is cleaned up before
    const cleanup = (resetForm: boolean | undefined): void => {
      setBusyState(false);
      if (resetForm) { reset(); }
    };
    if (callOnSubmitResult instanceof Promise) {
      void callOnSubmitResult.then(
        () => { cleanup(resetOnSubmit); },
      );
    } else {
      cleanup(resetOnSubmit);
    }
  }, [getValues, notifyListeners, onSubmit, reset, resetOnSubmit, triggerFormValidation]);

  const formContext: IFormContext = useMemo(() => ({
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
  }), [
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
    values
  ]);

  return formContext;
}
