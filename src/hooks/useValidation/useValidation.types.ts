import { TFieldErrors, TValidator, TAsyncValidator } from '../../validators';
import { TBasicFieldValue } from '../useField';

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
export type TValidateMethod = (value: TBasicFieldValue, args?: Partial<IValidationArgs>) => Promise<IBasicValidationState>;
export type TResetMethod = () => void;
/**
 * Update validation state method
 * @param state Validation state overrides
 */
export type TUpdateMethod = (state: Partial<IBasicValidationState>) => void;

/**
 * Result of the useValidation hook
 */
export interface IUseValidationResult {
  /**
   * Current validation state
   */
  validationState: IValidationState;
  /**
   * Triggers the validation
   * @see TValidateMethod
   */
  validate: TValidateMethod;
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
export interface IUseValidationArgs {
  /**
   * Field name
   */
  name: string;
  /**
   * Synchronous validators
   */
  validators?: TValidator[];
  /**
   * Asynchronous validators
   */
  asyncValidators?: TAsyncValidator[];
  /**
   * Wait time in ms that should pass after
   * the last user input before the async
   * validators will be triggered
   */
  asyncValidationWait?: number;
}
