import { useEffect } from 'react';

import { useFormContext } from '../useFormContext';
import { TFormEventListener } from '../internal';

/**
 * Hook for registering listeners for form events. Will
 * automatically unregister the listener on unmount.
 * @param id Unique listener id
 * @param callback Callback @see TFormEventListener
 */
export function useFormEventListener(
  id: string,
  callback: TFormEventListener
): void {
  const formContext = useFormContext();
  useEffect(() => {
    formContext.registerListener(id, callback);

    return () => {
      formContext.unregisterListener(id);
    };
  }, [formContext, id, callback]);
}
