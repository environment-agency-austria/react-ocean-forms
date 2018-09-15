import { TFieldValues } from '../FormContext';
import { IValidationProps, IValidationState } from '../withValidation';

/**
 * Meta information about the group
 * for the render prop
 */
export interface IRenderParams extends IValidationState {
  /**
   * Full name of the group
   */
  fullName: string;
}

/**
 * Props for the field group component
 */
export interface IFieldGroupProps extends IValidationProps {
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
   * Render prop
   * @param params Meta information about the group
   */
  render(params: IRenderParams): JSX.Element;
}
