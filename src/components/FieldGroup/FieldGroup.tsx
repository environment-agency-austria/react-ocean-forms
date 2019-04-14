/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { FormContext } from '../FormContext';
import { IFieldGroupProps } from './FieldGroup.types';
import { useFieldGroup } from './hooks/useFieldGroup';

/**
 * Wrapper for groups of input fields
 * managed by the form component
 */
export const FieldGroup: React.FC<IFieldGroupProps> = ({ render, ...props }): JSX.Element => {
  const { groupFormContext, renderParams } = useFieldGroup(props);

  return (
    <FormContext.Provider value={groupFormContext}>
      {render(renderParams)}
    </FormContext.Provider>
  );
}
