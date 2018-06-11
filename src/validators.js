/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Wrapper function to call validators with parameters
 * @param {function} validator function to call
 * @param {object} context form context
 * @param {array} args parameters for the validator
 */
const withParam = (validator, ...args) => ((value, context) => validator(value, context, args));

/**
 * Checks if there is any value
 * @param {object} value field value
 */
const required = (value) => {
  // Special check for empty arrays
  if (Array.isArray(value) && value.length === 0) return 'ojs_error_required';
  if (value === 0) return undefined;

  return value ? undefined : 'ojs_error_required';
};

/**
 * Checks if the value is alpha numeric
 * TODO: Real implementation
 */
const alphaNumeric = value => (value && /[^a-zA-Z0-9 ]/i.test(value) ? 'ojs_error_alphaNumeric' : undefined);

/**
 * Checks if the given value has the minimum
 * length
 * @param {object} value field value
 * @param {object} context form context
 * @param {number} length minimum length
 */
const minLength = (value, context, [length]) => {
  if (value.length >= length) return undefined;

  return {
    message_id: 'ojs_error_minLength',
    params: {
      length: String(length),
    },
  };
};

/**
 * Checks if the given value has the maximum
 * length
 * @param {object} value field value
 * @param {object} context form context
 * @param {number} length maximum length
 */
const maxLength = (value, context, [length]) => {
  if (value.length <= length) return undefined;

  return {
    message_id: 'ojs_error_maxLength',
    params: {
      length: String(length),
    },
  };
};

export default {
  withParam,
  required,
  alphaNumeric,
  minLength,
  maxLength,
};
