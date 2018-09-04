/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from 'react';
import { IMessageValues } from '../../utils';
import { IFormContextProps, withForm } from '../withForm';

interface IFormTextProps extends IFormContextProps {
  text: string;
  values?: IMessageValues;
}

export const BaseFormText: React.SFC<IFormTextProps> = ({ context, text, values }: IFormTextProps): string | null => {
  if (!text) return null;

  return context.stringFormatter(text, values);
};
BaseFormText.displayName = 'FormText';

export const FormText = withForm(BaseFormText);
