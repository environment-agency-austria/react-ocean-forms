/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from 'react';

import { withForm } from '../withForm';
import { IFormButtonProps } from './FormButton.types';

/**
 * Wrapper for a button that will
 * automatically disable the button if the
 * form is busy
 */
// tslint:disable-next-line:one-variable-per-declaration
// tslint:disable-next-line:max-line-length
export const BaseFormButton: React.SFC<IFormButtonProps> = (
  {
    context: { busy, disabled: formDisabled, submit },
    disabled,
    type,
    onClick,
    submitArgs,
    component: Component,
    ...rest
  }: IFormButtonProps,
): JSX.Element => {
  BaseFormButton.defaultProps = {
    component: 'button',
    type: 'submit',
    submitArgs: undefined,
    disabled: false,
    onClick: (): void => undefined,
  };

  const buttonDisabled = busy || formDisabled || disabled;

  /**
   * Calls formContext.submit if the button is not
   * disabled and the type is submit with the given
   * submitParams, otherwise just calls the onClick
   * event handler
   */
  const handleClick = (event: MouseEvent): void => {
    if (buttonDisabled) {
      event.preventDefault();

      return;
    }

    if (type === 'submit') {
      event.preventDefault();
      submit(submitArgs);
    }

    onClick(event);
  };

  // Type is provided by the props
  return (
    <Component
      type={type}
      disabled={buttonDisabled}
      onClick={handleClick}
      {...rest}
    />
  );
};

BaseFormButton.defaultProps = {
  disabled: false,
  type: 'submit',
  onClick: ((): void => undefined),
  component: 'button',
};
BaseFormButton.displayName = 'FormButton';

export const FormButton = withForm(BaseFormButton);
