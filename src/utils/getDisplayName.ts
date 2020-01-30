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
import { stringHasValue } from './stringHasValue';

interface IObjectWithDisplayName {
  displayName?: string;
}

interface IObjectWithName {
  name?: string;
}

/**
 * Returns the display name of the wrapped component.
 * @hidden
 */
export const getDisplayName = (
  wrappedComponent: IObjectWithName | IObjectWithDisplayName | unknown
): string => {
  if (stringHasValue((wrappedComponent as IObjectWithDisplayName).displayName)) {
    return (wrappedComponent as IObjectWithDisplayName).displayName as string;
  }
  if (stringHasValue((wrappedComponent as IObjectWithName).name)) {
    return (wrappedComponent as IObjectWithName).name as string;
  }

  return 'Component';
};
