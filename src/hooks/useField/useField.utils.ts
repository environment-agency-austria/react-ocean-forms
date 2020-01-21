/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module useField
 */

/**
 * Function that will directly return the passed value
 * @param value Field value
 * @hidden
 */
export function noopFieldValueFunction(value: unknown | undefined): unknown | undefined {
  return value;
}
