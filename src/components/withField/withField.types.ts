/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { IFieldComponentFieldProps, IFieldComponentMeta } from '../../hooks';

/**
 * Props for the input component of a Field
 */
export interface IFieldComponentProps {
  /**
   * Props for the actual html input, designed
   * to be passed as-is
   */
  field: IFieldComponentFieldProps;
  /**
   * Meta informations about the field state
   */
  meta: IFieldComponentMeta;
  /**
   * Label (string or message id)
   */
  label: string;
}
