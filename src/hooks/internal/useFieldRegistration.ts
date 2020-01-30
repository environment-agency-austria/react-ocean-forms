/**
 * Copyright (c) 2019-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useEffect } from 'react';

import { useFormContext } from '../useFormContext';
import { IFieldState } from './useFieldStates';

/**
 * Hook for registering fields to the form context. Will automatically
 * unregister the field on unmount.
 * @param fullName Full name of the field
 * @param fieldState Field state to register @see IFieldState
 */
export function useFieldRegistration(fullName: string, fieldState: IFieldState): void {
  const formContext = useFormContext();
  useEffect(() => {
    formContext.registerField(fullName, fieldState);

    return () => {
      formContext.unregisterField(fullName);
    };
  }, [formContext, fullName, fieldState]);
}
