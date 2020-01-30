/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module validators
 * @category Validation
 * @preferred
 */

import { IFormContext } from '../components';
import { FieldErrorMessageId, TAsyncValidator, TFieldError, TValidator } from './validators.types';

/**
 * Wrapper function to call validators with parameters
 * @param validator function to call
 * @param context form context
 * @param args parameters for the validator
 */
const withParam = (validator: TValidator, ...args: unknown[]): TValidator => {
  return (value: unknown, context: IFormContext): TFieldError => validator(value, context, args);
};
/**
 * Wrapper function to call async validators with parameters
 * @param validator function to call
 * @param context form context
 * @param args parameters for the validator
 */
const withAsyncParam = (validator: TAsyncValidator, ...args: unknown[]): TAsyncValidator => {
  return async (value: unknown, context: IFormContext): Promise<TFieldError> =>
    validator(value, context, args);
};

/**
 * Checks if there is any value
 * @param value field value
 */
const required = (value: unknown): TFieldError => {
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
required.isDefaultValidator = true as const;

/**
 * Checks if the value is alpha numeric
 */
const alphaNumeric = (value: unknown): TFieldError => {
  if (typeof value !== 'string') {
    return undefined;
  }

  return /[^a-zA-Z0-9 ]/i.test(value) ? FieldErrorMessageId.AlphaNumeric : undefined;
};

interface ILength {
  length: number;
}

function isILength(object: any): object is ILength {
  return object !== null && object !== undefined && typeof (object as ILength).length === 'number';
}

/**
 * Checks if the given value has the minimum
 * length
 * @param value field value
 * @param context form context
 * @param length minimum length
 */
const minLength = (value: unknown, context: IFormContext, [length]: [number]): TFieldError => {
  if (!isILength(value)) {
    return undefined;
  }
  if (value.length >= length) {
    return undefined;
  }

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
const maxLength = (value: unknown, context: IFormContext, [length]: [number]): TFieldError => {
  if (!isILength(value)) {
    return undefined;
  }
  if (value.length <= length) {
    return undefined;
  }

  return {
    message_id: FieldErrorMessageId.MaxLength,
    params: {
      length: String(length),
    },
  };
};

export const validators = {
  withParam,
  withAsyncParam,
  required,
  alphaNumeric,
  minLength,
  maxLength,
};
