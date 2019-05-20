/**
 * Function that will directly return the passed value
 * @param value Field value
 */
export function noopFieldValueFunction(value: unknown | undefined): unknown | undefined {
  return value;
}
