import { TSTringFormatter } from '../../utils/stringFormatter';
import { TFieldErrors } from '../../validators';

export type TFieldValue = string | boolean | number | object;

export interface IFieldComponentFieldProps {
  id: string;
  name: string;
  value: TFieldValue;
  disabled: boolean;
  onChange(): void;
  onBlur(): void;
}

export interface IFieldComponentMeta {
  valid: boolean;
  error: TFieldErrors;
  isValidating: boolean;
  touched: boolean;
  stringFormatter: TSTringFormatter;
  plaintext: boolean;
}

export interface IFieldComponentProps {
  field: IFieldComponentFieldProps;
  meta: IFieldComponentMeta;
  label: string;
}
