/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module FieldGroup
 */
import { IFormContext } from '../../FormContext';

/**
 * Helper function to get the correct value
 * of the group (including all values of the nested fields)
 * @param formContext Form context
 * @param fullName Full name of the field group
 * @hidden
 */
export function getGroupValue<TFieldValue extends {}>(
  formContext: IFormContext,
  fullName: string
): TFieldValue | undefined {
  const formValues = formContext.getValues();

  const formValue = formValues[fullName];
  if (formValue === '' || formValue === undefined) {
    return undefined;
  }

  return formValue as TFieldValue;
}
