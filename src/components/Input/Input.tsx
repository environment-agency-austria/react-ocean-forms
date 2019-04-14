/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { useField } from '../../hooks';
import { FieldLine } from '../FieldLine';
import { IInputProps } from './Input.types';

/**
 * Defines a form line containing a label and an input. Additionally it
 * will render validation messages. If the user adds the required validator
 * then it will mark the field as required as well.
 */
export const Input: React.FC<IInputProps> = (props) => {
  const {
    type = 'text',
    ...rest
  } = props;

  const { fieldProps, metaProps } = useField(rest);

  const fieldValue = fieldProps.value;
  if (typeof fieldValue !== 'string' && fieldValue !== undefined) {
    throw new Error(
      'Incompatible field value supplied for input component '
      + `${fieldProps.id}. Only values with type string or undefined are allowed.`,
    );
  }

  return (
    <FieldLine {...props} field={fieldProps} meta={metaProps}>
      {metaProps.plaintext ? fieldProps.value : <input type={type} {...fieldProps} value={fieldValue} />}
    </FieldLine>
  );
}
