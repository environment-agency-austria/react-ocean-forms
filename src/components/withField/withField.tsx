/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module withField
 * @category Legacy higher order components
 * @preferred
 */
import React from 'react';

import { getDisplayName, PropsOf, Subtract } from '../../utils';
import { useField, IBaseFieldProps, IUseValidationArgs, TBasicFieldValue } from '../../hooks';
import { IFieldComponentProps } from './withField.types';

export type IValidatedComponentProps = IUseValidationArgs;

type WrappedValidatedComponentProps<TComp> = Subtract<
  JSX.LibraryManagedAttributes<TComp, PropsOf<TComp>>,
  IFieldComponentProps
> &
  IBaseFieldProps<TBasicFieldValue, TBasicFieldValue> &
  IUseValidationArgs;

/**
 * Higher order component for validation
 * @deprecated Deprecated in favour of `useField` hook
 */
export const withField = <
  TComp extends React.ComponentType<TProps>,
  TProps extends IFieldComponentProps = PropsOf<TComp>
>(
  component: TComp
): React.ComponentType<WrappedValidatedComponentProps<TComp>> => {
  const CastedComponent = component as React.ComponentType<TProps>;

  type IWrappedProps = WrappedValidatedComponentProps<TComp>;

  const ValidatedComponent: React.FC<IWrappedProps> = (props) => {
    const { fieldProps, metaProps } = useField(props);

    return (
      // @ts-ignore
      <CastedComponent field={fieldProps} meta={metaProps} {...props} />
    );
  };
  ValidatedComponent.displayName = `withField(${getDisplayName(component)})`;

  return ValidatedComponent;
};
