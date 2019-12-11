import { IMessageValues } from '../../utils';
import { useFormContext } from '../useFormContext';

export function useFormText(id: string, values?: IMessageValues): string {
  const { stringFormatter } = useFormContext();
  return stringFormatter(id, values);
}
