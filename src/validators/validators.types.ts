/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module validators
 */

import { IFormContext } from '../components';
import { IMessageValues } from '../utils/stringFormatter';

/**
 * Enum representing the message id's for field errors.
 */
export enum FieldErrorMessageId {
  AlphaNumeric = 'ojs_error_alphaNumeric',
  MaxLength = 'ojs_error_maxLength',
  MinLength = 'ojs_error_minLength',
  Required = 'ojs_error_required',
}

/**
 * Error object for formatting errors through
 * the stringFormatter method
 */
export interface IFieldErrorObject {
  /**
   * Message id of the error or raw
   * error string
   */
  message_id: string;
  /**
   * Optional parameters for the stringFormatter
   */
  params: IMessageValues;
}

/**
 * Returns true if the given object implements
 * IFIeldErrorObject
 * @param object Object to test
 */
export function isIFieldErrorObject(object: any): object is IFieldErrorObject {
  return object && typeof (object as IFieldErrorObject).message_id === 'string';
}

/**
 * Possible return values of a validator
 */
export type TFieldError = undefined | string | IFieldErrorObject;
/**
 * Possible error states of a validated component
 */
export type TFieldErrors = null | IFieldErrorObject | IFieldErrorObject[];

/**
 * Validator method type
 */
export type TValidator<TFieldValue = unknown> = (
  value: TFieldValue | undefined,
  context: IFormContext,
  ...args: unknown[]
) => TFieldError;
/**
 * Async validator method type
 */
export type TAsyncValidator<TFieldValue = unknown> = (
  value: TFieldValue | undefined,
  context: IFormContext,
  ...args: unknown[]
) => Promise<TFieldError>;

/**
 * Default validator type
 */
export interface IDefaultValidator extends TValidator {
  isDefaultValidator: true;
}

/**
 * Returns true if the given object is a IDefaultValidator
 * @param object Function to test
 */
export function isDefaultValidator(object: any): object is IDefaultValidator {
  return (
    object &&
    typeof object === 'function' &&
    (object as IDefaultValidator).isDefaultValidator === true
  );
}
