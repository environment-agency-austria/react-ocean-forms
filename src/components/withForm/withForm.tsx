/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { getDisplayName, Subtract } from '../../utils';
import { FormContext, IFormContext } from '../FormContext';
import { IFormContextProps } from './withForm.types';

/**
 * High order component for consuming the form context
 */
export const withForm = <T extends IFormContextProps>(Component: React.ComponentType<T>): React.SFC<Subtract<T, IFormContextProps>> => {
  /**
   * Component that injects the form context prop
   * to the wrapped component
   */
  type FormComponentProps = Subtract<T, IFormContextProps>;
  // tslint:disable-next-line:naming-convention
  const FormComponent: React.SFC<FormComponentProps> = (props: FormComponentProps): JSX.Element => {
    return (
      <FormContext.Consumer>
        {(context: IFormContext): JSX.Element => <Component {...props} context={context} />}
      </FormContext.Consumer>
    );
  };
  FormComponent.displayName = `FormComponent(${getDisplayName(Component)})`;

  return FormComponent;
};
