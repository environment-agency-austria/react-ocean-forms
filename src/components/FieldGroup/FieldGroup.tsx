/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module FieldGroup
 * @category Components
 * @preferred
 */

import React from 'react';

import { FormContext, IFieldValues } from '../FormContext';
import { IFieldGroupProps } from './FieldGroup.types';
import { useFieldGroup } from './hooks/useFieldGroup';

/**
 * Defines a collection of fields. It combines its values to a
 * sub-object and provides the possibility to attach validators to the group.
 */
export const FieldGroup = <TFieldValues extends {} = IFieldValues>(
  props: React.PropsWithChildren<IFieldGroupProps<TFieldValues>>
): React.ReactElement | null => {
  const { render, ...otherProps } = props;
  const { groupFormContext, renderParams } = useFieldGroup(otherProps);

  return (
    <FormContext.Provider value={groupFormContext}>{render(renderParams)}</FormContext.Provider>
  );
};
