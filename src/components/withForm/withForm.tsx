/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module withForm
 * @category Legacy higher order components
 * @preferred
 */

import React from 'react';
import { getDisplayName, PropsOf, Subtract } from '../../utils';
import { useFormContext } from '../../hooks';
import { IFormContextProps } from './withForm.types';

/**
 * Internal type for form component props. Deals with the
 * defaultProp logic and removes the form context props.
 */
type FormComponentProps<TComp> = Subtract<
  JSX.LibraryManagedAttributes<TComp, PropsOf<TComp>>,
  IFormContextProps
>;

/**
 * High order component for consuming the form context
 * @deprecated Deprecated in favour of `useFormContext` hook
 */
export const withForm = <
  TComp extends React.ComponentType<TProps>,
  TProps extends IFormContextProps = PropsOf<TComp>
>(
  Component: TComp
): React.ComponentType<FormComponentProps<TComp>> => {
  /**
   * We need to cast the component back to a
   * React.ComponentType in order to use it in
   * the FormContext.Consumer. Otherwise
   * typescript will cry about the component
   * not having a constructor / call signatures.
   */
  const CastedComponent = Component as React.ComponentType<TProps>;

  /**
   * Component that injects the form context prop
   * to the wrapped component
   */
  const FormComponent: React.FC<FormComponentProps<TComp>> = (props) => {
    const context = useFormContext();

    // @ts-ignore
    return <CastedComponent {...props} context={context} />;
  };
  FormComponent.displayName = `FormComponent(${getDisplayName(Component)})`;

  return FormComponent;
};
