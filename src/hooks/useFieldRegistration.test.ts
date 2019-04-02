import { renderHook, cleanup } from 'react-hooks-testing-library';
import { useFieldRegistration } from './useFieldRegistration';
import { useFormContext } from './useFormContext';

jest.mock('./useFormContext');
afterEach(cleanup);

interface IRegistrationValues {
  fullName: string;
  label: string;
  isGroup: boolean;
  updateValidation: jest.Mock;
  validate: jest.Mock;
  reset: jest.Mock;
  getValue: jest.Mock;
}

function getRegistrationValues(): IRegistrationValues {
  return {
    fullName: 'mock-name',
    label: 'mock-label',
    isGroup: false,
    updateValidation: jest.fn(),
    validate: jest.fn(),
    reset: jest.fn(),
    getValue: jest.fn(),
  };
}

interface IFormContextMockMeta {
  registerField: jest.Mock;
  unregisterField: jest.Mock;
  values: IRegistrationValues;
}

function setupMockFormContext(): IFormContextMockMeta {
  const registerField = jest.fn();
  const unregisterField = jest.fn();

  const values = getRegistrationValues();

  (useFormContext as jest.Mock).mockReturnValue({
    registerField,
    unregisterField,
  });

  return {
    registerField,
    unregisterField,
    values,
  }
}

function renderFieldRegistrationHook(values: IRegistrationValues): { rerender: (() => void)} {
  const { rerender } = renderHook(() => useFieldRegistration(
    values.fullName,
    values.label,
    values.isGroup,
    values.updateValidation,
    values.validate,
    values.reset,
    values.getValue,
  ));

  return { rerender };
}

function expectRegisterFieldCalledCorrectly(registerField: jest.Mock, values: IRegistrationValues): void {
  expect(registerField).toHaveBeenCalledTimes(1);
  expect(registerField).toHaveBeenCalledWith(
    values.fullName,
    {
      label: values.label,

      updateValidation: values.updateValidation,
      validate: values.validate,
      reset: values.reset,
      getValue: values.getValue,

      isGroup: values.isGroup,
    },
  );
}

describe('useFieldRegistration', () => {
  it('should call formContext.registerField with the correct values', () => {
    const { values, registerField, unregisterField } = setupMockFormContext();

    renderFieldRegistrationHook(values);

    expectRegisterFieldCalledCorrectly(registerField, values);
    expect(unregisterField).not.toHaveBeenCalled();
  });

  it('should call formContext.unregisterField on unmount', () => {
    const { values, unregisterField } = setupMockFormContext();

    renderFieldRegistrationHook(values);
    cleanup();

    expect(unregisterField).toHaveBeenCalledTimes(1);
    expect(unregisterField).toHaveBeenCalledWith(values.fullName);
  });

  it('should re-register itself if a value changed', () => {
    const { values, registerField, unregisterField } = setupMockFormContext();
    const { rerender } = renderFieldRegistrationHook(values);

    registerField.mockClear();
    unregisterField.mockClear();

    const oldName = values.fullName;
    values.fullName = 'mock-rerender-name';
    rerender();

    expect(unregisterField).toHaveBeenCalledTimes(1);
    expect(unregisterField).toHaveBeenCalledWith(oldName);

    expectRegisterFieldCalledCorrectly(registerField, values);
  });

  it('should not re-register itself if nothing has changed', () => {
    const { values, registerField, unregisterField } = setupMockFormContext();
    const { rerender } = renderFieldRegistrationHook(values);

    registerField.mockClear();
    unregisterField.mockClear();

    rerender();

    expect(unregisterField).not.toHaveBeenCalled();
    expect(registerField).not.toHaveBeenCalled();
  });
});
