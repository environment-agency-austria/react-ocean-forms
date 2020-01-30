import { renderHook, act } from '@testing-library/react-hooks';

import { IFormContext } from '../../components';
import {
  createMockFormContext,
  createMockValidationResult,
} from '../../test-utils/enzymeFormContext';
import { useFormContext } from '../useFormContext';
import { useValidation, IUseValidationResult } from '../useValidation';
import { useFullName, useFieldRegistration, IFieldState } from '../internal';

import { useField } from './useField';
import {
  TBasicFieldValue,
  IFieldComponentFieldProps,
  IUseFieldProps,
  IUseFieldResult,
} from './useField.types';

jest.mock('../useFormContext');
jest.mock('../useValidation');
jest.mock('../internal');

describe('useField', () => {
  const mockName = 'unitField';
  const mockLabel = 'Unit field';

  interface ISetupArgs {
    props?: Partial<IUseFieldProps<unknown>>;
    contextOverrides?: Partial<IFormContext>;
  }

  interface ISetupResult {
    formContext: IFormContext;
    validation: IUseValidationResult;
    fieldState: IFieldState;

    usedFieldProps: IUseFieldProps<unknown>;

    unmount(): boolean;
    rerender(newProps?: IUseFieldProps<unknown>): void;
    waitForNextUpdate(): Promise<void>;
    result: { current: IUseFieldResult<unknown> };
  }

  const setup = ({ props, contextOverrides }: Partial<ISetupArgs> = {}): ISetupResult => {
    (useFullName as jest.Mock).mockImplementation((name: string) => name);
    const formContext = {
      ...createMockFormContext(),
      ...contextOverrides,
    };
    (useFormContext as jest.Mock).mockReturnValue(formContext);

    const validation = createMockValidationResult();
    (useValidation as jest.Mock).mockReturnValue(validation);

    let fieldState = null;
    (useFieldRegistration as jest.Mock).mockImplementation((fullName, state) => {
      fieldState = state;
    });

    const useFieldParams = {
      name: mockName,
      label: mockLabel,
      ...props,
    };
    const { result, unmount, rerender, waitForNextUpdate } = renderHook(useField, {
      initialProps: useFieldParams,
    });

    return {
      formContext,
      validation,

      // @ts-ignore
      fieldState,

      usedFieldProps: useFieldParams,

      unmount,
      rerender,
      waitForNextUpdate,
      result,
    };
  };

  const assertValue = (
    fieldProps: IFieldComponentFieldProps<unknown>,
    value: TBasicFieldValue
  ): unknown => expect(fieldProps.value).toBe(value);
  const simulateChange = (
    field: IFieldComponentFieldProps<unknown>,
    value: TBasicFieldValue
  ): void => {
    act(() => {
      field.onChange({
        target: {
          value,
        },
      });
    });
  };

  describe('Form registration', () => {
    it('should register itself in the form context', () => {
      const { fieldState } = setup();
      expect(useFieldRegistration as jest.Mock).toHaveBeenCalledWith(mockName, fieldState);
    });
  });

  describe('Default value handling', () => {
    it('should have undefined as the default value', () => {
      const { result } = setup();
      assertValue(result.current.fieldProps, undefined);
    });

    it('should use the default value from Form.defaultValues if existing', () => {
      const mockDefaultValue = 'mock-default-value';

      const { result } = setup({
        contextOverrides: {
          defaultValues: { [mockName]: mockDefaultValue },
        },
      });

      assertValue(result.current.fieldProps, mockDefaultValue);
    });

    it('should use the Field.defaultValue if existing', () => {
      const mockDefaultValue = 'mock-field-value';

      const { result } = setup({
        props: {
          defaultValue: mockDefaultValue,
        },
      });

      assertValue(result.current.fieldProps, mockDefaultValue);
    });

    it('should prefer the Field.defaultValue over the Form.defaultValues', () => {
      const mockFieldDefaultValue = 'mock-field-value';
      const mockFormDefaultValue = 'mock-form-value';

      const { result } = setup({
        props: {
          defaultValue: mockFieldDefaultValue,
        },
        contextOverrides: {
          defaultValues: { [mockName]: mockFormDefaultValue },
        },
      });

      assertValue(result.current.fieldProps, mockFieldDefaultValue);
    });

    it('should not use the defaultValue if the Field is touched', () => {
      const mockDefaultValue = 'mock-field-value';
      const mockChangeValue = 'mock-change-value';

      const { formContext, result, rerender, usedFieldProps } = setup();

      // Recreate a field value change
      simulateChange(result.current.fieldProps, mockChangeValue);

      // Set new defaultProps through Form.defaultValues
      formContext.defaultValues = { [mockName]: mockDefaultValue };
      rerender();
      assertValue(result.current.fieldProps, mockChangeValue);

      // Set new defaultProps through Field.defaultValue
      rerender({
        ...usedFieldProps,
        defaultValue: mockDefaultValue,
      });
      assertValue(result.current.fieldProps, mockChangeValue);
    });
  });

  describe('Prop value handling', () => {
    it('should use the value from Form.values if existing', () => {
      const mockValue = 'mock-value';

      const { result } = setup({
        contextOverrides: {
          values: { [mockName]: mockValue },
        },
      });

      assertValue(result.current.fieldProps, mockValue);
    });

    it('should use the Field.value if existing', () => {
      const mockValue = 'mock-field-value';

      const { result } = setup({
        props: {
          value: mockValue,
        },
      });

      assertValue(result.current.fieldProps, mockValue);
    });

    it('should prefer the Field.value over the Form.values', () => {
      const mockFieldValue = 'mock-field-value';
      const mockFormValue = 'mock-form-value';

      const { result } = setup({
        props: {
          value: mockFieldValue,
        },
        contextOverrides: {
          values: { [mockName]: mockFormValue },
        },
      });

      assertValue(result.current.fieldProps, mockFieldValue);
    });

    it('Field.value should override the default values', () => {
      const mockValue = 'mock-field-value';
      const mockDefaultValue = 'mock-default-value';

      const { result } = setup({
        props: {
          value: mockValue,
          defaultValue: mockDefaultValue,
        },
        contextOverrides: {
          defaultValues: { [mockName]: mockDefaultValue },
        },
      });

      assertValue(result.current.fieldProps, mockValue);
    });

    it('Form.values should override the default values', () => {
      const mockValue = 'mock-field-value';
      const mockDefaultValue = 'mock-default-value';

      const { result } = setup({
        props: {
          defaultValue: mockDefaultValue,
        },
        contextOverrides: {
          values: { [mockName]: mockValue },
          defaultValues: { [mockName]: mockDefaultValue },
        },
      });

      assertValue(result.current.fieldProps, mockValue);
    });

    it('should use the changed value even if the Field is touched', () => {
      let mockValue = 'mock-field-value';
      const mockChangeValue = 'mock-change-value';

      const { formContext, result, rerender, usedFieldProps } = setup();

      const updateValue = (): void => {
        // Recreate a field value change
        simulateChange(result.current.fieldProps, mockChangeValue);
        assertValue(result.current.fieldProps, mockChangeValue);
      };

      // Mock user input
      updateValue();

      // Set new value through Form.values
      formContext.values = { [mockName]: mockValue };
      rerender();

      assertValue(result.current.fieldProps, mockValue);

      // Mock user input
      updateValue();

      // Set new props through Field.value
      mockValue = 'mock-new-field-value';
      rerender({
        ...usedFieldProps,
        value: mockValue,
      });
      assertValue(result.current.fieldProps, mockValue);
    });
  });

  describe('onChange handling', () => {
    const mockValue = 'mock-change-value';

    const setupOnChange = (
      props?: Partial<IUseFieldProps<unknown>>,
      contextOverrides?: Partial<IFormContext>
    ): ISetupResult => {
      const setupResult = setup({
        props,
        contextOverrides,
      });
      simulateChange(setupResult.result.current.fieldProps, mockValue);

      return setupResult;
    };

    it('should remember the changed value', () => {
      const { result } = setupOnChange();
      assertValue(result.current.fieldProps, mockValue);
    });

    it('should call the validate function', () => {
      const { validation } = setupOnChange();
      expect(validation.validate).toHaveBeenCalledWith(mockValue, { checkAsync: false });
    });

    it('should notify the form context', () => {
      const { formContext } = setupOnChange();
      expect(formContext.notifyFieldEvent).toHaveBeenCalledWith(mockName, 'change', mockValue);
    });

    it('should call the Field.onChange handler', () => {
      const mockOnChange = jest.fn();
      setupOnChange({ onChange: mockOnChange });
      expect(mockOnChange).toHaveBeenCalledWith(mockValue);
    });

    it('should respect the Form.asyncValidateOnChange configuration', () => {
      const mockCheckAsync = true;
      const { validation } = setupOnChange(undefined, { asyncValidateOnChange: mockCheckAsync });
      expect(validation.validate).toHaveBeenCalledWith(mockValue, { checkAsync: mockCheckAsync });
    });

    it('should respect the Field.asyncValidateOnChange configuration', () => {
      const mockCheckAsync = true;
      const { validation } = setupOnChange({ asyncValidateOnChange: mockCheckAsync });

      expect(validation.validate).toHaveBeenCalledWith(mockValue, { checkAsync: mockCheckAsync });
    });

    describe('Field.getSubmitValue', () => {
      it('should call the Field.getSubmitValue callback', () => {
        const mockGetSubmitValue = jest
          .fn()
          .mockImplementation((value: TBasicFieldValue): TBasicFieldValue => value);
        setupOnChange({ getSubmitValue: mockGetSubmitValue });

        expect(mockGetSubmitValue).toHaveBeenCalledWith(mockValue, {
          disabled: false,
          plaintext: false,
        });
      });

      describe('meta.disabled handling', () => {
        const cases: [string, boolean, boolean | undefined, boolean][] = [
          ['Field.disabled = undefined, FormContext.disabled = false', false, undefined, false],
          ['Field.disabled = undefined, FormContext.disabled = true', true, undefined, true],
          ['Field.disabled = false, FormContext.disabled = false', false, false, false],
          ['Field.disabled = false, FormContext.disabled = true', false, false, true],
          ['Field.disabled = true, FormContext.disabled = true', true, true, true],
          ['Field.disabled = true, FormContext.disabled = false', true, true, false],
        ];
        it.each(cases)(
          'Case "%s" should result in disabled = %s',
          (
            name: string,
            expectedValue: boolean,
            overridenValue: boolean | undefined,
            contextValue: boolean
          ) => {
            const mockGetSubmitValue = jest
              .fn()
              .mockImplementation((value: TBasicFieldValue): TBasicFieldValue => value);
            setupOnChange(
              { getSubmitValue: mockGetSubmitValue, disabled: overridenValue },
              { disabled: contextValue }
            );

            expect(mockGetSubmitValue).toHaveBeenCalledWith(mockValue, {
              disabled: expectedValue,
              plaintext: false,
            });
          }
        );
      });

      describe('meta.plaintext handling', () => {
        const cases: [string, boolean, boolean | undefined, boolean][] = [
          ['Field.plaintext = undefined, FormContext.plaintext = false', false, undefined, false],
          ['Field.plaintext = undefined, FormContext.plaintext = true', true, undefined, true],
          ['Field.plaintext = false, FormContext.plaintext = false', false, false, false],
          ['Field.plaintext = false, FormContext.plaintext = true', false, false, true],
          ['Field.plaintext = true, FormContext.plaintext = true', true, true, true],
          ['Field.plaintext = true, FormContext.plaintext = false', true, true, false],
        ];
        it.each(cases)(
          'Case "%s" should result in plaintext = %s',
          (
            name: string,
            expectedValue: boolean,
            overridenValue: boolean | undefined,
            contextValue: boolean
          ) => {
            const mockGetSubmitValue = jest
              .fn()
              .mockImplementation((value: TBasicFieldValue): TBasicFieldValue => value);
            setupOnChange(
              { getSubmitValue: mockGetSubmitValue, plaintext: overridenValue },
              { plaintext: contextValue }
            );

            expect(mockGetSubmitValue).toHaveBeenCalledWith(mockValue, {
              disabled: false,
              plaintext: expectedValue,
            });
          }
        );
      });
    });
  });

  describe('onBlur handling', () => {
    const mockValue = 'mock-value';

    const setupLocal = (
      props?: Partial<IUseFieldProps<unknown>>,
      contextOverrides?: Partial<IFormContext>
    ): ISetupResult => {
      return setup({
        props: { ...props, value: mockValue },
        contextOverrides: contextOverrides,
      });
    };

    const setupOnBlur = (
      props?: Partial<IUseFieldProps<unknown>>,
      contextOverrides?: Partial<IFormContext>
    ): ISetupResult => {
      const setupResult = setupLocal(props, contextOverrides);

      act(() => {
        setupResult.result.current.fieldProps.onBlur();
      });

      return setupResult;
    };

    it('should call the validate function with the value from Field.getSubmitValue', () => {
      const mockGetSubmitValue = jest
        .fn()
        .mockImplementation((value: TBasicFieldValue): TBasicFieldValue => value);
      const mockChangeValue = 'foo';
      const { result, validation } = setupLocal({ getSubmitValue: mockGetSubmitValue });

      simulateChange(result.current.fieldProps, mockChangeValue);

      (validation.validate as jest.Mock).mockClear();

      act(() => {
        result.current.fieldProps.onBlur();
      });
      expect(validation.validate).toHaveBeenCalledWith(mockChangeValue);
      expect(mockGetSubmitValue).toHaveBeenCalledWith(mockChangeValue, {
        disabled: false,
        plaintext: false,
      });
    });

    it('should not call the validate function if the field is not dirty', () => {
      const { validation } = setupOnBlur();
      expect(validation.validate).not.toHaveBeenCalledWith(mockValue);
    });

    it('should not call the Field.getSubmitValue function if the field is not dirty', () => {
      const mockGetSubmitValue = jest
        .fn()
        .mockImplementation((value: TBasicFieldValue): TBasicFieldValue => value);
      const { validation } = setupOnBlur({ getSubmitValue: mockGetSubmitValue });

      expect(validation.validate).not.toHaveBeenCalledWith(mockValue);
      expect(mockGetSubmitValue).not.toHaveBeenCalled();
    });

    it('should notify the form context', () => {
      const { formContext } = setupOnBlur();
      expect(formContext.notifyFieldEvent).toHaveBeenCalledWith(mockName, 'blur');
    });

    it('should call the Field.onBlur handler', () => {
      const mockOnBlur = jest.fn();
      setupOnBlur({ onBlur: mockOnBlur });
      expect(mockOnBlur).toHaveBeenCalled();
    });
  });

  describe('getDisplayValue handling', () => {
    const mockDisplayValue = 'mock-display-value';
    const mockValue = 'mock-value';

    interface IDisplayName {
      getDisplayValue: jest.Mock;
    }

    const setupWithDisplayName = (): ISetupResult & IDisplayName => {
      const mockGetDisplayValue = jest.fn().mockReturnValue(mockDisplayValue);

      return {
        ...setup({ props: { getDisplayValue: mockGetDisplayValue, value: mockValue } }),
        getDisplayValue: mockGetDisplayValue,
      };
    };

    it('should call Field.getDisplayValue on first render', () => {
      const { getDisplayValue, result } = setupWithDisplayName();
      assertValue(result.current.fieldProps, mockDisplayValue);
      expect(getDisplayValue).toHaveBeenCalledWith(undefined, {
        disabled: false,
        plaintext: false,
      });
    });

    it('should call getDisplayValue whenever the Context.disabled state changes', () => {
      const { formContext, getDisplayValue, rerender } = setupWithDisplayName();
      getDisplayValue.mockClear();

      formContext.disabled = true;
      rerender();

      expect(getDisplayValue).toHaveBeenCalledWith(mockValue, { disabled: true, plaintext: false });
    });

    it('should call getDisplayValue whenever the Context.plaintext state changes', () => {
      const { formContext, getDisplayValue, rerender } = setupWithDisplayName();
      getDisplayValue.mockClear();

      formContext.plaintext = true;
      rerender();

      expect(getDisplayValue).toHaveBeenCalledWith(mockValue, { disabled: false, plaintext: true });
    });

    it('should call getDisplayValue whenever the disabled prop changes', () => {
      const { getDisplayValue, rerender, usedFieldProps } = setupWithDisplayName();
      getDisplayValue.mockClear();

      rerender({
        ...usedFieldProps,
        disabled: true,
      });

      expect(getDisplayValue).toHaveBeenCalledWith(mockValue, { disabled: true, plaintext: false });
    });

    it('should call getDisplayValue whenever the plaintext prop changes', () => {
      const { getDisplayValue, rerender, usedFieldProps } = setupWithDisplayName();
      getDisplayValue.mockClear();

      rerender({
        ...usedFieldProps,
        plaintext: true,
      });

      expect(getDisplayValue).toHaveBeenCalledWith(mockValue, { disabled: false, plaintext: true });
    });
  });

  describe('Form context callbacks', () => {
    describe('Context.getValue', () => {
      it('should return the correct value', () => {
        const mockValue = 'field-value';
        const { fieldState } = setup({ props: { value: mockValue } });
        expect(fieldState.getValue()).toBe(mockValue);
      });

      it('should pass the return value through getSubmitValue', () => {
        const mockValue = 'field-value';
        const mockSubmitValue = 'field-submit-value';
        const mockGetSubmitValue = jest.fn().mockReturnValue(mockSubmitValue);

        const { fieldState } = setup({
          props: {
            value: mockValue,
            getSubmitValue: mockGetSubmitValue,
          },
        });

        expect(fieldState.getValue()).toBe(mockSubmitValue);
        expect(mockGetSubmitValue).toHaveBeenCalledWith(mockValue, {
          disabled: false,
          plaintext: false,
        });
      });
    });

    describe('Context.validate', () => {
      it('should correctly pass the validate method', () => {
        const mockValidateArgs = { checkAsync: false };
        const mockValue = 'field-value';

        const { fieldState, validation } = setup({ props: { value: mockValue } });
        void fieldState.validate(mockValidateArgs);

        expect(validation.validate).toHaveBeenLastCalledWith(mockValue, mockValidateArgs);
      });

      it('should pass the validated value through getSubmitValue', () => {
        const mockValue = 'field-value';
        const mockSubmitValue = 'field-submit-value';
        const mockGetSubmitValue = jest.fn().mockReturnValue(mockSubmitValue);

        const { fieldState } = setup({
          props: {
            value: mockValue,
            getSubmitValue: mockGetSubmitValue,
          },
        });

        act(() => {
          void fieldState.validate();
        });

        expect(mockGetSubmitValue).toHaveBeenCalledWith(mockValue, {
          disabled: false,
          plaintext: false,
        });
      });
    });

    describe('Context.reset', () => {
      it('should reset its validation state', () => {
        const { fieldState, validation } = setup();

        act(() => {
          fieldState.reset();
        });
        expect(validation.resetValidation).toHaveBeenCalled();
      });

      const cases = [
        ['Field.defaultValue', 'defaultValue', undefined],
        ['Field.value', 'value', undefined],
        ['Form.defaultValues', undefined, 'defaultValues'],
        ['Form.values', undefined, 'values'],
      ];

      describe.each(cases)('Reset to %s', (name, prop, context) => {
        const mockDefaultValue = 'field-default-value';
        const mockChangeValue = 'field-change-value';

        const props = prop ? { [prop]: mockDefaultValue } : undefined;
        const contextOverrides = context
          ? { [context]: { [mockName]: mockDefaultValue } }
          : undefined;

        it('should correctly reset to its defaultValue', () => {
          const { fieldState, result } = setup({ props, contextOverrides });

          simulateChange(result.current.fieldProps, mockChangeValue);
          act(() => {
            fieldState.reset();
          });

          assertValue(result.current.fieldProps, mockDefaultValue);
        });

        it('should call the Field.getDisplayValue function', () => {
          const mockDisplayValue = 'mock-display-value';
          const mockGetDisplayValue = jest.fn().mockReturnValue(mockDisplayValue);

          const { fieldState, result } = setup({
            props: {
              ...props,
              getDisplayValue: mockGetDisplayValue,
            },
            contextOverrides: contextOverrides,
          });

          simulateChange(result.current.fieldProps, mockChangeValue);
          act(() => {
            fieldState.reset();
          });

          assertValue(result.current.fieldProps, mockDisplayValue);
          expect(mockGetDisplayValue).toHaveBeenCalledWith(mockDefaultValue, {
            disabled: false,
            plaintext: false,
          });
        });

        it('should call the onChange handler', () => {
          const mockOnChange = jest.fn();
          const { fieldState } = setup({
            props: {
              onChange: mockOnChange,
              ...props,
            },
            contextOverrides: contextOverrides,
          });

          act(() => {
            fieldState.reset();
          });
          expect(mockOnChange).toHaveBeenCalledWith(mockDefaultValue);
        });
      });
    });
  });
});
