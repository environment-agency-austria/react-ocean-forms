/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { IMessageValues } from '../../utils';
import { IFormContextProps } from '../withForm';

/**
 * FormText component props
 */
export interface IFormTextProps extends IFormContextProps {
  /**
   * Text or message id
   */
  text: string | null;
  /**
   * Optional values for the stringFormatter
   */
  values?: IMessageValues;
}
