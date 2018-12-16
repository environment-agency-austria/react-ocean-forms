/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from 'react';
import { stringHasValue } from './stringHasValue';

/**
 * Returns the display name of the wrapped component.
 */
// tslint:disable-next-line:naming-convention
export const getDisplayName = (wrappedComponent: React.ComponentType): string => {
  if (stringHasValue(wrappedComponent.displayName)) { return wrappedComponent.displayName; }
  // @ts-ignore
  if (stringHasValue(wrappedComponent.name)) { return wrappedComponent.name; }

  return 'Component';
};
