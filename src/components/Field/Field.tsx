/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { useField } from '../../hooks';
import { IFieldProps } from './Field.types';

export const Field: React.FC<IFieldProps> = ({ render, ...otherProps }) => {
  const { fieldProps, metaProps } = useField(otherProps);
  return render(
    fieldProps,
    metaProps,
  );
};
