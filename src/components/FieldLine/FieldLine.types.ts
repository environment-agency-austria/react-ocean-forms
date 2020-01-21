/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module FieldLine
 */
import React from 'react';
import { IFieldComponentProps } from '../withField';

/**
 * Field Line properties
 */
export interface IFieldLineProps extends IFieldComponentProps {
  /**
   * Field label
   */
  label: string;
  /**
   * Children
   */
  children: React.ReactNode;
}
