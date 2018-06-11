/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Returns the 'deep' value of an object. For example
 * you can provide the string 'foo.bar.baz' to get
 * the value of the third nested object.
 * @param {string} name Name / property path
 * @param {object} object Object
 */
function getDeepValue(name, object) {
  return name.split('.').reduce((o, i) => {
    // Workaround for deep objects and
    // 'cannot read property of undefined'
    // - is there a better way?
    if (o === undefined) return undefined;
    return o[i];
  }, object);
}

export default getDeepValue;
