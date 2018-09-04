/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { stringHasValue } from './stringHasValue';

/**
 * Returns the display name of the wrapped component.
 */
export const getDisplayName = (wrappedComponent: React.ComponentType): string => {
  if (stringHasValue(wrappedComponent.displayName)) { return wrappedComponent.displayName; }
  if (stringHasValue(wrappedComponent.name)) { return wrappedComponent.name; }

  return 'Component';
};
