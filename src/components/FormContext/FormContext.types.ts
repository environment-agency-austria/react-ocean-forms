/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module FormContext
 */
import { TSTringFormatter } from '../../utils/stringFormatter';
import { TFormEventListener, IFieldState } from '../../hooks/internal';
import { TBasicFieldValue } from '../../hooks';

/**
 * Type describing a collection of field values
 */
export interface IFieldValues {
  [prop: string]: TBasicFieldValue | IFieldValues;
}

/**
 * Base interface for the form context
 */
export interface IBaseFormContext<TFieldValues = IFieldValues> {
  /**
   * Optional field prefix
   */
  fieldPrefix: string | null;

  /**
   * True, if the form is currently busy
   */
  busy: boolean;

  /**
   * Registers a field to the form context
   * @param name Unique field name
   * @param state Field state
   */
  registerField(name: string, state: IFieldState): void;
  /**
   * Unregisters the field from the form context
   * @param name Unique field name
   */
  unregisterField(name: string): void;

  /**
   * Notifies the form context about a field event
   * @param name Unique field name
   * @param event Event name
   * @param args Optional event args
   */
  notifyFieldEvent(name: string, event: string, args?: unknown): void;

  /**
   * Registers a listener to all field events inside
   * this form context
   * @param name Unique listener name
   * @param callback Callback method
   */
  registerListener(name: string, callback: TFormEventListener): void;
  /**
   * Unregisters a listener from the form context
   * @param name Unique listener name
   */
  unregisterListener(name: string): void;

  /**
   * Returns the field state of the given field
   * @param name Unique field name
   */
  getFieldState(name: string): IFieldState;
  /**
   * Returns all field values
   */
  getValues(): TFieldValues;

  /**
   * Submits the form
   * @param submitArgs Optional submit args
   */
  submit(submitArgs?: unknown): Promise<void>;
  /**
   * Resets the form
   */
  reset(): void;
}

/**
 * Interface describing the form context
 */
export interface IFormContext<TFieldValues = IFieldValues> extends IBaseFormContext<TFieldValues> {
  /**
   * Contains the default values of the form. Those values will be
   * put into the according fields when the form initializes.
   */
  defaultValues: Partial<TFieldValues>;
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
   */
  asyncValidateOnChange: boolean;
  /**
   * Configures the wait time before the async validators will be called.
   * Per default the form will call the async validators only 400ms after
   * the last value change. Can be overriden per field.
   */
  asyncValidationWait: number;
  /**
   * Optional string formatter method
   */
  stringFormatter: TSTringFormatter;
  /**
   * If set to true the form will disable all Fields and FormButtons.
   */
  disabled: boolean;
  /**
   * If set to true, all the fields will display only text instead of an
   * input element. This is useful to re-use Fields in a check page.
   */
  plaintext: boolean;
}
