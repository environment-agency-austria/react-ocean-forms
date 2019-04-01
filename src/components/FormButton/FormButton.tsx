/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { useFormContext } from '../../hooks';
import { IFormButtonProps } from './FormButton.types';

/**
 * Wrapper for a button that will
 * automatically disable the button if the
 * form is busy
 */
export const FormButton: React.FunctionComponent<IFormButtonProps> = (props: IFormButtonProps): JSX.Element => {
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

  // @ts-ignore Waiting for https://github.com/Microsoft/TypeScript/issues/28768 to be fixed
  return <Component type={type} disabled={buttonDisabled} onClick={handleClick} {...rest} />;
};
