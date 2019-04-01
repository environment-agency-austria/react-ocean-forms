import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { createMockFormContext, createMockValidation } from '../../../test-utils/enzymeFormContext';
import { IFieldState, IFormContext } from '../../FormContext';
import { IValidationProp } from '../../withValidation';
import { BaseField } from './Field';
import { IFieldComponentFieldProps, IFieldProps, TBasicFieldValue } from './Field.types';

describe('<Field />', () => {
  const mockName = 'unitField';
  const mockLabel = 'Unit field';

  interface ISetupArgs {
    props?: Partial<IFieldProps>;
    contextOverrides?: Partial<IFormContext>;
    renderCallback?(field: IFieldComponentFieldProps): void;
  }

  interface ISetupResult {
    formContext: IFormContext;
    fieldState: IFieldState;
    validation: IValidationProp;
    fieldProps: IFieldComponentFieldProps;
    wrapper: ShallowWrapper;
  }

  const setup = ({
    props,
    contextOverrides,
    renderCallback,
  }: Partial<ISetupArgs> = {}): ISetupResult => {
    let fieldState: IFieldState;
    let fieldProps: IFieldComponentFieldProps;
    const registerCallback = (name: string, state: IFieldState): void => { fieldState = state; };

    const formContext: IFormContext = {
      ...createMockFormContext(registerCallback),
      ...contextOverrides,
    };
    const validation = createMockValidation();

    const defaultRenderCallback = (field: IFieldComponentFieldProps): JSX.Element => {
      fieldProps = field;

      if (renderCallback) { renderCallback(fieldProps); }

      return (
        <div id="test-component" />
      );
    };

    const wrapper = shallow((
      <BaseField
        name={mockName}
        fullName={mockName}
        label={mockLabel}
        context={formContext}
        validation={validation}
        render={defaultRenderCallback}
        {...props}
      />
    ));

    return {
      formContext,
      //@ts-ignore Field state is always initialized through the registerCallback
      fieldState,
      validation,
      //@ts-ignore Field props should be always initialized through the render callback
      fieldProps,
      wrapper,
    };
  };

  const assertValue = (fieldProps: IFieldComponentFieldProps, value: TBasicFieldValue): unknown => expect(fieldProps.value).toBe(value);
  const simulateChange = (field: IFieldComponentFieldProps, value: TBasicFieldValue): void => {
    field.onChange({
      target: {
        value,
      },
    });
  };

  describe('Render', () => {
    it('should render without crashing', () => {
      const { wrapper } = setup();
      expect(wrapper).toMatchSnapshot();
    });

    describe('render prop', () => {
      it('should call the render prop', () => {
        const renderCallback = jest.fn();
        setup({ props: { render: renderCallback }});
        expect(renderCallback).toHaveBeenCalled();
      });
    });
  });

  describe('Form registration', () => {
    let formContext: IFormContext;
    let validation: IValidationProp;
    let wrapper: ShallowWrapper;

    beforeAll(() => {
      ({ formContext, validation, wrapper } = setup());
    });

    it('should register itself in the form context', () => {
      expect(formContext.registerField).toHaveBeenCalledWith(
        mockName,
        {
          label: mockLabel,
          validate: expect.any(Function),
          reset: expect.any(Function),
          getValue: expect.any(Function),
          updateValidation: validation.update,
        },
      );
    });

    it('should unregister itself on unmount', () => {
      wrapper.unmount();
      expect(formContext.unregisterField).toHaveBeenCalledWith(mockName);
    });
  });

  describe('Invalid form context', () => {
    const mockErrorString = `Could not find a form context for field "${mockName}". `
                          + 'Fields can only be used inside a Form tag.';

    it('should throw an error if there is no form context', () => {
      expect(() => setup({ props: { context: undefined } })).toThrowError(mockErrorString);
    });

    it('should throw an error if the form context is invalid', () => {
      // @ts-ignore The whole point of this test is to check the behaviour with an invalid type
      expect(() => setup({ props: { context: { foo: 'bar' } } })).toThrowError(mockErrorString);
    });
  });

  describe('Default value handling', () => {
    let wrapper: ShallowWrapper;
    let fieldProps: IFieldComponentFieldProps;

    afterEach(() => wrapper.unmount());

    it('should have an empty string as the default value', () => {
      ({ wrapper, fieldProps } = setup());
      assertValue(fieldProps, '');
    });

    it('should use the default value from Form.defaultValues if existing', () => {
      const mockDefaultValue = 'mock-default-value';

      ({ wrapper, fieldProps } = setup({
        contextOverrides: {
          defaultValues: { [mockName]: mockDefaultValue },
        },
      }));

      assertValue(fieldProps, mockDefaultValue);
    });

    it('should use the Field.defaultValue if existing', () => {
      const mockDefaultValue = 'mock-field-value';

      ({ wrapper, fieldProps } = setup({
        props: {
          defaultValue: mockDefaultValue,
        },
      }));

      assertValue(fieldProps, mockDefaultValue);
    });

    it('should prefer the Field.defaultValue over the Form.defaultValues', () => {
      const mockFieldDefaultValue = 'mock-field-value';
      const mockFormDefaultValue = 'mock-form-value';

      ({ wrapper, fieldProps } = setup({
        props: {
          defaultValue: mockFieldDefaultValue,
        },
        contextOverrides: {
          defaultValues: { [mockName]: mockFormDefaultValue },
        },
      }));

      assertValue(fieldProps, mockFieldDefaultValue);
    });

    it('should not use the defaultValue if the Field is touched', () => {
      let formContext;

      const mockDefaultValue = 'mock-field-value';
      const mockChangeValue = 'mock-change-value';

      ({ wrapper, formContext, fieldProps } = setup({
        renderCallback: (newProps: IFieldComponentFieldProps): void => { fieldProps = newProps; },
      }));

      // Recreate a field value change
      simulateChange(fieldProps, mockChangeValue);

      // Set new defaultProps through Form.defaultValues
      formContext.defaultValues = { [mockName]: mockDefaultValue };
      wrapper.setProps({ context: formContext });
      assertValue(fieldProps, mockChangeValue);

      // Set new defaultProps through Field.defaultValue
      wrapper.setProps({ defaultValue: mockDefaultValue });
      assertValue(fieldProps, mockChangeValue);
    });
  });

  describe('Prop value handling', () => {
    let wrapper: ShallowWrapper;
    let fieldProps: IFieldComponentFieldProps;

    afterEach(() => wrapper.unmount());

    it('should use the value from Form.values if existing', () => {
      const mockValue = 'mock-value';

      ({ wrapper, fieldProps } = setup({
        contextOverrides: {
          values: { [mockName]: mockValue },
        },
      }));

      assertValue(fieldProps, mockValue);
    });

    it('should use the Field.value if existing', () => {
      const mockValue = 'mock-field-value';

      ({ wrapper, fieldProps } = setup({
        props: {
          value: mockValue,
        },
      }));

      assertValue(fieldProps, mockValue);
    });

    it('should prefer the Field.value over the Form.values', () => {
      const mockFieldValue = 'mock-field-value';
      const mockFormValue = 'mock-form-value';

      ({ wrapper, fieldProps } = setup({
        props: {
          value: mockFieldValue,
        },
        contextOverrides: {
          values: { [mockName]: mockFormValue },
        },
      }));

      assertValue(fieldProps, mockFieldValue);
    });

    it('Field.value should override the default values', () => {
      const mockValue = 'mock-field-value';
      const mockDefaultValue = 'mock-default-value';

      ({ wrapper, fieldProps } = setup({
        props: {
          value: mockValue,
          defaultValue: mockDefaultValue,
        },
        contextOverrides: {
          defaultValues: { [mockName]: mockDefaultValue },
        },
      }));

      assertValue(fieldProps, mockValue);
    });

    it('Form.values should override the default values', () => {
      const mockValue = 'mock-field-value';
      const mockDefaultValue = 'mock-default-value';

      ({ wrapper, fieldProps } = setup({
        props: {
          defaultValue: mockDefaultValue,
        },
        contextOverrides: {
          values: { [mockName]: mockValue },
          defaultValues: { [mockName]: mockDefaultValue },
        },
      }));

      assertValue(fieldProps, mockValue);
    });

    it('should use the changed value even if the Field is touched', () => {
      let formContext;

      let mockValue = 'mock-field-value';
      const mockChangeValue = 'mock-change-value';

      const updateValue = (): void => {
        // Recreate a field value change
        simulateChange(fieldProps, mockChangeValue);
        assertValue(fieldProps, mockChangeValue);
      };

      ({ wrapper, formContext, fieldProps } = setup({
        renderCallback: (newProps: IFieldComponentFieldProps): void => { fieldProps = newProps; },
      }));

      // Mock user input
      updateValue();

      // Set new value through Form.values
      formContext.values = { [mockName]: mockValue };
      wrapper.setProps({ context: formContext });
      assertValue(fieldProps, mockValue);

      // Mock user input
      updateValue();

      // Set new props through Field.value
      mockValue = 'mock-new-field-value';
      wrapper.setProps({ value: mockValue });
      assertValue(fieldProps, mockValue);
    });
  });

  describe('onChange handling', () => {
    const mockValue = 'mock-change-value';

    let wrapper: ShallowWrapper;
    let validation: IValidationProp;
    let formContext: IFormContext;
    let fieldProps: IFieldComponentFieldProps;

    const setupOnChange = (props?: Partial<IFieldProps>, contextOverrides?: Partial<IFormContext>): void => {
      ({ wrapper, validation, formContext, fieldProps } = setup({
        props,
        contextOverrides,
        renderCallback: (newProps: IFieldComponentFieldProps): void => { fieldProps = newProps; },
      }));
      simulateChange(fieldProps, mockValue);
    };

    afterEach(() => {
      wrapper.unmount();
    });

    it('should remember the changed value', () => {
      setupOnChange();
      assertValue(fieldProps, mockValue);
    });

    it('should call the validate function', () => {
      setupOnChange();
      expect(validation.validate).toHaveBeenCalledWith(
        mockValue,
        { checkAsync: false },
      );
    });

    it('should notify the form context', () => {
      setupOnChange();
      expect(formContext.notifyFieldEvent).toHaveBeenCalledWith(
        mockName,
        'change',
        mockValue,
      );
    });

    it('should call the Field.onChange handler', () => {
      const mockOnChange = jest.fn();
      setupOnChange({ onChange: mockOnChange });
      expect(mockOnChange).toHaveBeenCalledWith(mockValue);
    });

    it('should respect the Form.asyncValidateOnChange configuration', () => {
      const mockCheckAsync = true;
      setupOnChange(undefined, { asyncValidateOnChange: mockCheckAsync });
      expect(validation.validate).toHaveBeenCalledWith(
        mockValue,
        { checkAsync: mockCheckAsync },
      );
    });

    it('should respect the Field.asyncValidateOnChange configuration', () => {
      const mockCheckAsync = true;
      setupOnChange({ asyncValidateOnChange: mockCheckAsync });

      expect(validation.validate).toHaveBeenCalledWith(
        mockValue,
        { checkAsync: mockCheckAsync },
      );
    });

    describe('Field.getSubmitValue', () => {
      it('should call the Field.getSubmitValue callback', () => {
        const mockGetSubmitValue = jest.fn().mockImplementation((value: TBasicFieldValue): TBasicFieldValue => value);
        setupOnChange({ getSubmitValue: mockGetSubmitValue });

        expect(mockGetSubmitValue).toHaveBeenCalledWith(
          mockValue,
          { disabled: false, plaintext: false },
        );
      });

      describe('meta.disabled handling', () => {
        const cases: [string, boolean, boolean | undefined, boolean][] = [
          [ 'Field.disabled = undefined, FormContext.disabled = false', false, undefined, false ],
          [ 'Field.disabled = undefined, FormContext.disabled = true', true, undefined, true ],
          [ 'Field.disabled = false, FormContext.disabled = false', false, false, false ],
          [ 'Field.disabled = false, FormContext.disabled = true', false, false, true ],
          [ 'Field.disabled = true, FormContext.disabled = true', true, true, true ],
          [ 'Field.disabled = true, FormContext.disabled = false', true, true, false ],
        ];
        it.each(cases)(
          'Case "%s" should result in disabled = %s',
          (name: string, expectedValue: boolean, overridenValue: boolean | undefined, contextValue: boolean) => {
            const mockGetSubmitValue = jest.fn().mockImplementation((value: TBasicFieldValue): TBasicFieldValue => value);
            setupOnChange({ getSubmitValue: mockGetSubmitValue, disabled: overridenValue }, { disabled: contextValue });

            expect(mockGetSubmitValue).toHaveBeenCalledWith(
              mockValue,
              { disabled: expectedValue, plaintext: false },
            );
          },
        );
      });

      describe('meta.plaintext handling', () => {
        const cases: [string, boolean, boolean | undefined, boolean][] = [
          [ 'Field.plaintext = undefined, FormContext.plaintext = false', false, undefined, false ],
          [ 'Field.plaintext = undefined, FormContext.plaintext = true', true, undefined, true ],
          [ 'Field.plaintext = false, FormContext.plaintext = false', false, false, false ],
          [ 'Field.plaintext = false, FormContext.plaintext = true', false, false, true ],
          [ 'Field.plaintext = true, FormContext.plaintext = true', true, true, true ],
          [ 'Field.plaintext = true, FormContext.plaintext = false', true, true, false ],
        ];
        it.each(cases)(
          'Case "%s" should result in plaintext = %s',
          (name: string, expectedValue: boolean, overridenValue: boolean | undefined, contextValue: boolean) => {
            const mockGetSubmitValue = jest.fn().mockImplementation((value: TBasicFieldValue): TBasicFieldValue => value);
            setupOnChange({ getSubmitValue: mockGetSubmitValue, plaintext: overridenValue }, { plaintext: contextValue });

            expect(mockGetSubmitValue).toHaveBeenCalledWith(
              mockValue,
              { disabled: false, plaintext: expectedValue },
            );
          },
        );
      });
    });
  });

  describe('onBlur handling', () => {
    const mockValue = 'mock-value';

    let wrapper: ShallowWrapper;
    let validation: IValidationProp;
    let formContext: IFormContext;
    let fieldProps: IFieldComponentFieldProps;

    const setupLocal = (props?: Partial<IFieldProps>, contextOverrides?: Partial<IFormContext>): void => {
      ({ wrapper, validation, formContext, fieldProps } = setup({
        props: { ...props, value: mockValue },
        contextOverrides: contextOverrides,
      }));
    };

    const setupOnBlur = (props?: Partial<IFieldProps>, contextOverrides?: Partial<IFormContext>): void => {
      setupLocal(props, contextOverrides);
      fieldProps.onBlur();
    };

    afterEach(() => {
      wrapper.unmount();
    });

    it('should call the Field.getSubmitValue function', () => {
      const mockGetSubmitValue = jest.fn().mockImplementation((value: TBasicFieldValue): TBasicFieldValue => value);
      setupOnBlur({ getSubmitValue: mockGetSubmitValue });

      expect(mockGetSubmitValue).toHaveBeenCalledWith(
        mockValue,
        { disabled: false, plaintext: false },
      );
    });

    it('should call the validate function', () => {
      const mockChangeValue = 'foo';
      setupLocal();

      simulateChange(fieldProps, mockChangeValue);

      (validation.validate as jest.Mock).mockClear();

      fieldProps.onBlur();
      expect(validation.validate).toHaveBeenCalledWith(mockChangeValue);
    });

    it('should not call the validate function if the field is not dirty', () => {
      setupOnBlur();
      expect(validation.validate).not.toHaveBeenCalledWith(mockValue);
    });

    it('should notify the form context', () => {
      setupOnBlur();
      expect(formContext.notifyFieldEvent).toHaveBeenCalledWith(
        mockName,
        'blur',
      );
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
      const { getDisplayValue, fieldProps } = setupWithDisplayName();
      assertValue(fieldProps, mockDisplayValue);
      expect(getDisplayValue).toHaveBeenCalledWith(
        '',
        { disabled: false, plaintext: false },
      );
    });

    it('should call getDisplayValue whenever the Context.disabled state changes', () => {
      const { wrapper, formContext, getDisplayValue } = setupWithDisplayName();
      getDisplayValue.mockClear();

      formContext.disabled = true;
      wrapper.setProps({ context: formContext });

      expect(getDisplayValue).toHaveBeenCalledWith(
        mockValue,
        { disabled: true, plaintext: false },
      );
    });

    it('should call getDisplayValue whenever the Context.plaintext state changes', () => {
      const { wrapper, formContext, getDisplayValue } = setupWithDisplayName();
      getDisplayValue.mockClear();

      formContext.plaintext = true;
      wrapper.setProps({ context: formContext });

      expect(getDisplayValue).toHaveBeenCalledWith(
        mockValue,
        { disabled: false, plaintext: true },
      );
    });

    it('should call getDisplayValue whenever the disabled prop changes', () => {
      const { wrapper, getDisplayValue } = setupWithDisplayName();
      getDisplayValue.mockClear();

      wrapper.setProps({ disabled: true });

      expect(getDisplayValue).toHaveBeenCalledWith(
        mockValue,
        { disabled: true, plaintext: false },
      );
    });

    it('should call getDisplayValue whenever the plaintext prop changes', () => {
      const { wrapper, getDisplayValue } = setupWithDisplayName();
      getDisplayValue.mockClear();

      wrapper.setProps({ plaintext: true });

      expect(getDisplayValue).toHaveBeenCalledWith(
        mockValue,
        { disabled: false, plaintext: true },
      );
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
        expect(mockGetSubmitValue).toHaveBeenCalledWith(
          mockValue,
          { disabled: false, plaintext: false },
        );
      });
    });

    describe('Context.validate', () => {
      it('should correctly pass the validate method', () => {
        const mockValidateArgs = { checkAsync: false };
        const mockValue = 'field-value';

        const { fieldState, validation } = setup({ props: { value: mockValue } });
        void fieldState.validate(mockValidateArgs);

        expect(validation.validate).toHaveBeenLastCalledWith(
          mockValue,
          mockValidateArgs,
        );
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

        void fieldState.validate();
        expect(mockGetSubmitValue).toHaveBeenCalledWith(
          mockValue,
          { disabled: false, plaintext: false },
        );
      });
    });

    describe('Context.reset', () => {
      it('should reset its validation state', () => {
        const { fieldState, validation } = setup();

        fieldState.reset();
        expect(validation.reset).toHaveBeenCalled();
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
          const { fieldState, fieldProps } = setup({ props, contextOverrides });

          simulateChange(fieldProps, mockChangeValue);
          fieldState.reset();

          assertValue(fieldProps, mockDefaultValue);
        });

        it('should call the Field.getDisplayValue function', () => {
          const mockDisplayValue = 'mock-display-value';
          const mockGetDisplayValue = jest.fn().mockReturnValue(mockDisplayValue);

          const { fieldState, fieldProps } = setup({
            props: {
              ...props,
              getDisplayValue: mockGetDisplayValue,
            },
            contextOverrides: contextOverrides,
          });

          simulateChange(fieldProps, mockChangeValue);
          fieldState.reset();

          assertValue(fieldProps, mockDisplayValue);
          expect(mockGetDisplayValue).toHaveBeenCalledWith(
            mockDefaultValue,
            { disabled: false, plaintext: false },
          );
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

          fieldState.reset();
          expect(mockOnChange).toHaveBeenCalledWith(mockDefaultValue);
        });
      });
    });
  });
});
