import { TSTringFormatter } from '../../utils';
import { TFieldErrors } from '../../validators';

/**
 * Props for the FieldError component
 */
export interface IFieldErrorProps {
  /**
   * Html id
   */
  id: string;
  /**
   * True if the field is invalid
   */
  invalid: boolean;
  /**
   * Field errors
   */
  error: TFieldErrors;
  /**
   * stringFormatter method
   */
  stringFormatter: TSTringFormatter;
}
