/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { FormContext, IFieldValues } from '../FormContext';
import { IFormProps } from './Form.types';
import { useForm } from './hooks/useForm';

/**
 * The form is the main component. It glues together all the Form logic through the context api.
 * All form specific components must be wrapped by a form.
 */
export const Form = <TFieldValues extends {} = IFieldValues, TSubmitArgs = unknown>({ children, className, ...rest }:
React.PropsWithChildren<IFormProps<TFieldValues, TSubmitArgs>>): React.ReactElement | null => {
  const formContext = useForm(rest);

  let formClass = className === undefined ? '' : className;
  if (formContext.plaintext) { formClass = `${formClass} plaintext`; }

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    formContext.submit();
  };

  const handleReset = (event: React.FormEvent): void => {
    event.preventDefault();
    formContext.reset();
  };

  return (
    <FormContext.Provider value={formContext}>
      <form className={formClass} onSubmit={handleSubmit} onReset={handleReset}>
        {children}
      </form>
    </FormContext.Provider>
  );
};
