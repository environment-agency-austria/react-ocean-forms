/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module useFormEventListener
 * @category Hooks
 * @preferred
 */
import { useEffect } from 'react';

import { useFormContext } from '../useFormContext';
import { TFormEventListener } from '../internal';

/**
 * Hook for registering listeners for form events. Will
 * automatically unregister the listener on unmount.
 * @param id Unique listener id
 * @param callback Callback @see TFormEventListener
 */
export function useFormEventListener(id: string, callback: TFormEventListener): void {
  const formContext = useFormContext();
  useEffect(() => {
    formContext.registerListener(id, callback);

    return () => {
      formContext.unregisterListener(id);
    };
  }, [formContext, id, callback]);
}
