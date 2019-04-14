import { TBasicFieldValue } from './useField.types';

/**
 * Noop function that does nothing
 */
export function noopFunction(): void { }

/**
 * Function that will directly return the passed value
 * @param value Field value
 */
export function noopFieldValueFunction(value: TBasicFieldValue): TBasicFieldValue {
  return value;
}
