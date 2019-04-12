/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { TBasicFieldValue, IValidationState, TValidateMethod, TResetMethod, TUpdateMethod } from '../../hooks';
import { TValidator, TAsyncValidator } from '../../validators';

/**
 * Base interface for consumers of withValidation props
 */
export interface IValidationProps<TFieldValue = TBasicFieldValue> {
  /**
   * Full Name of the component
   * (context.fieldPrefix + '.' + fieldName)
   */
  fullName: string;
  /**
   * Validation properties, describes the current
   * validation state of the component
   */
  validation: IValidationProp<TFieldValue>;
}

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
