/**
 * Copyright (c) 2019-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect } from 'react';

/**
 * Returns a ref object that is true if the
 * current component has already been unmounted.
 * @example
 * const isUnmounted = useIsUnmounted();
 * if (isUnmounted.current === true) {
 *  // do stuff
 * }
 */
export function useIsUnmounted(): React.MutableRefObject<boolean> {
  const isUnmounted = useRef(false);
  useEffect(() => {
    return () => {
      isUnmounted.current = true;
    };
  }, []);

  return isUnmounted;
}
