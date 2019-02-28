/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

/**
 * Props for the FormButton component
 */
export interface IFormButtonProps {
  /**
   * Button type
   */
  type?: string;
  /**
   * Optional submit args, will be passed to the
   * form submit function
   */
  submitArgs?: unknown;
  /**
   * Disabled state of the button
   */
  disabled?: boolean;
  /**
   * Component that should be rendered instead of the
   * default html button
   */
  component?: React.ReactType;
  /**
   * OnClick callback
   * @param event event
   */
  onClick?(event: React.MouseEvent): void;
}
