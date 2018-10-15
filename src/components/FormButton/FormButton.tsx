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
export class BaseFormButton extends React.Component<IFormButtonProps> {
  public static displayName: string = 'FormButton';

  // tslint:disable-next-line:typedef
  public static defaultProps = {
    component: 'button',
    type: 'submit',
    disabled: false,
    onClick: (): void => undefined,
  };

  /**
   * Calls formContext.submit if the button is not
   * disabled and the type is submit with the given
   * submitParams, otherwise just calls the onClick
   * event handler
   */
  private handleClick = (event: MouseEvent): void => {
    const {
      context: { busy, disabled: formDisabled, submit },
      type,
      submitArgs,
      onClick,
      disabled,
    } = this.props;

    const buttonDisabled = busy || formDisabled || disabled;

    if (buttonDisabled) {
      event.preventDefault();

      return;
    }

    if (type === 'submit') {
      event.preventDefault();
      void submit(submitArgs);
    }

    onClick(event);
  }

  // tslint:disable-next-line:member-ordering
  public render(): JSX.Element {
    const {
      context: { busy, disabled: formDisabled },
      disabled,
      type,
      // tslint:disable-next-line:naming-convention
      component: Component,
      onClick,
      ...rest
    } = this.props;

    const buttonDisabled = busy || formDisabled || disabled;

    return (
      <Component
        type={type}
        disabled={buttonDisabled}
        onClick={this.handleClick}
        {...rest}
      />
    );

  }
}

export const FormButton = withForm(BaseFormButton);
