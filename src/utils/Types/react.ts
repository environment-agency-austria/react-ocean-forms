/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

/**
 * Acquire the props for a Component {T}
 */
export type PropsOf<T> =
  // tslint:disable-next-line:no-any
  T extends (props: infer P) => React.ReactElement | null // Try to infer for SFCs
  ? P
  : T extends new (props: infer P) => React.Component // Otherwise try to infer for classes
    ? P
    : never;
