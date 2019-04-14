import { IUseValidationArgs, IValidationState } from '../../../hooks';
import { IFieldValues, IFormContext } from '../../FormContext';

/**
 * Props for the field group component
 */
export interface IUseFieldGroupArgs extends IUseValidationArgs {
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
  defaultValues?: IFieldValues;
  /**
   * Optional values
   */
  values?: IFieldValues;
  /**
   * Disables this field group and all its fields.
   */
  disabled?: boolean;
  /**
   * Puts the field group and all its fields in plaintext mode.
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
