/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { getDisplayName, PropsOf, Subtract } from '../../utils';
import { ValidationWrapper, IValidationProp, IValidatedComponentProps } from '../ValidationWrapper';
import { IValidationProps } from './withValidation.types';

type WrappedValidatedComponentProps<TComp> =
  Subtract<JSX.LibraryManagedAttributes<TComp, PropsOf<TComp>>, IValidationProps> & IValidatedComponentProps;

/**
 * Higher order component for validation
 * @deprecated
 */
export const withValidation = <TComp extends React.ComponentType<TProps>, TProps extends IValidationProps = PropsOf<TComp>>
(component: TComp): React.ComponentType<WrappedValidatedComponentProps<TComp>> => {

  const CastedComponent = component as React.ComponentType<TProps>;

  type IWrappedProps = WrappedValidatedComponentProps<TComp>;

  const validatedComponent: React.SFC<IWrappedProps> = (props: IWrappedProps): JSX.Element => {
    const renderComponent = (fullName: string, validation: IValidationProp): JSX.Element => {
      // @ts-ignore
      return <CastedComponent fullName={fullName} validation={validation} {...props} />;
    };

    return (
      <ValidationWrapper
        {...props}
        render={renderComponent}
      />
    );
  };
  validatedComponent.displayName = `ValidatedComponent(${getDisplayName(component)})`;

  return validatedComponent;
};
