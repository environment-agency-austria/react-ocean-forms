/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from 'react';
import { IMessageValues } from '../../utils';
import { IFormContextProps, withForm } from '../withForm';

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

/**
 * Wrapper component for passing strings to the
 * context.stringFormatter method
 */
export const BaseFormText: React.SFC<IFormTextProps> = ({ context, text, values }: IFormTextProps): JSX.Element | null => {
  if (!text) { return null; }

  return (
    <React.Fragment>
      {context.stringFormatter(text, values)}
    </React.Fragment>
  );
};
BaseFormText.displayName = 'FormText';

export const FormText = withForm(BaseFormText);
