/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let DEFAULT_MESSAGES = {
  ojs_error_required: 'This field is mandatory.',
  ojs_error_alphaNumeric: 'Only alpha-numeric input is allowed.',
  ojs_error_minLength: 'The value must be at least {length} characters long.',
  ojs_error_maxLength: 'The value must be less than {length} characters long.',
  ojs_field_required: 'Required',
  ojs_form_validationSummaryHeader: 'Errors',
};
export const TEST_MESSAGES = DEFAULT_MESSAGES;

/**
 * Uses the parameterized string and replaces the
 * templates with the values passed as the second
 * parameter.
 * @param {string} id Message id to be formatted
 * @param {object} values Parameter values
 */
export default (id, values) => {
  // Do nothing if the id is not a string
  if (typeof id !== 'string') return id;

  // Either use one of the default messages or
  // the string as a literal
  let string = id;
  if (DEFAULT_MESSAGES[id] !== undefined) {
    string = DEFAULT_MESSAGES[id];
  }

  // If no values are specified do nothing
  if (!values) return string;
  if (typeof values !== 'object') return string;
  if (Array.isArray(values)) return string;

  // Iterate through each value and replace the
  // value inside the string
  Object.entries(values).forEach(([key, value]) => {
    const search = new RegExp(`{${key}}`, 'g');
    string = string.replace(search, value);
  });

  return string;
};

/**
 * Adds custom messages to be supported by the
 * stringFormatter
 * @param {object} messages Object containing messages
 */
export const addCustomMessages = (messages) => {
  DEFAULT_MESSAGES = {
    ...DEFAULT_MESSAGES,
    ...messages,
  };
};
