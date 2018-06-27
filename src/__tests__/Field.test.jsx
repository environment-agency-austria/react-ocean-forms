import React from 'react';
import { shallow } from 'enzyme';

import { createMockFormContext, createMockValidation } from '../test-utils/enzymeFormContext';
import { BaseField } from '../Field';

describe('<Field />', () => {
  const TestComponent = () => (<div id="test-component" />);

  let fieldState = null;
  const registerCallback = (name, state) => { fieldState = state; };

  const fieldName = 'unitField';
  const fullName = fieldName;
  const fieldLabel = 'Unit field';
  const formContext = createMockFormContext(registerCallback);
  const validation = createMockValidation();

  const onChangeHandler = jest.fn();
  const onBlurHandler = jest.fn();

  const getDisplayValue = jest.fn().mockImplementation(value => value);
  const getSubmitValue = jest.fn().mockImplementation(value => value);

  const setup = props => shallow((
    <BaseField
      name={fieldName}
      fullName={fullName}
      label={fieldLabel}
      component={TestComponent}
      context={formContext}
      validation={validation}
      onChange={onChangeHandler}
      onBlur={onBlurHandler}
      getDisplayValue={getDisplayValue}
      getSubmitValue={getSubmitValue}
      {...props}
    />
  ));
  const wrapper = setup();

  it('should render without error', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should call the getDisplayValue function', () => {
    expect(getDisplayValue).toHaveBeenLastCalledWith(
      '',
      { disabled: false, plaintext: false },
    );
  });

  it('should register itself in the form context', () => {
    expect(formContext.registerField).toHaveBeenCalledWith(
      fieldName,
      {
        label: fieldLabel,
        validate: expect.any(Function),
        reset: expect.any(Function),
        getValue: expect.any(Function),
        updateValidation: validation.update,
      },
    );
  });

  const changeValue = 'blubb';

  describe('onChange event handling', () => {
    const triggerChange = () => {
      const inputElement = wrapper.find('TestComponent');
      inputElement.prop('field').onChange({
        target: {
          name: fieldName,
          value: changeValue,
        },
      });
      wrapper.update();
    };

    it('should remember the changed value', () => {
      triggerChange();
      expect(wrapper.find('TestComponent').prop('field').value).toBe(changeValue);
    });

    it('should call the getSubmitValue function', () => {
      expect(getSubmitValue).toHaveBeenLastCalledWith(
        changeValue,
        { disabled: false, plaintext: false },
      );
    });

    it('should call the validate function', () => {
      expect(validation.validate).toHaveBeenLastCalledWith(
        changeValue,
        { checkAsync: false },
      );
    });

    it('should respect the Form.asyncValidateOnChange configuration', () => {
      formContext.asyncValidateOnChange = true;
      wrapper.setProps({ context: formContext });

      triggerChange();
      expect(validation.validate).toHaveBeenLastCalledWith(
        changeValue,
        { checkAsync: true },
      );
    });

    it('should respect the Field.asyncValidateOnChange configuration', () => {
      formContext.asyncValidateOnChange = false;
      wrapper.setProps({ context: formContext, asyncValidateOnChange: true });

      triggerChange();
      expect(validation.validate).toHaveBeenLastCalledWith(
        changeValue,
        { checkAsync: true },
      );

      wrapper.setProps({ asyncValidateOnChange: false });
    });

    it('should notify the form context', () => {
      expect(formContext.notifyFieldEvent).toHaveBeenLastCalledWith(
        fieldName,
        'change',
        changeValue,
      );
    });

    it('should call the onChange handler', () => {
      expect(onChangeHandler).toHaveBeenLastCalledWith(changeValue);
    });

    it('should not crash without an onChange handler', () => {
      wrapper.setProps({ onChange: undefined });
      expect(() => triggerChange()).not.toThrowError();

      wrapper.setProps({ onChange: onChangeHandler });
      onChangeHandler.mockReset();
    });
  });

  describe('onBlur event handling', () => {
    const triggerBlur = () => {
      const inputElement = wrapper.find('TestComponent');
      inputElement.prop('field').onBlur();
      wrapper.update();
    };

    const resetMocks = () => {
      validation.validate.mockReset();
      formContext.notifyFieldEvent.mockReset();
    };

    beforeAll(() => {
      resetMocks();
      triggerBlur();
    });

    afterAll(() => {
      resetMocks();
    });

    it('should call the getSubmitValue function', () => {
      expect(getSubmitValue).toHaveBeenLastCalledWith(
        changeValue,
        { disabled: false, plaintext: false },
      );
    });

    it('should call the validate function', () => {
      expect(validation.validate).toHaveBeenLastCalledWith(changeValue);
    });

    it('should notify the form context', () => {
      expect(formContext.notifyFieldEvent).toHaveBeenLastCalledWith(
        fieldName,
        'blur',
      );
    });

    it('should call the onBlur handler', () => {
      expect(onBlurHandler).toHaveBeenCalled();
    });

    it('should not crash without an onBlur handler', () => {
      wrapper.setProps({ onBlur: undefined });
      expect(() => triggerBlur()).not.toThrowError();

      wrapper.setProps({ onBlur: onBlurHandler });
      onBlurHandler.mockReset();
    });

    it('should not validate if the state is not dirty', () => {
      resetMocks();
      wrapper.setState({ dirty: false });
      wrapper.update();
      triggerBlur();

      expect(validation.validate).not.toHaveBeenCalled();
    });
  });

  describe('form context callbacks', () => {
    it('should return the correct value', () => {
      expect(fieldState.getValue()).toBe(changeValue);
    });

    it('should correctly pass the validate method', () => {
      const validateArgs = { foo: 'bar' };

      fieldState.validate(validateArgs);
      expect(validation.validate).toHaveBeenLastCalledWith(changeValue, validateArgs);
    });

    describe('reset', () => {
      it('should correctly reset to its defaultValue', () => {
        fieldState.reset();
        wrapper.update();

        const inputElement = wrapper.find('TestComponent');
        expect(inputElement.prop('field').value).toBe('');

        expect(validation.reset).toHaveBeenCalled();
      });

      it('should call the onChange handler', () => {
        expect(onChangeHandler).toHaveBeenLastCalledWith('');
      });
    });
  });

  describe('value callbacks', () => {
    const get42 = jest.fn().mockImplementation(() => 42);
    const get84 = jest.fn().mockImplementation(() => 84);

    beforeAll(() => {
      formContext.defaultValues = { [fieldName]: 33 };
      wrapper.setProps({
        getDisplayValue: get42,
        getSubmitValue: get84,
        context: formContext,
      });
      wrapper.update();
    });

    afterAll(() => {
      wrapper.setProps({ getDisplayValue, getSubmitValue });
    });

    it('should display 42 as value', () => {
      expect(wrapper).toMatchSnapshot();
    });

    it('should return 84 as value', () => {
      const fieldValue = wrapper.instance().getValue();
      expect(get84).toHaveBeenLastCalledWith(42, { disabled: false, plaintext: false });
      expect(fieldValue).toBe(84);
    });
  });

  it('should work without value callbacks', () => {
    wrapper.setProps({
      getDisplayValue: undefined,
      getSubmitValue: undefined,
    });
    wrapper.update();

    expect(() => {
      wrapper.instance().getValue();
    }).not.toThrowError();
    expect(wrapper).toMatchSnapshot();
  });

  it('should set its value to the defaultValue', () => {
    const newDefaultValue = 'foobar';
    formContext.defaultValues = { [fieldName]: newDefaultValue };
    wrapper.setProps({ context: formContext });
    wrapper.update();

    const inputElement = wrapper.find('TestComponent');
    expect(inputElement.prop('field').value).toBe(newDefaultValue);
  });

  it('should use an empty string if there is no defaultValue', () => {
    formContext.defaultValues = { foo: 'bar' };
    wrapper.setProps({ context: formContext });
    wrapper.update();

    const inputElement = wrapper.find('TestComponent');
    expect(inputElement.prop('field').value).toBe('');
  });

  it('should correctly unregister on unmount', () => {
    wrapper.unmount();
    expect(formContext.unregisterField).toHaveBeenCalledWith(fieldName);
  });
});
