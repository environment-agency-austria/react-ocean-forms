/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module Input
 * @category Components
 * @preferred
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
export const Input = <TSubmitValue extends unknown>(
  props: IInputProps<TSubmitValue>
): JSX.Element => {
  const { type = 'text', ...rest } = props;

  const { fieldProps, metaProps } = useField(rest);

  return (
    <FieldLine {...props} field={fieldProps} meta={metaProps}>
      {metaProps.plaintext ? fieldProps.value : <input type={type} {...fieldProps} />}
    </FieldLine>
  );
};
