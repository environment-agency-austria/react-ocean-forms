import * as React from 'react';

import { TSTringFormatter } from '../../utils/stringFormatter';
import { TFieldErrors } from '../../validators';
import { IValidationProps } from '../withValidation';

/**
 * Type that defines which values a field could hold
 */
export type TFieldValue = string | boolean | number | object;
/**
 * Type definition for getDisplayValue and getSubmitValue callbacks
 */
export type TValueCallback = ((value: TFieldValue, meta: IValueMeta) => TFieldValue);

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
 * Props for the Field component
 */
export interface IFieldProps extends IValidationProps {
  /**
   * Field name
   */
  name: string;
  /**
   * Label (string or message id)
   */
  label: string;
  /**
   * Input component
   */
  component: React.ComponentType<IFieldComponentProps>;
  /**
   * Optional default value
   */
  defaultValue?: TFieldValue;
  /**
   * Optional value
   */
  value?: TFieldValue;
  /**
   * True, if the async validators should be triggered
   * on a change event
   */
  asyncValidateOnChange?: boolean;
  /**
   * Called, when the field is loading its value from the forms
   * default values. Must return the value to display.
   */
  getDisplayValue: TValueCallback;
  /**
   * Called, when the field is submitting its value to the form.
   * Must return the value to submit.
   */
  getSubmitValue: TValueCallback;
  /**
   * Triggered on field blur.
   */
  onBlur(): void;
  /**
   * Triggered on field value change.
   * @param value Current field value
   */
  onChange(value: TFieldValue): void;
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
  value: TFieldValue;
  /**
   * Disabled state
   */
  disabled: boolean;
  /**
   * OnChange handler
   * @param event Change event
   */
  onChange(event: React.ChangeEvent): void;
  /**
   * OnBlur handler
   * @param event Blur event
   */
  onBlur(event: React.FocusEvent): void;
}

/**
 * Meta informations about the current field state
 */
export interface IFieldComponentMeta {
  /**
   * True if the field is valid
   */
  valid: boolean;
  /**
   * Contains any field errors if invalid
   */
  error: TFieldErrors;
  /**
   * True if a async validator is running
   * in the background
   */
  isValidating: boolean;
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
   * Label of the field
   */
  label: string;
}
