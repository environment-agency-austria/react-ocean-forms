/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { getDisplayName, PropsOf, Subtract } from '../../utils';
import { IValidatedComponentProps } from '../withValidation';
import { Field, IBaseFieldProps, IFieldComponentFieldProps, IFieldComponentMeta, IFieldComponentProps } from './Field';

type WrappedValidatedComponentProps<TComp> =
  Subtract<JSX.LibraryManagedAttributes<TComp, PropsOf<TComp>>, IFieldComponentProps> & IBaseFieldProps & IValidatedComponentProps;

/**
 * Higher order component for validation
 */
export const withField = <TComp extends React.ComponentType<TProps>, TProps extends IFieldComponentProps = PropsOf<TComp>>
(component: TComp): React.ComponentType<WrappedValidatedComponentProps<TComp>> => {

  // tslint:disable-next-line:naming-convention
  const CastedComponent = component as React.ComponentType<TProps>;

  type IWrappedProps = WrappedValidatedComponentProps<TComp>;

  const validatedComponent: React.SFC<IWrappedProps> = (props: IWrappedProps): JSX.Element => {
    const renderComponent = (field: IFieldComponentFieldProps, meta: IFieldComponentMeta): JSX.Element => {
      // @ts-ignore
      return <CastedComponent field={field} meta={meta} {...props} />;
    };

    return (
      <Field
        {...props}
        render={renderComponent}
      />
    );
  };
  validatedComponent.displayName = `withField(${getDisplayName(component)})`;

  return validatedComponent;
};
