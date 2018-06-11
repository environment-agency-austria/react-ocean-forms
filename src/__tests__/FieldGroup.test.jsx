import React from 'react';
import { shallow } from 'enzyme';

import { createMockFormContext, createMockValidation } from '../test-utils/enzymeFormContext';
import { BaseFieldGroup } from '../FieldGroup';

describe('<FieldGroup />', () => {
  let fieldState = null;
  const registerCallback = (name, state) => { fieldState = state; };
  const renderMock = jest.fn().mockReturnValue(null);

  const fieldName = 'unitGroup';
  const fullName = fieldName;
  const fieldLabel = 'Unit group';
  const validation = createMockValidation();
  const formContext = createMockFormContext(registerCallback);

  const mockGroupValue = {
    field1: 'value1',
    field2: 'value2',
  };
  formContext.getValues = jest.fn().mockReturnValue({
    foo: 'bar',
    hue: 'hue',
    [fieldName]: mockGroupValue,
  });

  const setup = props => shallow((
    <BaseFieldGroup
      name={fieldName}
      fullName={fullName}
      label={fieldLabel}
      context={formContext}
      validation={validation}
      render={renderMock}
      {...props}
    />
  ));
  const wrapper = setup();

  it('should render without error', () => {
    expect(wrapper).toMatchSnapshot();
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
        isGroup: true,
      },
    );
  });

  describe('notifyFieldEvent proxy behaviour', () => {
    const eventSender = `${fieldName}.demoName`;
    const changeValue = 'blubb';
    const groupValue = {
      demoName: changeValue,
      ...mockGroupValue,
    };

    const getNotifyCallback = () => wrapper.instance().notifyFieldEvent;
    const triggerNotification = (event) => {
      const notify = getNotifyCallback();
      notify(eventSender, event, changeValue);
    };

    it('should pass any event through to the form context', () => {
      const notify = getNotifyCallback();

      const eventName = 'blubb';
      const eventArgs = { foo: 'bar' };

      notify(eventSender, eventName, eventArgs);
      expect(formContext.notifyFieldEvent).toHaveBeenCalledWith(eventSender, eventName, eventArgs);
    });

    it('should call the validate function onChange', () => {
      triggerNotification('change');

      expect(validation.validate).toHaveBeenLastCalledWith(
        groupValue,
        { checkAsync: false },
      );
    });

    it('should respect the Form.asyncValidateOnChange configuration', () => {
      formContext.asyncValidateOnChange = true;
      wrapper.setProps({ context: formContext });

      triggerNotification('change');
      expect(validation.validate).toHaveBeenLastCalledWith(
        groupValue,
        { checkAsync: true },
      );
    });

    it('should respect the Field.asyncValidateOnChange configuration', () => {
      formContext.asyncValidateOnChange = false;
      wrapper.setProps({ context: formContext, asyncValidateOnChange: true });

      triggerNotification('change');
      expect(validation.validate).toHaveBeenLastCalledWith(
        groupValue,
        { checkAsync: true },
      );

      wrapper.setProps({ asyncValidateOnChange: false });
    });

    it('should validate onBlur', () => {
      triggerNotification('blur');
      expect(validation.validate).toHaveBeenLastCalledWith(groupValue);
    });
  });

  describe('form context callbacks', () => {
    it('should return an empty object as the value', () => {
      expect(fieldState.getValue()).toMatchObject({});
    });

    it('should correctly pass the validate method', () => {
      const validateArgs = { foo: 'bar' };

      fieldState.validate(validateArgs);
      expect(validation.validate).toHaveBeenLastCalledWith(mockGroupValue, validateArgs);
    });

    it('should correctly reset to its defaultValue', () => {
      fieldState.reset();
      wrapper.update();

      expect(validation.reset).toHaveBeenCalled();
    });
  });

  it('should correctly unregister on unmount', () => {
    wrapper.unmount();
    expect(formContext.unregisterField).toHaveBeenCalledWith(fieldName);
  });
});
