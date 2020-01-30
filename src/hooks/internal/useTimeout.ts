/**
 * Copyright (c) 2019-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect, useCallback } from 'react';

/**
 * Calls the `handle` after `timeout` milliseconds have passed
 * @param handle Callback that should be called after the timout has been reached
 * @param timeout Timeout in milliseconds
 */
export type TSetTimeout = (handle: TimerHandler, timeout: number) => void;
/**
 * Clears any timeout if existing
 */
export type TClearTimeout = () => void;
/**
 * Result of useTimeout. Contains an array with a setTimeout and a
 * clearTimeout function
 */
export type TUseTimeoutResult = [TSetTimeout, TClearTimeout];

/**
 * Wrapper hook for `window.setTimeout` and `window.clearTimeout`. Will
 * automatically clear the timeout on unmount.
 */
export function useTimeout(): TUseTimeoutResult {
  const timeoutId = useRef<number | undefined>(undefined);

  const internalClearTimeout = useCallback(() => {
    if (timeoutId.current !== undefined) {
      window.clearTimeout(timeoutId.current);
      timeoutId.current = undefined;
    }
  }, []);

  const internalSetTimeout = useCallback((handle: TimerHandler, timeout: number) => {
    timeoutId.current = window.setTimeout(handle, timeout);
  }, []);

  useEffect(() => {
    return () => {
      internalClearTimeout();
    };
  }, [internalClearTimeout]);

  return [internalSetTimeout, internalClearTimeout];
}
