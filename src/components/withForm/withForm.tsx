/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { getDisplayName, PropsOf, Subtract } from '../../utils';
import { FormContext, IFormContext } from '../FormContext';
import { IFormContextProps } from './withForm.types';

/**
 * Internal type for form component props. Deals with the
 * defaultProp logic and removes the form context props.
 */
type FormComponentProps<TComp> = Subtract<JSX.LibraryManagedAttributes<TComp, PropsOf<TComp>>, IFormContextProps>;

/**
 * High order component for consuming the form context
 * @deprecated Deprecated in favour of `useFormContext` hook
 */
export const withForm = <TComp extends React.ComponentType<TProps>, TProps extends IFormContextProps = PropsOf<TComp>>(Component: TComp):
React.ComponentType<FormComponentProps<TComp>> => {
  /**
   * We need to cast the component back to a
   * React.ComponentType in order to use it in
   * the FormContext.Consumer. Otherwise
   * typescript will cry about the component
   * not having a constructor / call signatures.
   */
  // tslint:disable-next-line:naming-convention
  const CastedComponent = Component as React.ComponentType<TProps>;

  /**
   * Component that injects the form context prop
   * to the wrapped component
   */
  // tslint:disable-next-line:naming-convention
  const FormComponent: React.SFC<FormComponentProps<TComp>> = (props: FormComponentProps<TComp>): JSX.Element => {
    return (
      <FormContext.Consumer>
        {(context: IFormContext): JSX.Element => {
          // @ts-ignore
          return <CastedComponent {...props} context={context} />;
        }}
      </FormContext.Consumer>
    );
  };
  FormComponent.displayName = `FormComponent(${getDisplayName(Component)})`;

  return FormComponent;
};
