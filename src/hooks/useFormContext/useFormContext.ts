/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module useFormContext
 * @category Hooks
 * @preferred
 */
import { useContext } from 'react';

import { IFieldValues, IFormContext, FormContext } from '../../components/FormContext';

/**
 * Returns the FormContext of the current closure.
 * Throws an error if no form context could be found.
 */
export function useFormContext<TFieldValues = IFieldValues>(): IFormContext<TFieldValues> {
  const context = useContext(FormContext as React.Context<IFormContext<TFieldValues> | undefined>);
  if (context === undefined) {
    throw new Error(
      '[useFormContext]: Could not find form context. This component must be used inside a <Form> tag.'
    );
  }

  return context;
}
