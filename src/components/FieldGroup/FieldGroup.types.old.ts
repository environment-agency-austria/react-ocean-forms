/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { IValidationState } from '../../hooks';
import { IFieldValues } from '../FormContext';
import { IValidationProps } from '../withValidation';

/**
 * Meta information about the group
 * for the render prop
 */
export interface IFieldGroupRenderParams extends IValidationState {
  /**
   * Full name of the group
   */
  fullName: string;
}

/**
 * Props for the field group component
 */
export interface IFieldGroupProps<TFieldValues = IFieldValues> extends IValidationProps<TFieldValues> {
  /**
   * Field name
   */
  name: string;
  /**
   * Label of the group
   */
  label: string;
  /**
   * True, if the async validators should be triggered
   * on a change event
   */
  asyncValidateOnChange?: boolean;
  /**
   * Optional default values
   */
  defaultValues?: TFieldValues;
  /**
   * Optional values
   */
  values?: TFieldValues;
  /**
   * Disables this field group and all its fields.
   */
  disabled?: boolean;
  /**
   * Puts the field group and all its fields in plaintext mode.
   */
  plaintext?: boolean;
  /**
   * Render prop
   * @param params Meta information about the group
   */
  render(params: IFieldGroupRenderParams): JSX.Element;
}
