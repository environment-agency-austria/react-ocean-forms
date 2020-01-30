/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module react
 * @category Type Utils
 */

import React from 'react';

/**
 * Acquire the props for a Component {T}
 */
export type PropsOf<T> = T extends (props: infer P) => React.ReactElement | null // Try to infer for SFCs
  ? P
  : T extends new (props: infer P) => React.Component // Otherwise try to infer for classes
  ? P
  : never;
