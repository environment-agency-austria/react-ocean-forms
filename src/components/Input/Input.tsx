/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';

import { IFieldComponentProps } from '../Field';
import { FieldLine } from '../FieldLine';

interface IInputProps extends IFieldComponentProps {
  // tslint:disable-next-line:no-reserved-keywords
  type: string;
}

/**
 * Component for displaying bootstrap
 * form groups with an html input and
 * oForm support
 */
export const Input: React.SFC<IInputProps> = (props: IInputProps): JSX.Element => {
  const {
    field,
    type,
    meta,
  } = props;

  return (
    <FieldLine {...props}>
      {meta.plaintext ? field.value : <input type={type} {...field} />}
    </FieldLine>
  );
};

Input.displayName = 'Input';

Input.defaultProps = {
  type: 'text',
};
