/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module FieldGroup
 */
import { IUseValidationArgs, IValidationState } from '../../../hooks';
import { IFormContext } from '../../FormContext';

/**
 * Props for the field group component
 */
export interface IUseFieldGroupArgs<TFieldValue = unknown> extends IUseValidationArgs<TFieldValue> {
  /**
   * Message id of the label that will be displayed along the input.
   * If you don't want to use any i18n features you can pass a raw message instead.
   */
  label: string;
  /**
   * If set to true the form will trigger asynchronous validation on Fields whenever
   * they change (e.g. on key press). Default behaviour is that the fields will only
   * async validate when they loose focus.
   * @default Form.asyncValidateOnChange
   */
  asyncValidateOnChange?: boolean;
  /**
   * Overwrites the Form default values for the child fields of this field group.
   * Those values will be put into the according fields when the form initializes.
   */
  defaultValues?: TFieldValue;
  /**
   * Overwrites the Form values for the child fields of this field group. Changing
   * this property will update all Field values, overwriting their default values
   * but also any value the user put in.
   */
  values?: TFieldValue;
  /**
   * Overwrites the disabled state for this field group.
   * @default Form.disabled
   */
  disabled?: boolean;
  /**
   * Overwrites the plaintext state for this field group.
   * @default Form.plaintext
   */
  plaintext?: boolean;
}

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
 * Result of the useFieldGroup hook
 */
export interface IUseFieldGroupResult {
  /**
   * Overriden form context for the group
   */
  groupFormContext: IFormContext;
  /**
   * Params with meta information to be passed
   * to the render method of FieldGroup
   */
  renderParams: IFieldGroupRenderParams;
}
