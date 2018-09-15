import * as React from 'react';

// tslint:disable-next-line:no-implicit-dependencies
import { shallow, ShallowWrapper } from 'enzyme';

import { createMockFormContext, createMockValidation } from '../../test-utils/enzymeFormContext';
import { IFieldState, IFormContext } from '../FormContext';
import { IValidationProp } from '../withValidation';
import { BaseField } from './Field';
import { IFieldComponentFieldProps, IFieldProps, TFieldValue } from './Field.types';

describe('<Field />', () => {
  const mockName = 'unitField';
  const mockLabel = 'Unit field';

  interface ISetupArgs {
    props?: Partial<IFieldProps>;
    contextOverrides?: Partial<IFormContext>;
  }

  interface ISetupResult {
    formContext: IFormContext;
    fieldState: IFieldState;
    validation: IValidationProp;
    wrapper: ShallowWrapper;
  }

  const setup = ({
    props,
    contextOverrides,
  }: Partial<ISetupArgs> = {}): ISetupResult => {
    let fieldState: IFieldState;
    const registerCallback = (name: string, state: IFieldState): void => { fieldState = state; };

    const formContext: IFormContext = {
      ...createMockFormContext(registerCallback),
      ...contextOverrides,
    };
    const validation = createMockValidation();

    // tslint:disable-next-line:naming-convention
    const TestComponent = (): JSX.Element => (<div id="test-component" />);

    const wrapper = shallow((
      <BaseField
        name={mockName}
        fullName={mockName}
        label={mockLabel}
        component={TestComponent}
        context={formContext}
        validation={validation}
        {...props}
      />
    ));

    return {
      formContext,
      //@ts-ignore Field state is always initialized through the registerCallback
      fieldState,
      validation,
      wrapper,
    };
  };

  const getTestComponent = (wrapper: ShallowWrapper): ShallowWrapper => wrapper.find('TestComponent');
  const getTestFieldProp = (wrapper: ShallowWrapper): IFieldComponentFieldProps => getTestComponent(wrapper).prop('field');
  const getValue = (wrapper: ShallowWrapper): TFieldValue => getTestFieldProp(wrapper).value;
  const assertValue = (wrapper: ShallowWrapper, value: TFieldValue): unknown => expect(getValue(wrapper)).toBe(value);
  const simulateChange = (wrapper: ShallowWrapper, value: TFieldValue): void => {
    const mockEvent = {
      target: {
        value,
        name: mockName,
      },
    };
    // @ts-ignore This should work anyway...
    getTestFieldProp(wrapper).onChange(mockEvent);
  };
  const simulateBlur = (wrapper: ShallowWrapper): void => {
    const mockEvent = {};
    getTestFieldProp(wrapper).onBlur(mockEvent as React.FocusEvent);
  };

  describe('Render', () => {
    it('should render without crashing', () => {
      const { wrapper } = setup();
      expect(wrapper).toMatchSnapshot();
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

    afterEach(() => wrapper.unmount());

    it('should have an empty string as the default value', () => {
      ({ wrapper } = setup());
      assertValue(wrapper, '');
    });

    it('should use the default value from Form.defaultValues if existing', () => {
      const mockDefaultValue = 'mock-default-value';

      ({ wrapper } = setup({
        contextOverrides: {
          defaultValues: { [mockName]: mockDefaultValue },
        },
      }));

      assertValue(wrapper, mockDefaultValue);
    });

    it('should use the Field.defaultValue if existing', () => {
      const mockDefaultValue = 'mock-field-value';

      ({ wrapper } = setup({
        props: {
          defaultValue: mockDefaultValue,
        },
      }));

      assertValue(wrapper, mockDefaultValue);
    });

    it('should prefer the Field.defaultValue over the Form.defaultValues', () => {
      const mockFieldDefaultValue = 'mock-field-value';
      const mockFormDefaultValue = 'mock-form-value';

      ({ wrapper } = setup({
        props: {
          defaultValue: mockFieldDefaultValue,
        },
        contextOverrides: {
          defaultValues: { [mockName]: mockFormDefaultValue },
        },
      }));

      assertValue(wrapper, mockFieldDefaultValue);
    });

    it('should not use the defaultValue if the Field is touched', () => {
      let formContext;

      const mockDefaultValue = 'mock-field-value';
      const mockChangeValue = 'mock-change-value';

      ({ wrapper, formContext } = setup()); // eslint-disable-line

      // Recreate a field value change
      simulateChange(wrapper, mockChangeValue);

      // Set new defaultProps through Form.defaultValues
      formContext.defaultValues = { [mockName]: mockDefaultValue };
      wrapper.setProps({ context: formContext });
      assertValue(wrapper, mockChangeValue);

      // Set new defaultProps through Field.defaultValue
      wrapper.setProps({ defaultValue: mockDefaultValue });
      assertValue(wrapper, mockChangeValue);
    });
  });

  describe('Prop value handling', () => {
    let wrapper: ShallowWrapper;

    afterEach(() => wrapper.unmount());

    it('should use the value from Form.values if existing', () => {
      const mockValue = 'mock-value';

      ({ wrapper } = setup({
        contextOverrides: {
          values: { [mockName]: mockValue },
        },
      }));

      assertValue(wrapper, mockValue);
    });

    it('should use the Field.value if existing', () => {
      const mockValue = 'mock-field-value';

      ({ wrapper } = setup({
        props: {
          value: mockValue,
        },
      }));

      assertValue(wrapper, mockValue);
    });

    it('should prefer the Field.value over the Form.values', () => {
      const mockFieldValue = 'mock-field-value';
      const mockFormValue = 'mock-form-value';

      ({ wrapper } = setup({
        props: {
          value: mockFieldValue,
        },
        contextOverrides: {
          values: { [mockName]: mockFormValue },
        },
      }));

      assertValue(wrapper, mockFieldValue);
    });

    it('Field.value should override the default values', () => {
      const mockValue = 'mock-field-value';
      const mockDefaultValue = 'mock-default-value';

      ({ wrapper } = setup({
        props: {
          value: mockValue,
          defaultValue: mockDefaultValue,
        },
        contextOverrides: {
          defaultValues: { [mockName]: mockDefaultValue },
        },
      }));

      assertValue(wrapper, mockValue);
    });

    it('Form.values should override the default values', () => {
      const mockValue = 'mock-field-value';
      const mockDefaultValue = 'mock-default-value';

      ({ wrapper } = setup({
        props: {
          defaultValue: mockDefaultValue,
        },
        contextOverrides: {
          values: { [mockName]: mockValue },
          defaultValues: { [mockName]: mockDefaultValue },
        },
      }));

      assertValue(wrapper, mockValue);
    });

    it('should use the changed value even if the Field is touched', () => {
      let formContext;

      let mockValue = 'mock-field-value';
      const mockChangeValue = 'mock-change-value';

      const updateValue = (): void => {
        // Recreate a field value change
        simulateChange(wrapper, mockChangeValue);
        assertValue(wrapper, mockChangeValue);
      };

      ({ wrapper, formContext } = setup()); // eslint-disable-line

      // Mock user input
      updateValue();

      // Set new value through Form.values
      formContext.values = { [mockName]: mockValue };
      wrapper.setProps({ context: formContext });
      assertValue(wrapper, mockValue);

      // Mock user input
      updateValue();

      // Set new props through Field.value
      mockValue = 'mock-new-field-value';
      wrapper.setProps({ value: mockValue });
      assertValue(wrapper, mockValue);
    });
  });

  describe('onChange handling', () => {
    const mockValue = 'mock-change-value';

    let wrapper: ShallowWrapper;
    let validation: IValidationProp;
    let formContext: IFormContext;

    const setupOnChange = (props?: Partial<IFieldProps>, contextOverrides?: Partial<IFormContext>): void => {
      ({ wrapper, validation, formContext } = setup({
        props,
        contextOverrides,
      }));
      simulateChange(wrapper, mockValue);
    };

    afterEach(() => {
      wrapper.unmount();
    });

    it('should remember the changed value', () => {
      setupOnChange();
      assertValue(wrapper, mockValue);
    });

    it('should call the Field.getSubmitValue callback', () => {
      const mockGetSubmitValue = jest.fn().mockImplementation(value => value);
      setupOnChange({ getSubmitValue: mockGetSubmitValue });

      expect(mockGetSubmitValue).toHaveBeenCalledWith(
        mockValue,
        { disabled: false, plaintext: false },
      );
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
  });

  describe('onBlur handling', () => {
    const mockValue = 'mock-value';

    let wrapper: ShallowWrapper;
    let validation: IValidationProp;
    let formContext: IFormContext;

    const setupLocal = (props?: Partial<IFieldProps>, contextOverrides?: Partial<IFormContext>): void => {
      ({ wrapper, validation, formContext } = setup({
        props: { ...props, value: mockValue },
        contextOverrides: contextOverrides,
      }));
    };

    const setupOnBlur = (props?: Partial<IFieldProps>, contextOverrides?: Partial<IFormContext>): void => {
      setupLocal(props, contextOverrides);
      simulateBlur(wrapper);
    };

    afterEach(() => {
      wrapper.unmount();
    });

    it('should call the Field.getSubmitValue function', () => {
      const mockGetSubmitValue = jest.fn().mockImplementation(value => value);
      setupOnBlur({ getSubmitValue: mockGetSubmitValue });

      expect(mockGetSubmitValue).toHaveBeenCalledWith(
        mockValue,
        { disabled: false, plaintext: false },
      );
    });

    it('should call the validate function', () => {
      const mockChangeValue = 'foo';
      setupLocal();

      simulateChange(wrapper, mockChangeValue);

      (validation.validate as jest.Mock).mockClear();

      simulateBlur(wrapper);
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
      const { wrapper, getDisplayValue } = setupWithDisplayName();
      assertValue(wrapper, mockDisplayValue);
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
        fieldState.validate(mockValidateArgs);

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

        fieldState.validate();
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
          const { wrapper, fieldState } = setup({ props, contextOverrides });

          simulateChange(wrapper, mockChangeValue);
          fieldState.reset();

          assertValue(wrapper, mockDefaultValue);
        });

        it('should call the Field.getDisplayValue function', () => {
          const mockDisplayValue = 'mock-display-value';
          const mockGetDisplayValue = jest.fn().mockReturnValue(mockDisplayValue);

          const { wrapper, fieldState } = setup({
            props: {
              ...props,
              getDisplayValue: mockGetDisplayValue,
            },
            contextOverrides: contextOverrides,
          });

          simulateChange(wrapper, mockChangeValue);
          fieldState.reset();

          assertValue(wrapper, mockDisplayValue);
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
