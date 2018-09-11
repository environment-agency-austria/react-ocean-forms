import { TSTringFormatter } from '../../utils';
import { TFieldError } from '../../validators';
import { TFieldValue } from '../Field';
import { TFieldValues } from '../FormContext';

/**
 * Props for the Form component
 */
export interface IFormProps {
  /**
   * Contains the default values of the form. Those values will be
   * put into the according fields when the form initializes.
   */
  defaultValues: TFieldValues;
  /**
   * Contains the values of the form. Changing this property will
   * update all Field values, overwriting their default values but also
   * any value the user put in.
   */
  values?: TFieldValues;
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
   * If set every text output will be put through this function.
   * Per default an internal implementation is used.
   */
  formatString: TSTringFormatter;
  /**
   * If set to true the form will disable all Fields and FormButtons.
   */
  disabled: boolean;
  /**
   * Sets the className of the html form.
   */
  className?: string;
  /**
   * If set to true, all the fields will display only text instead of an
   * input element. This is useful to re-use Fields in a check page.
   */
  plaintext: boolean;

  /**
   * Triggered when the form has been validated successfully and is ready to be submitted.
   * @param values Contains the form values. The name of the fields are
   * used as property names for the values object. FieldGroups result in a nested object.
   * @param submitArgs By default undefined. Can be set by FormButton or
   * any other manual way of calling the submit method of the form context.
   */
  onSubmit?(values: TFieldValues, submitArgs?: unknown): Promise<void> | void;
  /**
   * Triggered after all field validations have been successfull. Provides the current
   * values end expects an error object with the field names as properties and the errors
   * inside those properties.
   * @param values Contains the form values. The name of the fields are used as property
   * names for the values object. FieldGroups result in a nested object.
   */
  onValidate?(values: TFieldValues): TFormValidationResult;
  /**
   * Triggered when the form has been resetted by the user.
   */
  onReset?(): void;
}

export type TFormValidationResult = {
  [prop: string]: TFieldError | TFormValidationResult;
};
