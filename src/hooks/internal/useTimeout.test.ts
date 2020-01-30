import { renderHook, act } from '@testing-library/react-hooks';
import { useTimeout } from './useTimeout';

beforeAll(jest.useFakeTimers);

describe('useTimeout', () => {
  it('should return an array with a setTimeout and a clearTimeout function', () => {
    const { result } = renderHook(() => useTimeout());

    expect(result.current).toBeInstanceOf(Array);
    expect(result.current.length).toBe(2);
    expect(result.current[0]).toBeInstanceOf(Function);
    expect(result.current[1]).toBeInstanceOf(Function);
  });

  it('should call the timeout handler after timeout milliseconds', () => {
    const { result } = renderHook(() => useTimeout());

    const mockHandler = jest.fn();
    const mockTimeout = 1000;

    act(() => {
      result.current[0](mockHandler, mockTimeout);
    });

    expect(mockHandler).not.toHaveBeenCalled();
    jest.runAllTimers();

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('should cancel the timeout with the clearTimeout function', () => {
    const { result } = renderHook(() => useTimeout());

    const mockHandler = jest.fn();
    const mockTimeout = 1000;

    act(() => {
      result.current[0](mockHandler, mockTimeout);
    });

    expect(mockHandler).not.toHaveBeenCalled();

    act(() => {
      result.current[1]();
    });
    expect(mockHandler).not.toHaveBeenCalled();

    jest.runAllTimers();
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should cancel the timeout on unmount', () => {
    const { result, unmount } = renderHook(() => useTimeout());

    const mockHandler = jest.fn();
    const mockTimeout = 1000;

    act(() => {
      result.current[0](mockHandler, mockTimeout);
    });

    expect(mockHandler).not.toHaveBeenCalled();

    unmount();
    expect(mockHandler).not.toHaveBeenCalled();

    jest.runAllTimers();
    expect(mockHandler).not.toHaveBeenCalled();
  });
});
