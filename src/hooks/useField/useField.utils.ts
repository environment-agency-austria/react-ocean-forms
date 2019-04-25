import { TBasicFieldValue } from './useField.types';

/**
 * Function that will directly return the passed value
 * @param value Field value
 */
export function noopFieldValueFunction(value: TBasicFieldValue): TBasicFieldValue {
  return value;
}
