/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { IFormContextProps } from '../withForm';

/**
 * Properties for the ValidationSummary
 */
export interface IValidationSummaryProps extends IFormContextProps {
  /**
   * (html) id for the validation summary container div
   */
  id: string;
  /**
   * Optional title text / message id
   */
  title: string;
  /**
   * If true, then the validation summary won't try to sroll
   * itself into view if the user submits an invalid form
   */
  disableFocusOnSubmit: boolean;
  /**
   * Render prop for drawing single field errors
   * @param id Id of the failing field
   * @param fieldName Display name of the failing field
   * @param errors Rendered error messages
   * @param linkCallback Callback that will focus the failed field
   */
  renderFieldError?(id: string, fieldName: string, errors: React.ReactNode, linkCallback: React.MouseEventHandler): JSX.Element;
  /**
   * Render prop for customizing the validation summary
   * @param children Validation summary content (header + rendered field errors)
   */
  render?(children: JSX.Element): JSX.Element;
}
