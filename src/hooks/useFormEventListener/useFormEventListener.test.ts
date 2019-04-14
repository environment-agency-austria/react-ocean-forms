import { renderHook, cleanup } from 'react-hooks-testing-library';

import { useFormContext } from '../useFormContext';
import { useFormEventListener } from './useFormEventListener';

jest.mock('../useFormContext');
afterEach(cleanup);

interface ISetupResult {
  registerListener: jest.Mock;
  unregisterListener: jest.Mock;
  fullName: string;
  mockListener: jest.Mock;
  rerender(): void;
}

function setup(): ISetupResult {
  const registerListener = jest.fn();
  const unregisterListener = jest.fn();
  const mockListener = jest.fn();

  (useFormContext as jest.Mock).mockReturnValue({
    registerListener,
    unregisterListener,
  });

  const fullName = 'mock-name';

  const { rerender } = renderHook(() => useFormEventListener(
    fullName,
    mockListener,
  ));

  return {
    registerListener,
    unregisterListener,
    mockListener,
    fullName,
    rerender,
  }
}

describe('useFormEventListener', () => {
  it('should call formContext.registerListener with the correct values', () => {
    const { mockListener, fullName, registerListener, unregisterListener } = setup();

    expect(registerListener).toHaveBeenCalledTimes(1);
    expect(registerListener).toHaveBeenCalledWith(fullName, mockListener);
    expect(unregisterListener).not.toHaveBeenCalled();
  });

  it('should call formContext.unregisterField on unmount', () => {
    const { unregisterListener, fullName } = setup();

    cleanup();

    expect(unregisterListener).toHaveBeenCalledTimes(1);
    expect(unregisterListener).toHaveBeenCalledWith(fullName);
  });

  it('should not re-register itself if nothing has changed', () => {
    const { registerListener, unregisterListener, rerender } = setup();

    registerListener.mockClear();
    unregisterListener.mockClear();

    rerender();

    expect(unregisterListener).not.toHaveBeenCalled();
    expect(registerListener).not.toHaveBeenCalled();
  });
});