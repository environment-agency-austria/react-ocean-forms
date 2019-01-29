import { useContext } from 'react';

import { FormContext } from './FormContext';
import { IFieldValues, IFormContext } from './FormContext.types';

// tslint:disable-next-line:export-name naming-convention
export const useFormContext = <TFieldValues = IFieldValues>(): IFormContext<TFieldValues> => {
  const context = useContext(<React.Context<IFormContext<TFieldValues> | undefined>>FormContext);
  if (context === undefined) {
    throw new Error('[useFormContext]: Could not find form context. This component must be used inside a <Form> tag.');
  }

  return context;
};
