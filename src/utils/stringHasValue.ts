/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module parseValidationError
 * @category Utils
 */

/**
 * Returns TRUE if a string s has a value.
 * FALSE is returned, if s is undefined, null or empty.
 * @hidden
 */
export function stringHasValue(s: string | null | undefined): s is string {
  if (s === undefined || s === null) {
    return false;
  }

  return s.length > 0;
}
