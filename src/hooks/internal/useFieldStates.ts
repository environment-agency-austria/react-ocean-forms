import { useRef, useCallback } from 'react';

import { IValidationArgs, IBasicValidationState, TUpdateMethod } from '../useValidation';

/**
 * Interface describing field states
 */
export interface IFieldState {
  /**
   * Label of the field
   */
  label: string;
  /**
   * True if the field is actually a FieldGroup
   */
  isGroup?: boolean;
  /**
   * Triggers the validation of this field
   * @param args Validation args
   */
  validate(args?: Partial<IValidationArgs>): Promise<IBasicValidationState>;
  /**
   * Returns the current value of the field
   */
  getValue(): unknown;
  /**
   * Resets the field to its initial state
   */
  reset(): void;
  /**
   * Updates the validation state of the field
   * @param state New validation state
   */
  updateValidation: TUpdateMethod;
}

export interface IUseFieldStatesResult {
  getFieldState(name: string): IFieldState;
  registerField(name: string, fieldState: IFieldState): void;
  unregisterField(name: string): void;
  forEachFieldState(
    callback: (value: IFieldState, key: string, map: Map<string, IFieldState>) => void
  ): void;
}

export function useFieldStates(): IUseFieldStatesResult {
  const fields = useRef(new Map<string, IFieldState>());

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
      typeof fieldState.label !== 'string' ||
      typeof fieldState.validate !== 'function' ||
      typeof fieldState.updateValidation !== 'function' ||
      typeof fieldState.reset !== 'function' ||
      typeof fieldState.getValue !== 'function'
    ) {
      throw new Error('[Form] registerField: invalid field state given');
    }

    if (fields.current.has(name)) {
      throw new Error(
        `[Form] registerField: Could not register field with name '${name}'. A field with this name already exists inside this form.`
      );
    }

    fields.current.set(name, fieldState);
  }, []);

  /**
   * Unregisters a field from the form.
   * @param name Field name
   */
  const unregisterField = useCallback((name: string): void => {
    fields.current.delete(name);
  }, []);

  const forEachFieldState = useCallback(
    (callback: (value: IFieldState, key: string, map: Map<string, IFieldState>) => void) => {
      return fields.current.forEach(callback);
    },
    []
  );

  return {
    getFieldState,
    registerField,
    unregisterField,
    forEachFieldState,
  };
}
