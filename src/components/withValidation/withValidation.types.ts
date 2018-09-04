import { IFieldErrorObject, TFieldErrors } from '../../validators';
import { TFieldValue } from '../Field';
import { IFormContextProps } from '../withForm';

/**
 * Interface with properties describing the current
 * validation state and offering interfaces for
 * various validation tasks
 */
export interface IValidationProp {
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
  /**
   * Triggers the validation of the field
   * @param value Field value
   * @param args Validation args @see IValidationArgs
   */
  validate(value: TFieldValue, args?: IValidationArgs): Promise<IValidationState>;
  /**
   * Resets the validation state
   */
  reset(): void;
  /**
   * Forces a new validation state on this Field
   * @param state New validation state
   */
  update(state: IValidationComponentState): void;
}

/**
 * Interface for consumers of withValidation props
 */
export interface IValidationProps extends IFormContextProps {
  /**
   * Full Name of the component
   * (context.fieldPrefix + '.' + fieldName)
   */
  fullName: string;
  /**
   * Validation properties, describes the current
   * validation state of the component
   */
  validation: IValidationProp;
}

export interface IValidationState {
  valid: boolean;
  error: null | IFieldErrorObject | IFieldErrorObject[];
  isValidating: boolean;
  asyncTimeout?: number;
}

export interface IValidationComponentState extends IValidationState {
  fullName: string;
}

export interface IValidationArgs {
  checkAsync: boolean;
  immediateAsync: boolean;
}
