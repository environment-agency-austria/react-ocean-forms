import { IFieldComponentProps } from '../Field';

/**
 * Props for the Input component
 */
export interface IInputProps extends IFieldComponentProps {
  /**
   * Input type (e.g. text, number, ...)
   */
  // tslint:disable-next-line:no-reserved-keywords
  type: string;
}
