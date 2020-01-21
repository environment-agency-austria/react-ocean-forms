/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module withForm
 */
import { IFormContext } from '../FormContext';

/**
 * Props for consumers of withForm props
 */
export interface IFormContextProps {
  /**
   * Form context of the parent form
   */
  context: IFormContext;
}
