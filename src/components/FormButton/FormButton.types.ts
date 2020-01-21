/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module FormButton
 */
import React from 'react';

/**
 * Props for the FormButton component
 */
export interface IFormButtonProps {
  /**
   * Type of the button, either submit, reset or button.
   * @default submit
   */
  type?: string;
  /**
   * Optional object that will be passed as the second parameter
   * to form.onSubmit if the button is of submit type.
   */
  submitArgs?: unknown;
  /**
   * True, if the button should be always disabled. If set to false
   * it will be still disabled if the form context is busy or disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Can be used to render any other component other than the standard html button.
   * @default button
   */
  component?: React.ReactType;
  /**
   * OnClick callback. Will be triggered after the form.onSubmit call.
   * @param event event
   */
  onClick?(event: React.MouseEvent): void;
}
