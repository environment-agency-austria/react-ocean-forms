import { IValidationState } from '../useValidation';
import { TSTringFormatter } from '../../utils';

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
 * Type that defines which values a field could hold
 */
export type TBasicFieldValue = string | boolean | number | object;
/**
 * Type definition for getDisplayValue and getSubmitValue callbacks
 */
export type TValueCallback = ((value: TBasicFieldValue, meta: IValueMeta) => TBasicFieldValue);

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
