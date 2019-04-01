/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useContext } from 'react';

import { FormContext } from '../components/FormContext/FormContext';
import { IFieldValues, IFormContext } from '../components/FormContext/FormContext.types';

/**
 * Returns the FormContext of the current closure.
 * Throws an error if no form context could be found.
 */
export const useFormContext = <TFieldValues = IFieldValues>(): IFormContext<TFieldValues> => {
  const context = useContext(<React.Context<IFormContext<TFieldValues> | undefined>>FormContext);
  if (context === undefined) {
    throw new Error('[useFormContext]: Could not find form context. This component must be used inside a <Form> tag.');
  }

  return context;
};