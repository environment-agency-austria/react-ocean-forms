import { TValidator, TAsyncValidator } from '../../validators';
import { TValidateMethod, TResetMethod, TUpdateMethod, IValidationState } from '../../hooks';
import { TBasicFieldValue } from '../withField';

/**
 * Properties of a component that is wrapped
 * by withValidation
 */
export interface IValidatedComponentProps {
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

/**
 * Properties of a component that is wrapped
 * by withValidation
 */
export interface IValidationWrapperProps extends IValidatedComponentProps {
  /**
   * Render prop
   * @param fullName Full name of the field
   * @param validation Field validation state
   * @param context Form context @deprecated
   */
  render(fullName: string, validation: IValidationProp): JSX.Element;
}

/**
 * Interface with properties describing the current
 * validation state and offering interfaces for
 * various validation tasks
 */
export interface IValidationProp<TFieldValue = TBasicFieldValue> extends IValidationState {
  /**
   * Triggers the validation of the field
   * @param value Field value
   * @param args Validation args @see IValidationArgs
   */
  validate: TValidateMethod<TFieldValue>;
  /**
   * Resets the validation state
   */
  reset: TResetMethod;
  /**
   * Forces a new validation state on this Field
   * @param state New validation state
   */
  update: TUpdateMethod;
}
