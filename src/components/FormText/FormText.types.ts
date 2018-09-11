import { IMessageValues } from '../../utils';
import { IFormContextProps } from '../withForm';

/**
 * FormText component props
 */
export interface IFormTextProps extends IFormContextProps {
  /**
   * Text or message id
   */
  text: string | null;
  /**
   * Optional values for the stringFormatter
   */
  values?: IMessageValues;
}
