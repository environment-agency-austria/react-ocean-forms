/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module Form
 */
import { TSTringFormatter } from '../../utils';
import { TFieldError } from '../../validators';
import { IFieldValues } from '../FormContext';

/**
 * Props for the Form component
 */
export interface IFormProps<TFieldValues = IFieldValues, TSubmitArgs = unknown> {
  /**
   * Contains the default values of the form. Those values will be
   * put into the according fields when the form initializes. Those
   * values will be put into the according fields when the form initializes.
   */
  defaultValues?: Partial<TFieldValues>;
  /**
   * Contains the values of the form. Changing this property will
   * update all Field values, overwriting their default values but also
   * any value the user put in.
   */
  values?: Partial<TFieldValues>;
  /**
   * If set to true the form will trigger asynchronous validation on
   * Fields whenever they change (e.g. on key press). Default behaviour
   * is that the fields will only async validate when they loose focus.
   * Can be overriden per field.
   * @default false
   */
  asyncValidateOnChange?: boolean;
  /**
   * Configures the wait time before the async validators will be called.
   * Per default the form will call the async validators only 400ms after
   * the last value change. Can be overriden per field.
   * @default 400
   */
  asyncValidationWait?: number;
  /**
   * If set every text output will be put through this function.
   * Per default an internal implementation is used.
   */
  formatString?: TSTringFormatter;
  /**
   * If set to true the form will disable all Fields and FormButtons.
   * @default false
   */
  disabled?: boolean;
  /**
   * Sets the className of the html form.
   */
  className?: string;
  /**
   * If set to true, all the fields will display only text instead of an
   * input element. This is useful to re-use Fields in a check page.
   * @default false
   */
  plaintext?: boolean;
  /**
   * If set to true, all fields will be reset on an successful form submit
   * @default false
   */
  resetOnSubmit?: boolean;
  /**
   * If set to true, the form will be forced into a busy state and thus disabling
   * any form buttons.
   * @default false
   */
  busy?: true;

  /**
   * Triggered when the form has been validated successfully and is ready to be submitted.
   * If the passed function is an async function / returns a promise, then the form context
   * will stay in a busy state until the function resolves.
   * @param values Contains the form values. The name of the fields are
   * used as property names for the values object. FieldGroups result in a nested object.
   * <br />
   * @param submitArgs By default undefined. Can be set by FormButton or
   * any other manual way of calling the submit method of the form context.
   */
  onSubmit?(values: TFieldValues, submitArgs?: TSubmitArgs): Promise<void> | void;
  /**
   * Triggered after all field validations have been successfull. Provides the current
   * values end expects an error object with the field names as properties and the errors
   * inside those properties.
   * @param values Contains the form values. The name of the fields are used as property
   * names for the values object. FieldGroups result in a nested object.
   * @returns: should return null if the values are valid, otherwise an error object.
   */
  onValidate?(values: TFieldValues): TFormValidationResult;
  /**
   * Triggered when the form has been resetted by the user.
   */
  onReset?(): void;
}

export type TFormValidationResult = {
  [prop: string]: TFieldError | TFormValidationResult;
} | null;
