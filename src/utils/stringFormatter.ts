/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module stringFormatter
 * @category Utils
 */

export interface IMessageValues {
  [s: string]: string;
}

export type TSTringFormatter = (id: string, values?: IMessageValues) => string;

interface IMessages {
  [s: string]: string;
}

let DEFAULT_MESSAGES: IMessages = {
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
 * @param id Message id to be formatted
 * @param values Parameter values
 */
export const stringFormatter: TSTringFormatter = (id: string, values?: IMessageValues): string => {
  // Do nothing if the id is not a string
  if (typeof id !== 'string') {
    return id;
  }

  // Either use one of the default messages or
  // the string as a literal
  let formattedString = id;
  if (DEFAULT_MESSAGES[id] !== undefined) {
    formattedString = DEFAULT_MESSAGES[id];
  }

  // If no values are specified do nothing
  if (!values) {
    return formattedString;
  }
  if (typeof values !== 'object') {
    return formattedString;
  }
  if (Array.isArray(values)) {
    return formattedString;
  }

  // Iterate through each value and replace the
  // value inside the string
  Object.keys(values).forEach((key: string) => {
    const search = new RegExp(`{${key}}`, 'g');
    formattedString = formattedString.replace(search, values[key]);
  });

  return formattedString;
};

/**
 * Adds custom messages to be supported by the
 * stringFormatter
 * @param messages Object containing messages
 */
export const addCustomMessages = (messages: IMessages): void => {
  DEFAULT_MESSAGES = {
    ...DEFAULT_MESSAGES,
    ...messages,
  };
};
