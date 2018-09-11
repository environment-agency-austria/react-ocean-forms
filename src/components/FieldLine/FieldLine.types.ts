import { TValidator } from '../../validators';
import { IFieldComponentProps } from '../Field';

/**
 * Field Line properties
 */
export interface IFieldLineProps extends IFieldComponentProps {
  /**
   * Field label
   */
  label: string;
  /**
   * Validators
   */
  validators?: TValidator[];
  /**
   * Children
   */
  children: React.ReactNode;
}
