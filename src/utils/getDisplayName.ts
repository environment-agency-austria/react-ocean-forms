/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
 */
// tslint:disable-next-line:naming-convention
export const getDisplayName = (wrappedComponent: IObjectWithName | IObjectWithDisplayName | unknown): string => {
  if (stringHasValue((<IObjectWithDisplayName>wrappedComponent).displayName)) {
    return <string>(<IObjectWithDisplayName>wrappedComponent).displayName;
  }
  if (stringHasValue((<IObjectWithName>wrappedComponent).name)) { return <string>(<IObjectWithName>wrappedComponent).name; }

  return 'Component';
};
