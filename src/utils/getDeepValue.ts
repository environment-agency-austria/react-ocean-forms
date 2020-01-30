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

// Local type for better readability
interface TStringProp {
  [prop: string]: any;
}

/**
 * Returns the 'deep' value of an object. For example
 * you can provide the string 'foo.bar.baz' to get
 * the value of the third nested object.
 * @param name Name / property path
 * @param object Object
 * @hidden
 */
export const getDeepValue = <T, U extends TStringProp = TStringProp>(
  name: string,
  object?: U
): T | undefined => {
  return name.split('.').reduce((o: U | undefined, i: string) => {
    // Workaround for deep objects and
    // 'cannot read property of undefined'
    // - is there a better way?
    if (o === undefined) {
      return undefined;
    }
    if (o[i] === null) {
      return undefined;
    }

    return o[i];
  }, object) as T | undefined;
};
