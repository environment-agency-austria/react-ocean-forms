import React from 'react';
import { shallow } from 'enzyme';

import { createMockFormContext, createMockValidation } from '../../test-utils/enzymeFormContext';
import { BaseField } from './Field';

describe('<Field />', () => {
  const MOCK_NAME = 'unitField';
  const MOCK_LABEL = 'Unit field';

  const setup = ({
    props = undefined,
    contextOverrides = undefined,
  } = {}) => {
    let fieldState = null;
    const registerCallback = (name, state) => { fieldState = state; };

    const formContext = {
      ...createMockFormContext(registerCallback),
      ...contextOverrides,
    };
    const validation = createMockValidation();

    const TestComponent = () => (<div id="test-component" />);

    const wrapper = shallow((
      <BaseField
        name={MOCK_NAME}
        fullName={MOCK_NAME}
        label={MOCK_LABEL}
        component={TestComponent}
        context={formContext}
        validation={validation}
        {...props}
      />
    ));

    return {
      formContext,
      fieldState,
      validation,
      wrapper,
    };
  };

  const getTestComponent = wrapper => wrapper.find('TestComponent');
  const getValue = wrapper => getTestComponent(wrapper).prop('field').value;
  const assertValue = (wrapper, value) => expect(getValue(wrapper)).toBe(value);
  const simulateChange = (wrapper, value) => getTestComponent(wrapper).prop('field').onChange({
    target: {
      name: MOCK_NAME,
      value,
    },
  });
  const simulateBlur = wrapper => getTestComponent(wrapper).prop('field').onBlur();

  describe('Render', () => {
    it('should render without crashing', () => {
      const { wrapper } = setup();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('Form registration', () => {
    let formContext;
    let validation;
    let wrapper;

    beforeAll(() => {
      ({ formContext, validation, wrapper } = setup());
    });

    it('should register itself in the form context', () => {
      expect(formContext.registerField).toHaveBeenCalledWith(
        MOCK_NAME,
        {
          label: MOCK_LABEL,
          validate: expect.any(Function),
          reset: expect.any(Function),
          getValue: expect.any(Function),
          updateValidation: validation.update,
        },
      );
    });

    it('should unregister itself on unmount', () => {
      wrapper.unmount();
      expect(formContext.unregisterField).toHaveBeenCalledWith(MOCK_NAME);
    });
  });

  describe('Invalid form context', () => {
    const MOCK_ERROR_STRING = `Could not find a form context for field "${MOCK_NAME}". `
                            + 'Fields can only be used inside a Form tag.';

    it('should throw an error if there is no form context', () => {
      expect(() => setup({ props: { context: undefined } })).toThrowError(MOCK_ERROR_STRING);
    });

    it('should throw an error if the form context is invalid', () => {
      expect(() => setup({ props: { context: { foo: 'bar' } } })).toThrowError(MOCK_ERROR_STRING);
    });
  });

  describe('Default value handling', () => {
    let wrapper;

    afterEach(() => wrapper.unmount());

    it('should have an empty string as the default value', () => {
      ({ wrapper } = setup());
      assertValue(wrapper, '');
    });

    it('should use the default value from Form.defaultValues if existing', () => {
      const MOCK_DEFAULTVALUE = 'mock-default-value';

      ({ wrapper } = setup({
        contextOverrides: {
          defaultValues: { [MOCK_NAME]: MOCK_DEFAULTVALUE },
        },
      }));

      assertValue(wrapper, MOCK_DEFAULTVALUE);
    });

    it('should use the Field.defaultValue if existing', () => {
      const MOCK_DEFAULTVALUE = 'mock-field-value';

      ({ wrapper } = setup({
        props: {
          defaultValue: MOCK_DEFAULTVALUE,
        },
      }));

      assertValue(wrapper, MOCK_DEFAULTVALUE);
    });

    it('should prefer the Field.defaultValue over the Form.defaultValues', () => {
      const MOCK_DEFAULTVALUE_FIELD = 'mock-field-value';
      const MOCK_DEFAULTVALUE_FORM = 'mock-form-value';

      ({ wrapper } = setup({
        props: {
          defaultValue: MOCK_DEFAULTVALUE_FIELD,
        },
        contextOverrides: {
          defaultValues: { [MOCK_NAME]: MOCK_DEFAULTVALUE_FORM },
        },
      }));

      assertValue(wrapper, MOCK_DEFAULTVALUE_FIELD);
    });

    it('should not use the defaultValue if the Field is touched', () => {
      let formContext;

      const MOCK_DEFAULT_VALUE = 'mock-field-value';
      const MOCK_CHANGE_VALUE = 'mock-change-value';

      ({ wrapper, formContext } = setup()); // eslint-disable-line

      // Recreate a field value change
      simulateChange(wrapper, MOCK_CHANGE_VALUE);

      // Set new defaultProps through Form.defaultValues
      formContext.defaultValues = { [MOCK_NAME]: MOCK_DEFAULT_VALUE };
      wrapper.setProps({ context: formContext });
      assertValue(wrapper, MOCK_CHANGE_VALUE);

      // Set new defaultProps through Field.defaultValue
      wrapper.setProps({ defaultValue: MOCK_DEFAULT_VALUE });
      assertValue(wrapper, MOCK_CHANGE_VALUE);
    });
  });

  describe('Prop value handling', () => {
    let wrapper;

    afterEach(() => wrapper.unmount());

    it('should use the value from Form.values if existing', () => {
      const MOCK_VALUE = 'mock-value';

      ({ wrapper } = setup({
        contextOverrides: {
          values: { [MOCK_NAME]: MOCK_VALUE },
        },
      }));

      assertValue(wrapper, MOCK_VALUE);
    });

    it('should use the Field.value if existing', () => {
      const MOCK_VALUE = 'mock-field-value';

      ({ wrapper } = setup({
        props: {
          value: MOCK_VALUE,
        },
      }));

      assertValue(wrapper, MOCK_VALUE);
    });

    it('should prefer the Field.value over the Form.values', () => {
      const MOCK_VALUE_FIELD = 'mock-field-value';
      const MOCK_VALUE_FORM = 'mock-form-value';

      ({ wrapper } = setup({
        props: {
          value: MOCK_VALUE_FIELD,
        },
        contextOverrides: {
          values: { [MOCK_NAME]: MOCK_VALUE_FORM },
        },
      }));

      assertValue(wrapper, MOCK_VALUE_FIELD);
    });

    it('Field.value should override the default values', () => {
      const MOCK_VALUE = 'mock-field-value';
      const MOCK_DEFAULT_VALUE = 'mock-default-value';

      ({ wrapper } = setup({
        props: {
          value: MOCK_VALUE,
          defaultValue: MOCK_DEFAULT_VALUE,
        },
        contextOverrides: {
          defaultValues: { [MOCK_NAME]: MOCK_DEFAULT_VALUE },
        },
      }));

      assertValue(wrapper, MOCK_VALUE);
    });

    it('Form.values should override the default values', () => {
      const MOCK_VALUE = 'mock-field-value';
      const MOCK_DEFAULT_VALUE = 'mock-default-value';

      ({ wrapper } = setup({
        props: {
          defaultValue: MOCK_DEFAULT_VALUE,
        },
        contextOverrides: {
          values: { [MOCK_NAME]: MOCK_VALUE },
          defaultValues: { [MOCK_NAME]: MOCK_DEFAULT_VALUE },
        },
      }));

      assertValue(wrapper, MOCK_VALUE);
    });

    it('should use the changed value even if the Field is touched', () => {
      let formContext;

      let MOCK_VALUE = 'mock-field-value';
      const MOCK_CHANGE_VALUE = 'mock-change-value';

      const updateValue = () => {
        // Recreate a field value change
        simulateChange(wrapper, MOCK_CHANGE_VALUE);
        assertValue(wrapper, MOCK_CHANGE_VALUE);
      };

      ({ wrapper, formContext } = setup()); // eslint-disable-line

      // Mock user input
      updateValue();

      // Set new value through Form.values
      formContext.values = { [MOCK_NAME]: MOCK_VALUE };
      wrapper.setProps({ context: formContext });
      assertValue(wrapper, MOCK_VALUE);

      // Mock user input
      updateValue();

      // Set new props through Field.value
      MOCK_VALUE = 'mock-new-field-value';
      wrapper.setProps({ value: MOCK_VALUE });
      assertValue(wrapper, MOCK_VALUE);
    });
  });

  describe('onChange handling', () => {
    const MOCK_VALUE = 'mock-change-value';

    let wrapper;
    let validation;
    let formContext;

    const setupOnChange = (props, contextOverrides) => {
      ({ wrapper, validation, formContext } = setup({
        props,
        contextOverrides,
      }));
      simulateChange(wrapper, MOCK_VALUE);
    };

    afterEach(() => {
      wrapper.unmount();
      validation = undefined;
      formContext = undefined;
    });

    it('should remember the changed value', () => {
      setupOnChange();
      assertValue(wrapper, MOCK_VALUE);
    });

    it('should call the Field.getSubmitValue callback', () => {
      const MOCK_GET_SUBMIT_VALUE = jest.fn().mockImplementation(value => value);
      setupOnChange({ getSubmitValue: MOCK_GET_SUBMIT_VALUE });

      expect(MOCK_GET_SUBMIT_VALUE).toHaveBeenCalledWith(
        MOCK_VALUE,
        { disabled: false, plaintext: false },
      );
    });

    it('should call the validate function', () => {
      setupOnChange();
      expect(validation.validate).toHaveBeenCalledWith(
        MOCK_VALUE,
        { checkAsync: false },
      );
    });

    it('should notify the form context', () => {
      setupOnChange();
      expect(formContext.notifyFieldEvent).toHaveBeenCalledWith(
        MOCK_NAME,
        'change',
        MOCK_VALUE,
      );
    });

    it('should call the Field.onChange handler', () => {
      const MOCK_ON_CHANGE = jest.fn();
      setupOnChange({ onChange: MOCK_ON_CHANGE });
      expect(MOCK_ON_CHANGE).toHaveBeenCalledWith(MOCK_VALUE);
    });

    it('should respect the Form.asyncValidateOnChange configuration', () => {
      const MOCK_CHECK_ASYNC = true;
      setupOnChange(null, { asyncValidateOnChange: MOCK_CHECK_ASYNC });
      expect(validation.validate).toHaveBeenCalledWith(
        MOCK_VALUE,
        { checkAsync: MOCK_CHECK_ASYNC },
      );
    });

    it('should respect the Field.asyncValidateOnChange configuration', () => {
      const MOCK_CHECK_ASYNC = true;
      setupOnChange({ asyncValidateOnChange: MOCK_CHECK_ASYNC });

      expect(validation.validate).toHaveBeenCalledWith(
        MOCK_VALUE,
        { checkAsync: MOCK_CHECK_ASYNC },
      );
    });
  });

  describe('onBlur handling', () => {
    const MOCK_VALUE = 'mock-value';

    let wrapper;
    let validation;
    let formContext;

    const setupLocal = (props, contextOverrides) => {
      ({ wrapper, validation, formContext } = setup({
        props: { ...props, value: MOCK_VALUE },
        contextOverrides,
      }));
    };

    const setupOnBlur = (props, contextOverrides) => {
      setupLocal(props, contextOverrides);
      simulateBlur(wrapper);
    };

    afterEach(() => {
      wrapper.unmount();
      validation = undefined;
      formContext = undefined;
    });

    it('should call the Field.getSubmitValue function', () => {
      const MOCK_GET_SUBMIT_VALUE = jest.fn().mockImplementation(value => value);
      setupOnBlur({ getSubmitValue: MOCK_GET_SUBMIT_VALUE });

      expect(MOCK_GET_SUBMIT_VALUE).toHaveBeenCalledWith(
        MOCK_VALUE,
        { disabled: false, plaintext: false },
      );
    });

    it('should call the validate function', () => {
      const MOCK_CHANGE_VALUE = 'foo';
      setupLocal();

      simulateChange(wrapper, MOCK_CHANGE_VALUE);
      validation.validate.mockClear();

      simulateBlur(wrapper);
      expect(validation.validate).toHaveBeenCalledWith(MOCK_CHANGE_VALUE);
    });

    it('should not call the validate function if the field is not dirty', () => {
      setupOnBlur();
      expect(validation.validate).not.toHaveBeenCalledWith(MOCK_VALUE);
    });

    it('should notify the form context', () => {
      setupOnBlur();
      expect(formContext.notifyFieldEvent).toHaveBeenCalledWith(
        MOCK_NAME,
        'blur',
      );
    });

    it('should call the Field.onBlur handler', () => {
      const MOCK_ON_BLUR = jest.fn();
      setupOnBlur({ onBlur: MOCK_ON_BLUR });
      expect(MOCK_ON_BLUR).toHaveBeenCalled();
    });
  });

  describe('getDisplayValue handling', () => {
    const MOCK_DISPLAY_VALUE = 'mock-display-value';
    const MOCK_VALUE = 'mock-value';

    const setupWithDisplayName = () => {
      const MOCK_GET_DISPLAY_VALUE = jest.fn().mockReturnValue(MOCK_DISPLAY_VALUE);
      return {
        ...setup({ props: { getDisplayValue: MOCK_GET_DISPLAY_VALUE, value: MOCK_VALUE } }),
        getDisplayValue: MOCK_GET_DISPLAY_VALUE,
      };
    };

    it('should call Field.getDisplayValue on first render', () => {
      const { wrapper, getDisplayValue } = setupWithDisplayName();
      assertValue(wrapper, MOCK_DISPLAY_VALUE);
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
        MOCK_VALUE,
        { disabled: true, plaintext: false },
      );
    });

    it('should call getDisplayValue whenever the Context.plaintext state changes', () => {
      const { wrapper, formContext, getDisplayValue } = setupWithDisplayName();
      getDisplayValue.mockClear();

      formContext.plaintext = true;
      wrapper.setProps({ context: formContext });

      expect(getDisplayValue).toHaveBeenCalledWith(
        MOCK_VALUE,
        { disabled: false, plaintext: true },
      );
    });
  });

  describe('Form context callbacks', () => {
    describe('Context.getValue', () => {
      it('should return the correct value', () => {
        const MOCK_VALUE = 'field-value';
        const { fieldState } = setup({ props: { value: MOCK_VALUE } });
        expect(fieldState.getValue()).toBe(MOCK_VALUE);
      });

      it('should pass the return value through getSubmitValue', () => {
        const MOCK_VALUE = 'field-value';
        const MOCK_SUBMIT_VALUE = 'field-submit-value';
        const MOCK_GET_SUBMIT_VALUE = jest.fn().mockReturnValue(MOCK_SUBMIT_VALUE);

        const { fieldState } = setup({
          props: {
            value: MOCK_VALUE,
            getSubmitValue: MOCK_GET_SUBMIT_VALUE,
          },
        });

        expect(fieldState.getValue()).toBe(MOCK_SUBMIT_VALUE);
        expect(MOCK_GET_SUBMIT_VALUE).toHaveBeenCalledWith(
          MOCK_VALUE,
          { disabled: false, plaintext: false },
        );
      });
    });

    describe('Context.validate', () => {
      it('should correctly pass the validate method', () => {
        const MOCK_VALIDATE_ARGS = { foo: 'bar' };
        const MOCK_VALUE = 'field-value';

        const { fieldState, validation } = setup({ props: { value: MOCK_VALUE } });
        fieldState.validate(MOCK_VALIDATE_ARGS);

        expect(validation.validate).toHaveBeenLastCalledWith(
          MOCK_VALUE,
          MOCK_VALIDATE_ARGS,
        );
      });

      it('should pass the validated value through getSubmitValue', () => {
        const MOCK_VALUE = 'field-value';
        const MOCK_SUBMIT_VALUE = 'field-submit-value';
        const MOCK_GET_SUBMIT_VALUE = jest.fn().mockReturnValue(MOCK_SUBMIT_VALUE);

        const { fieldState } = setup({
          props: {
            value: MOCK_VALUE,
            getSubmitValue: MOCK_GET_SUBMIT_VALUE,
          },
        });

        fieldState.validate();
        expect(MOCK_GET_SUBMIT_VALUE).toHaveBeenCalledWith(
          MOCK_VALUE,
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
        const MOCK_DEFAULT_VALUE = 'field-default-value';
        const MOCK_CHANGE_VALUE = 'field-change-value';

        const props = prop ? { [prop]: MOCK_DEFAULT_VALUE } : undefined;
        const contextOverrides = context
          ? { [context]: { [MOCK_NAME]: MOCK_DEFAULT_VALUE } }
          : undefined;

        it('should correctly reset to its defaultValue', () => {
          const { wrapper, fieldState } = setup({ props, contextOverrides });

          simulateChange(wrapper, MOCK_CHANGE_VALUE);
          fieldState.reset();

          assertValue(wrapper, MOCK_DEFAULT_VALUE);
        });

        it('should call the Field.getDisplayValue function', () => {
          const MOCK_DISPLAY_VALUE = 'mock-display-value';
          const MOCK_GET_DISPLAY_VALUE = jest.fn().mockReturnValue(MOCK_DISPLAY_VALUE);

          const { wrapper, fieldState } = setup({
            props: {
              ...props,
              getDisplayValue: MOCK_GET_DISPLAY_VALUE,
            },
            contextOverrides,
          });

          simulateChange(wrapper, MOCK_CHANGE_VALUE);
          fieldState.reset();

          assertValue(wrapper, MOCK_DISPLAY_VALUE);
          expect(MOCK_GET_DISPLAY_VALUE).toHaveBeenCalledWith(
            MOCK_DEFAULT_VALUE,
            { disabled: false, plaintext: false },
          );
        });

        it('should call the onChange handler', () => {
          const MOCK_ON_CHANGE = jest.fn();
          const { fieldState } = setup({
            props: {
              onChange: MOCK_ON_CHANGE,
              ...props,
            },
            contextOverrides,
          });

          fieldState.reset();
          expect(MOCK_ON_CHANGE).toHaveBeenCalledWith(MOCK_DEFAULT_VALUE);
        });
      });
    });
  });
});
