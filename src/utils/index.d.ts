/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export { default as getDisplayName } from './getDisplayName';
export { default as getDeepValue } from './getDeepValue';
export { default as toArray } from './toArray';
export * from './stringHasValue';

/*
 * parseValidationError
 */
interface IValidationError {
  message_id: string,
  params: {},
}
type ValidationError = IValidationError | string;
/**
 * Parses the validation error and returns either
 * a validation object or undefined
 * @param name field name
 * @param error error message
 */
export function parseValidationError(name: string, error: ValidationError): IValidationError;

/**
 * Uses the parameterized string and replaces the
 * templates with the values passed as the second
 * parameter.
 * @param id Message id to be formatted
 * @param values Parameter values
 */
export function stringFormatter(id: string, values: {}): any;

/**
 * Adds custom messages to be supported by the
 * stringFormatter
 * @param {object} messages Object containing messages
 */
export function addCustomMessages(messages: {}): any;
