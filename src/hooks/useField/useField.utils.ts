/**
 * Function that will directly return the passed value
 * @param value Field value
 */
export function noopFieldValueFunction<TFieldValue = unknown>(value: TFieldValue | undefined): TFieldValue | undefined {
  return value;
}
