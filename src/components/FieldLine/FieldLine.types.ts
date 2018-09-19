/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { TValidator } from '../../validators';
import { IFieldComponentProps } from '../Field';

/**
 * Field Line properties
 */
export interface IFieldLineProps extends IFieldComponentProps {
  /**
   * Field label
   */
  label: string;
  /**
   * Validators
   */
  validators?: TValidator[];
  /**
   * Children
   */
  children: React.ReactNode;
}
