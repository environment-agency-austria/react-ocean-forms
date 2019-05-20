/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { IUseFieldProps } from '../../hooks';

type DefaultHtmlInputValueType = React.InputHTMLAttributes<HTMLInputElement>['value'];

/**
 * Props for the Input component
 */
export interface IInputProps extends IUseFieldProps<DefaultHtmlInputValueType> {
  /**
   * HTML5 input type of the input element.
   * @default 'text'
   */
  type?: string;
}
