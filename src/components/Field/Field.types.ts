/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { TSTringFormatter } from '../../utils';
import { IValidationState } from '../../hooks';
import { IValidationProps } from '../withValidation';

/**
 * Type that defines which values a field could hold
 */
export type TBasicFieldValue = string | boolean | number | object;
/**
 * Type definition for getDisplayValue and getSubmitValue callbacks
 */
export type TValueCallback = ((value: TBasicFieldValue, meta: IValueMeta) => TBasicFieldValue);

/**
 * Information about the current meta state
 * of the Field
 */
export interface IValueMeta {
  /**
   * True, if the field is disabled
   */
  disabled: boolean;
  /**
   * True, if the field is in plaintext mode
   */
  plaintext: boolean;
}

/**
 * Basic props for the field component
 */
export interface IBaseFieldProps {
  /**
   * Field name
   */
  name: string;
  /**
   * Label (string or message id)
   */
  label: string;
  /**
   * Optional default value
   */
  defaultValue?: TBasicFieldValue;
  /**
   * Optional value
   */
  value?: TBasicFieldValue;
  /**
   * True, if the async validators should be triggered
   * on a change event
   */
  asyncValidateOnChange?: boolean;
  /**
   * Called, when the field is loading its value from the forms
   * default values. Must return the value to display.
   */
  getDisplayValue?: TValueCallback;
  /**
   * Called, when the field is submitting its value to the form.
   * Must return the value to submit.
   */
  getSubmitValue?: TValueCallback;
  /**
   * Disables this field.
   */
  disabled?: boolean;
  /**
   * Puts the field in plaintext mode.
   */
  plaintext?: boolean;
  /**
   * Triggered on field blur.
   */
  onBlur?(): void;
  /**
   * Triggered on field value change.
   * @param value Current field value
   */
  onChange?(value: TBasicFieldValue): void;
}

/**
 * Props for the Field component
 */
export interface IFieldProps extends IBaseFieldProps, IValidationProps {
  /**
   * Render prop for the input element
   * @param field Props designed to be passed to the field as is @see IFieldComponentFieldProps
   * @param meta Meta information about the field state
   */
  render(field: IFieldComponentFieldProps, meta: IFieldComponentMeta): JSX.Element;
}

/**
 * Event for field value changes
 */
export interface IFieldChangedEvent {
  target: {
    value: TBasicFieldValue;
  };
}

/**
 * Props for the actual html input of a Field
 * input component. Designed to be passed to the
 * html input as-is.
 */
export interface IFieldComponentFieldProps {
  /**
   * Html id
   */
  id: string;
  /**
   * Field name
   */
  name: string;
  /**
   * Field value
   */
  value: TBasicFieldValue;
  /**
   * Disabled state
   */
  disabled: boolean;
  /**
   * OnChange handler
   * @param event Change event
   */
  onChange(event: IFieldChangedEvent): void;
  /**
   * OnBlur handler
   */
  onBlur(): void;
}

/**
 * Meta informations about the current field state
 */
export interface IFieldComponentMeta extends IValidationState {
  /**
   * True, if the user has changed the value
   */
  touched: boolean;
  /**
   * String formatter method
   */
  stringFormatter: TSTringFormatter;
  /**
   * True if the field is in plaintext mode
   */
  plaintext: boolean;
}

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
