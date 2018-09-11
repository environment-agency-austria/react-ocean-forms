/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TFieldValue } from '../components/Field';
import { IFormContext } from '../components/FormContext';
import { FieldErrorMessageId, TFieldError, TValidator } from './validators.types';

/**
 * Wrapper function to call validators with parameters
 * @param validator function to call
 * @param context form context
 * @param args parameters for the validator
 */
const withParam = (validator: TValidator, ...args: unknown[]): TValidator => {
  return (value: TFieldValue, context: IFormContext): TFieldError => validator(value, context, args);
};

/**
 * Checks if there is any value
 * @param value field value
 */
const required = (value: TFieldValue): TFieldError => {
  // Special check for empty arrays
  if (Array.isArray(value) && value.length === 0) { return FieldErrorMessageId.Required; }
  if (value === 0) { return undefined; }

  return value ? undefined : FieldErrorMessageId.Required;
};

/**
 * Checks if the value is alpha numeric
 */
const alphaNumeric = (value: TFieldValue): TFieldError => {
  if (typeof value !== 'string') { return undefined; }

  return value && /[^a-zA-Z0-9 ]/i.test(value) ? FieldErrorMessageId.AlphaNumeric : undefined;
};

/**
 * Checks if the given value has the minimum
 * length
 * @param value field value
 * @param context form context
 * @param length minimum length
 */
const minLength = (value: TFieldValue, context: IFormContext, [length]: [number]): TFieldError => {
  if (!isILength(value)) { return undefined; }
  if (value.length >= length) { return undefined; }

  return {
    message_id: FieldErrorMessageId.MinLength,
    params: {
      length: String(length),
    },
  };
};

/**
 * Checks if the given value has the maximum
 * length
 * @param value field value
 * @param context form context
 * @param length maximum length
 */
const maxLength = (value: TFieldValue, context: IFormContext, [length]: [number]): TFieldError => {
  if (!isILength(value)) { return undefined; }
  if (value.length <= length) { return undefined; }

  return {
    message_id: FieldErrorMessageId.MaxLength,
    params: {
      length: String(length),
    },
  };
};

interface ILength {
  length: number;
}

// tslint:disable-next-line:no-any
function isILength(object: any): object is ILength {
  return object && typeof object.length === 'number';
}

export const validators = {
  withParam,
  required,
  alphaNumeric,
  minLength,
  maxLength,
};
