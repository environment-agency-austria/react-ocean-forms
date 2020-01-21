/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module FormText
 */
import { IMessageValues } from '../../utils';

/**
 * FormText component props
 */
export interface IFormTextProps {
  /**
   * Text or message id
   */
  text: string | null;
  /**
   * Optional parameters that should be replaced in the message.
   */
  values?: IMessageValues;
}
