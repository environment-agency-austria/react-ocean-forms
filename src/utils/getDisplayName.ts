/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Returns the display name of the wrapped component.
 */
export default function getDisplayName(wrappedComponent: React.ComponentType): string {
  return wrappedComponent.displayName || wrappedComponent.name || 'Component';
}