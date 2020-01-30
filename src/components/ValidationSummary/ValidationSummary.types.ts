/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module ValidationSummary
 */
import React from 'react';

/**
 * Properties for the ValidationSummary
 */
export interface IValidationSummaryProps {
  /**
   * Id of this input. Will be used as the unique identifier of the div.
   * **Must be unique form wide!**
   */
  id: string;
  /**
   * Message that will be used as the title, wrapped in a h4.
   */
  title?: string;
  /**
   * If set to true the validation summary will stop automatically scrolling
   * to itself when the user clicks on a submit button and the form is invalid.
   * @default false
   */
  disableFocusOnSubmit?: boolean;
  /**
   * Optional function that can be used to customize the output of each error.
   * @param id Id of the failing field
   * @param fieldName Display name of the failing field
   * @param errors Object / Array of objects with the rendered error messages
   * @param linkCallback Function that should be called on click, will focus on the input element.
   */
  renderFieldError?(
    id: string,
    fieldName: string,
    errors: React.ReactNode,
    linkCallback: React.MouseEventHandler
  ): React.ReactNode;
  /**
   * Optional function that can be used to customize the ValidationSummary rendering.
   * Note: This function will only be called when there are errors to be displayed.
   * @param children Validation summary content (header + rendered field errors)
   */
  render?(children: React.ReactNode): React.ReactElement | null;
}
