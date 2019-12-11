import { renderHook } from '@testing-library/react-hooks';
import { useIsUnmounted } from './useIsUnmounted';

describe('useIsUnmounted', () => {
  it('should return false while the component is mounted', () => {
    const { result } = renderHook(() => useIsUnmounted());
    expect(result.current.current).toBe(false);
  });

  it('should return false after a rerender', () => {
    const { result, rerender } = renderHook(() => useIsUnmounted());
    rerender();
    expect(result.current.current).toBe(false);
  });

  it('should return true after unmount', () => {
    const { result, unmount } = renderHook(() => useIsUnmounted());
    unmount();
    expect(result.current.current).toBe(true);
  });
});
