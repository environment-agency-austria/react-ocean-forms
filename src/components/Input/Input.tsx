/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';

import { FieldLine } from '../FieldLine';
import { IInputProps } from './Input.types';

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

  const fieldValue = field.value;
  if (typeof fieldValue !== 'string' && fieldValue !== undefined) {
    throw new Error(
      'Incompatible field value supplied for input component '
      + `${field.id}. Only values with type string or undefined are allowed.`,
    );
  }

  return (
    <FieldLine {...props}>
      {meta.plaintext ? field.value : <input type={type} {...field} value={fieldValue} />}
    </FieldLine>
  );
};

Input.displayName = 'Input';

Input.defaultProps = {
  type: 'text',
};
