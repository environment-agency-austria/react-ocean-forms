/**
 * Copyright (c) 2019-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useFormContext } from '../useFormContext';

/**
 * Returns the full name of the field, consisting of
 * the current `FormContext.fieldPrefix` and the `name` of the field.
 * @param name Name of the field
 */
export function useFullName(name: string): string {
  const formContext = useFormContext();
  return formContext.fieldPrefix !== null ? formContext.fieldPrefix.concat('.', name) : name;
}
