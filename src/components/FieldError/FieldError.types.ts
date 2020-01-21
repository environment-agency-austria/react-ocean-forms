/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module FieldError
 */
import { TFieldErrors } from '../../validators';

/**
 * Props for the FieldError component
 */
export interface IFieldErrorProps {
  /**
   * Html id
   */
  id: string;
  /**
   * True if the field is invalid
   */
  invalid: boolean;
  /**
   * Field errors
   */
  error: TFieldErrors;
}
