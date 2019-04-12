/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { getDisplayName, PropsOf, Subtract } from '../../utils';
import { IValidationProps, IValidationProp, IValidatedComponentProps } from './withValidation.types';
import { useValidation, useFullName } from '../../hooks';

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

  const ValidatedComponent: React.SFC<IWrappedProps> = ({ name, validators, asyncValidators, asyncValidationWait, ...rest }): JSX.Element => {
    const fullName = useFullName(name);
    const {
      validationState,
      validate,
      resetValidation,
      updateValidationState,
    } = useValidation(
      fullName,
      validators,
      asyncValidators,
      asyncValidationWait
    );

    const validationProp: IValidationProp = {
      ...validationState,
      reset: resetValidation,
      validate,
      update: updateValidationState,
    };

    // @ts-ignore
    return <CastedComponent fullName={fullName} validation={validationProp} {...rest} />;
  };
  ValidatedComponent.displayName = `ValidatedComponent(${getDisplayName(component)})`;

  return ValidatedComponent;
};
