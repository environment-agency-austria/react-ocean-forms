/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { IFieldComponentProps } from '../Field';

/**
 * Props for the Input component
 */
export interface IInputProps extends IFieldComponentProps {
  /**
   * Input type (e.g. text, number, ...)
   */
  type: string;
}
