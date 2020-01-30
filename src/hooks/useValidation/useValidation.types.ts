/**
 * Copyright (c) 2019-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module useValidation
 */
import { TFieldErrors, TValidator, TAsyncValidator } from '../../validators';

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

/**
 * Validation method
 * @param value Value to validate
 * @param args Optional validation args, @see IValidationArgs
 */
export type TValidateMethod<TFieldValue = unknown> = (
  value: TFieldValue | undefined,
  args?: Partial<IValidationArgs>
) => Promise<IBasicValidationState>;
export type TResetMethod = () => void;
/**
 * Update validation state method
 * @param state Validation state overrides
 */
export type TUpdateMethod = (state: Partial<IBasicValidationState>) => void;

/**
 * Result of the useValidation hook
 */
export interface IUseValidationResult<TFieldValue = unknown> {
  /**
   * Current validation state
   */
  validationState: IValidationState;
  /**
   * Triggers the validation
   * @see TValidateMethod
   */
  validate: TValidateMethod<TFieldValue>;
  /**
   * Resets the validation to default
   */
  resetValidation: TResetMethod;
  /**
   * Overwrites the validation state
   * @see TUpdateMethod
   */
  updateValidationState: TUpdateMethod;
}

/**
 * Properties of a component that is wrapped
 * by withValidation
 */
export interface IUseValidationArgs<TFieldValue = unknown> {
  /**
   * Name of this input. Will be used as the unique identifier of this value.
   * **Must be unique inside its context (e.g. form wide or form group wide)!**
   */
  name: string;
  /**
   * Message id of the label that will be displayed along the input. If you don't
   * want to use any i18n features you can pass a raw message instead.
   */
  label: string;
  /**
   * Contains an array of functions that will validate this input. Those functions are called whenever
   * the value changes (on keypress, ...). They are called in order and whenever one fails the other ones
   * are not called. The validator function must return either undefined or a string containing the message
   * id of the validation error text.
   */
  validators?: TValidator<TFieldValue>[];
  /**
   * Contains an array of functions that must return a Promise. Those functions are called by default onBlur,
   * however this behaviour can be changed by setting asyncValidateOnChange on the Form. The Form will call
   * all async validators of a Field at the same time and will wait for the result of every one of them. If
   * one of them returns a string the field will be marked as invalid. Per default the form will wait for 400ms
   * before triggering any validation. This is put in place so the validation won't get triggered on every
   * keystroke of the user. The async validators will be called 400ms after the last value change.
   */
  asyncValidators?: TAsyncValidator<TFieldValue>[];
  /**
   * Wait time in ms that should pass after
   * the last user input before the async
   * validators will be triggered
   * @default Form.asyncValidationWait
   */
  asyncValidationWait?: number;
}
