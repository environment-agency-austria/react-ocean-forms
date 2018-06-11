/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Returns an array with the parameter as its only element if
 * the parameter is not an array. Otherwise it returns an array
 */
export default function toArray(param) {
  if (!Array.isArray(param)) {
    return [param];
  }
  return param;
}
