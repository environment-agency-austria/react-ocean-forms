/**
 * Copyright (c) 2019-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useEffect } from 'react';

import { useFormContext } from '../useFormContext';
import { IFieldState } from '../../components';

/**
 * Hook for registering fields to the form context. Will automatically
 * unregister the field on unmount.
 * @param fullName Full name of the field
 * @param label Label of the field
 * @param isGroup True if the field is a group
 * @param updateValidation Update validation handler
 * @param validate Validation handler
 * @param reset Reset handler
 * @param getValue Get Value handler
 */
export function useFieldRegistration(
  fullName: string,
  label: IFieldState['label'],
  isGroup: IFieldState['isGroup'],
  updateValidation: IFieldState['updateValidation'],
  validate: IFieldState['validate'],
  reset: IFieldState['reset'],
  getValue: IFieldState['getValue'],
): void {
  const formContext = useFormContext();
  useEffect(() => {
    formContext.registerField(
      fullName,
      {
        label,

        updateValidation,
        validate,
        reset,
        getValue,

        isGroup,
      },
    );

    return () => {
      formContext.unregisterField(fullName);
    };
  }, [formContext, fullName, label, isGroup, updateValidation, validate, reset, getValue]);
}
