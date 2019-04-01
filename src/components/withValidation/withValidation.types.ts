/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { TBasicFieldValue } from '../withField';
import { IValidationProp } from '../ValidationWrapper';

/**
 * Base interface for consumers of withValidation props
 */
export interface IValidationProps<TFieldValue = TBasicFieldValue> {
  /**
   * Full Name of the component
   * (context.fieldPrefix + '.' + fieldName)
   */
  fullName: string;
  /**
   * Validation properties, describes the current
   * validation state of the component
   */
  validation: IValidationProp<TFieldValue>;
}
