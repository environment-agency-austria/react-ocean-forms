import { renderHook } from '@testing-library/react-hooks';

import { useFieldRegistration } from './useFieldRegistration';
import { useFormContext } from '../useFormContext';
import { IFieldState } from './useFieldStates';

jest.mock('../useFormContext');

function getMockFieldState(): IFieldState {
  return {
    label: 'mock-label',
    isGroup: false,
    updateValidation: jest.fn(),
    validate: jest.fn(),
    reset: jest.fn(),
    getValue: jest.fn(),
  };
}

interface ISetupResult {
  registerField: jest.Mock;
  unregisterField: jest.Mock;
  fullName: string;
  fieldState: IFieldState;
  rerender(): void;
  unmount(): boolean;
}

function setup(): ISetupResult {
  const registerField = jest.fn();
  const unregisterField = jest.fn();

  const fieldState = getMockFieldState();

  (useFormContext as jest.Mock).mockReturnValue({
    registerField,
    unregisterField,
  });

  const fullName = 'mock-name';

  const { rerender, unmount } = renderHook(() => useFieldRegistration(fullName, fieldState));

  return {
    registerField,
    unregisterField,
    fieldState,
    fullName,
    rerender,
    unmount,
  };
}

describe('useFieldRegistration', () => {
  it('should call formContext.registerField with the correct values', () => {
    const { fieldState, fullName, registerField, unregisterField } = setup();

    expect(registerField).toHaveBeenCalledTimes(1);
    expect(registerField).toHaveBeenCalledWith(fullName, fieldState);
    expect(unregisterField).not.toHaveBeenCalled();
  });

  it('should call formContext.unregisterField on unmount', () => {
    const { unregisterField, fullName, unmount } = setup();

    unmount();

    expect(unregisterField).toHaveBeenCalledTimes(1);
    expect(unregisterField).toHaveBeenCalledWith(fullName);
  });

  // TODO: Wait for support with multiple params
  // it('should re-register itself if a value changed', () => {
  //   const { fieldState, registerField, unregisterField, rerender, fullName} = setup();

  //   registerField.mockClear();
  //   unregisterField.mockClear();

  //   const oldName = fullName;
  //   const newName = 'mock-rerender-name';
  //   rerender();

  //   expect(unregisterField).toHaveBeenCalledTimes(1);
  //   expect(unregisterField).toHaveBeenCalledWith(oldName);

  //   expect(registerField).toHaveBeenCalledTimes(1);
  //   expect(registerField).toHaveBeenCalledWith(fullName, fieldState);
  // });

  it('should not re-register itself if nothing has changed', () => {
    const { registerField, unregisterField, rerender } = setup();

    registerField.mockClear();
    unregisterField.mockClear();

    rerender();

    expect(unregisterField).not.toHaveBeenCalled();
    expect(registerField).not.toHaveBeenCalled();
  });
});
