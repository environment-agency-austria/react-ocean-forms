import { IFormContext } from '../../FormContext';

/**
 * Helper function to get the correct value
 * of the group (including all values of the nested fields)
 * @param formContext Form context
 * @param fullName Full name of the field group
 */
export function getGroupValue<TFieldValue extends {}>(formContext: IFormContext, fullName: string): TFieldValue | undefined {
  const formValues = formContext.getValues();

  const formValue = formValues[fullName];
  if (formValue === '' || formValue === undefined) {
    return undefined;
  }

  return formValue as TFieldValue;
}
