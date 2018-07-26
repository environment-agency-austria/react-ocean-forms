/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import FormContext from '../FormContext';
import { getDisplayName } from '../utils';

/**
 * High order component for consuming the form context
 */
export default function withForm(Component) {
  /**
   * Component that injects the form context prop
   * to the wrapped component
   */
  function FormComponent(props) {
    return (
      <FormContext.Consumer>
        {context => <Component {...props} context={context} />}
      </FormContext.Consumer>
    );
  }

  FormComponent.displayName = `FormComponent(${getDisplayName(Component)})`;
  return FormComponent;
}
