/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { IFormContext } from '../components/FormContext';
import { TBasicFieldValue } from '../components/withField';
import { FieldErrorMessageId, TAsyncValidator, TFieldError, TValidator } from './validators.types';

/**
 * Wrapper function to call validators with parameters
 * @param validator function to call
 * @param context form context
 * @param args parameters for the validator
 */
const withParam = <TCallback extends TValidator | TAsyncValidator>(validator: TCallback, ...args: unknown[]): TCallback => {
  return (value: TBasicFieldValue, context: IFormContext): ReturnType<TCallback> => validator(value, context, args);
};

/**
 * Checks if there is any value
 * @param value field value
 */
const required = (value: TBasicFieldValue): TFieldError => {
  // Special check for empty arrays
  if (Array.isArray(value)) {
    return value.length === 0 ? FieldErrorMessageId.Required : undefined;
  }

  if (typeof value === 'number') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value === false ? FieldErrorMessageId.Required : undefined;
  }

  if (typeof value === 'string') {
    return value.length === 0 ? FieldErrorMessageId.Required : undefined;
  }

  return value !== null && value !== undefined ? undefined : FieldErrorMessageId.Required;
};
required.isDefaultValidator = true;

/**
 * Checks if the value is alpha numeric
 */
const alphaNumeric = (value: TBasicFieldValue): TFieldError => {
  if (typeof value !== 'string') { return undefined; }

  return /[^a-zA-Z0-9 ]/i.test(value) ? FieldErrorMessageId.AlphaNumeric : undefined;
};

/**
 * Checks if the given value has the minimum
 * length
 * @param value field value
 * @param context form context
 * @param length minimum length
 */
const minLength = (value: TBasicFieldValue, context: IFormContext, [length]: [number]): TFieldError => {
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
const maxLength = (value: TBasicFieldValue, context: IFormContext, [length]: [number]): TFieldError => {
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
  return object !== null && object !== undefined && typeof (<ILength>object).length === 'number';
}

// tslint:disable-next-line:naming-convention
export const validators = {
  withParam,
  required,
  alphaNumeric,
  minLength,
  maxLength,
};
