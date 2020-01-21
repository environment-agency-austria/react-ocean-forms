/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module FormButton
 * @category Components
 * @preferred
 */
import React from 'react';

import { useFormContext } from '../../hooks';
import { IFormButtonProps } from './FormButton.types';

/**
 * Defines a button that integrates into the form context. It will
 * be disabled when the form is busy or disabled. You can also pass
 * submitArgs to the onSubmit handler this way.
 */
export const FormButton: React.FC<IFormButtonProps> = (props) => {
  const {
    disabled = false,
    type = 'submit',
    submitArgs,
    component: Component = 'button',
    onClick = (): void => undefined,
    ...rest
  } = props;

  const { busy, disabled: formDisabled, submit } = useFormContext();

  const buttonDisabled = busy || formDisabled || disabled;

  /**
   * Calls formContext.submit if the button is not
   * disabled and the type is submit with the given
   * submitParams, otherwise just calls the onClick
   * event handler
   */
  const handleClick = (event: React.MouseEvent): void => {
    if (buttonDisabled) {
      event.preventDefault();

      return;
    }

    if (type === 'submit') {
      event.preventDefault();
      void submit(submitArgs);
    }

    onClick(event);
  };

  return <Component type={type} disabled={buttonDisabled} onClick={handleClick} {...rest} />;
};
