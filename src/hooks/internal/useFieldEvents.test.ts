import { renderHook } from '@testing-library/react-hooks';

import { useFieldEvents, TFormEventListener } from './useFieldEvents';

describe('useFieldEvents', () => {
  interface IMockListener {
    id: string;
    state: TFormEventListener;
  }

  const createMockListener = (id?: string): IMockListener => ({
    id: id === undefined ? 'listener' : id,
    state: jest.fn(),
  });

  const createMockListeners = (count: number): IMockListener[] => {
    const result = [];
    for (let i = 0; i < count; i += 1) {
      result.push(createMockListener(`listener${i}`));
    }

    return result;
  };

  it('should return the correct result', () => {
    const { result } = renderHook(() => useFieldEvents());

    expect(result.current).toMatchObject({
      registerListener: expect.any(Function),
      unregisterListener: expect.any(Function),
      notifyListeners: expect.any(Function),
    });
  });

  it('should register new listeners without crashing', () => {
    const mockListeners = createMockListeners(3);
    const { result } = renderHook(() => useFieldEvents());
    mockListeners.forEach((item) => {
      expect(() => {
        result.current.registerListener(item.id, item.state);
      }).not.toThrowError();
    });
  });

  it('should unregister new listeners without crashing', () => {
    const mockListeners = createMockListeners(3);
    const { result } = renderHook(() => useFieldEvents());
    mockListeners.forEach((item) => {
      result.current.registerListener(item.id, item.state);
      expect(() => {
        result.current.unregisterListener(item.id);
      }).not.toThrowError();
    });
  });

  it('should call the listeners', () => {
    const eventName = 'change';
    const eventArgs = 'myNewValue';
    const fieldName = 'mockFieldName';

    const { result } = renderHook(() => useFieldEvents());
    const mockListeners = createMockListeners(3);
    mockListeners.forEach((item) => result.current.registerListener(item.id, item.state));

    result.current.notifyListeners(fieldName, eventName, eventArgs);
    mockListeners.forEach((item) =>
      expect(item.state).toHaveBeenLastCalledWith(fieldName, eventName, eventArgs)
    );
  });
});
