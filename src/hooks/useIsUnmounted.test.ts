import { renderHook, cleanup } from 'react-hooks-testing-library';
import { useIsUnmounted } from './useIsUnmounted';

afterEach(cleanup);

describe('useIsUnmounted', () => {
  const { result, rerender, unmount } = renderHook(() => useIsUnmounted());

  it('should return false while the component is mounted', () => {
    expect(result.current.current).toBe(false);
  });

  it('should return false after a rerender', () => {
    rerender();
    expect(result.current.current).toBe(false);
  });

  it('should return true after unmount', () => {
    unmount();
    expect(result.current.current).toBe(true);
  });
});
