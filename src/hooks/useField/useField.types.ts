import { IValidationState, IUseValidationArgs } from '../useValidation';
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
export type TBasicFieldValue = string | boolean | number | object | null | undefined;
/**
 * Type definition for getDisplayValue and getSubmitValue callbacks
 */
export type TValueCallback = ((value: TBasicFieldValue, meta: IValueMeta) => TBasicFieldValue);

/**
 * Basic props for the field component
 */
export interface IBaseFieldProps {
  /**
   * Name of this input. Will be used as the unique identifier of this value.
   * **Must be unique inside its context (e.g. form wide or form group wide)!**
   */
  name: string;
  /**
   * Message id of the label that will be displayed along the input. If you
   * don't want to use any i18n features you can pass a raw message instead.
   */
  label: string;
  /**
   * Overwrites the Form default values for this field. This value will be
   * used during form initialization.
   */
  defaultValue?: TBasicFieldValue;
  /**
   * Overwrites the Form value for this field. Changing this property will
   * update the Field value, overwriting its default value but also any
   * value the user put in.
   */
  value?: TBasicFieldValue;
  /**
   * If set to true the form will trigger asynchronous validation on this field whenever
   * it changes (e.g. on key press). Default behaviour is that the fields will only async
   * validate when they loose focus.
   * @default Form.asyncValidateOnChange
   */
  asyncValidateOnChange?: boolean;
  /**
   * Called, when the field is loading its value from the forms
   * default values. Must return the value to display.
   * @param value Contains the current field value.
   * <br />
   * @param meta Contains the properties disabled and plaintext, representing the current Form setup.
   * @returns: the function should return the value that should be displayed.
   */
  getDisplayValue?: TValueCallback;
  /**
   * Called, when the field is submitting its value to the form.
   * Must return the value to submit.
   * @param value Contains the current field value.
   * <br />
   * @param meta Contains the properties disabled and plaintext, representing the current Form setup.
   * @returns: the function should return the value that should be submitted.
   */
  getSubmitValue?: TValueCallback;
  /**
   * Overwrites the disabled state for this field.
   * @default Form.disabled
   */
  disabled?: boolean;
  /**
   * Overwrites the plaintext state for this field.
   * @default Form.plaintext
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

export interface IUseFieldProps extends IBaseFieldProps, IUseValidationArgs { }

export interface IUseFieldResult {
  fieldProps: IFieldComponentFieldProps;
  metaProps: IFieldComponentMeta;
}

export interface IUseFieldState {
  touched: boolean;
  dirty: boolean;
  value: TBasicFieldValue;
}
