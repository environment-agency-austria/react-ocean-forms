import { useRef, useCallback, useMemo } from 'react';

export type TFormEventListener = (name: string, event: string, args?: unknown) => void;

export interface IUseFieldEventsResult {
  registerListener(name: string, callback: TFormEventListener): void;
  unregisterListener(name: string): void;
  notifyListeners(name: string, event: string, args?: unknown): void;
}

export function useFieldEvents(): IUseFieldEventsResult {
  const eventListeners = useRef(new Map<string, TFormEventListener>());

  /**
   * Registers a new listener
   */
  const registerListener = useCallback((name: string, callback: TFormEventListener): void => {
    eventListeners.current.set(name, callback);
  }, []);

  /**
   * Unregisters a listener
   */
  const unregisterListener = useCallback((name: string): void => {
    eventListeners.current.delete(name);
  }, []);

  /**
   * Notifies the event listeners about an event
   * @param name Field name
   * @param event Event name
   * @param args Event args
   */
  const notifyListeners = useCallback((name: string, event: string, args?: unknown): void => {
    eventListeners.current.forEach((callback) => {
      callback(name, event, args);
    });
  }, []);

  return useMemo(
    () => ({
      registerListener,
      unregisterListener,
      notifyListeners,
    }),
    [notifyListeners, registerListener, unregisterListener]
  );
}
