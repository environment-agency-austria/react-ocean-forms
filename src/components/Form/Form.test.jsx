import React from 'react';
import { shallow } from 'enzyme';

import mockEvent from '../../test-utils/enzymeEventUtils';
import { Form } from './Form';

describe('<Form />', () => {
  const onSubmitHandler = jest.fn();
  const onResetHandler = jest.fn();
  const onValidateHandler = jest.fn().mockReturnValue(null);

  const setup = props => shallow((
    <Form
      onSubmit={onSubmitHandler}
      onReset={onResetHandler}
      onValidate={onValidateHandler}
      {...props}
    >
      <div>unitChild</div>
    </Form>
  ));
  const wrapper = setup();

  const getContext = () => wrapper.first().prop('value');

  it('should render without error', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should create a valid form context', () => {
    const formContext = getContext();
    expect(formContext).toMatchObject({
      fieldPrefix: null,
      registerField: expect.any(Function),
      unregisterField: expect.any(Function),
      notifyFieldEvent: expect.any(Function),
      registerListener: expect.any(Function),
      unregisterListener: expect.any(Function),
      getFieldState: expect.any(Function),
      getValues: expect.any(Function),
      busy: false,
      disabled: false,
      asyncValidateOnChange: false,
      asyncValidationWait: 400,
      defaultValues: {},
      values: undefined,
    });
  });

  describe('configuration', () => {
    const cases = [
      ['disabled', true, 'disabled'],
      ['formatString', jest.fn(), 'stringFormatter'],
      ['asyncValidateOnChange', true, 'asyncValidateOnChange'],
      ['asyncValidationWait', 800, 'asyncValidationWait'],
      ['defaultValues', { foo: 'bar' }, 'defaultValues'],
      ['values', { foo: 'bar' }, 'values'],
      ['plaintext', true, 'plaintext'],
    ];

    test.each(cases)('case %s', (prop, value, contextProp) => {
      wrapper.setProps({ [prop]: value });
      const formContext = getContext();

      expect(formContext).toMatchObject({ [contextProp]: value });
      wrapper.setProps({ [prop]: undefined });
    });
  });

  describe('invalid field registration', () => {
    const mf = () => {};
    const cases = [
      ['no parameters', undefined, undefined],
      ['invalid field name', '', undefined],
      ['no state', 'foo', undefined],
      ['empty state', 'foo', {}],
      ['1 of 5 props', 'foo', { label: 'hey' }],
      ['2 of 5 props', 'foo', { label: 'hey', validate: mf }],
      ['3 of 5 props', 'foo', { label: 'hey', validate: mf, updateValidation: mf }],
      ['4 of 5 props', 'foo', {
        label: 'hey',
        validate: mf,
        updateValidation: mf,
        reset: mf,
      }],
    ];

    const formContext = getContext();
    test.each(cases)('case %s', (testName, fieldName, fieldState) => {
      expect(() => formContext.registerField(fieldName, fieldState)).toThrowErrorMatchingSnapshot();
    });
  });

  const createMockField = label => ({
    label,
    validate: jest.fn().mockResolvedValue({
      isValidating: false,
      valid: true,
      error: null,
    }),
    updateValidation: jest.fn(),
    reset: jest.fn(),
    getValue: jest.fn().mockReturnValue(label),
  });

  const unitFieldName = 'unitField';
  const unitFieldState = createMockField('Unit field');

  const unitGroupName = 'unitGroup';
  const unitGroupState = createMockField('Unit group');
  unitGroupState.isGroup = true;

  const subFieldName = `${unitGroupName}.subField`;
  const subFieldState = createMockField('Sub field');

  const mockFields = [unitFieldState, unitGroupState, subFieldState];

  const subFieldLocalName = subFieldName.substring(unitGroupName.length + 1);
  const expectedFormValues = {
    [unitFieldName]: unitFieldState.label,
    [unitGroupName]: {
      [subFieldLocalName]: subFieldState.label,
    },
  };

  describe('field states and values', () => {
    let formContext = null;
    const refreshContext = () => { formContext = getContext(); };
    beforeEach(refreshContext);

    it('should register a new field without crashing', () => {
      expect(() => formContext.registerField(unitFieldName, unitFieldState)).not.toThrowError();
    });

    it('should register a new group without crashing', () => {
      expect(() => formContext.registerField(unitGroupName, unitGroupState)).not.toThrowError();
    });

    it('should register a new sub field without crashing', () => {
      expect(() => formContext.registerField(subFieldName, subFieldState)).not.toThrowError();
    });

    it('should return the correct field states', () => {
      expect(formContext.getFieldState(unitFieldName)).toBe(unitFieldState);
      expect(formContext.getFieldState(unitGroupName)).toBe(unitGroupState);
      expect(formContext.getFieldState(subFieldName)).toBe(subFieldState);
    });

    it('should correctly build the form values', () => {
      const formValues = formContext.getValues();

      expect(unitFieldState.getValue).toHaveBeenCalled();
      expect(subFieldState.getValue).toHaveBeenCalled();

      // The value of fieldGroups is computed by its children
      expect(unitGroupState.getValue).not.toHaveBeenCalled();

      expect(formValues).toMatchObject(expectedFormValues);
    });
  });

  const createMockListener = () => jest.fn();

  const mockListeners = [
    { id: 'listener1', state: createMockListener() },
    { id: 'listener2', state: createMockListener() },
    { id: 'listener3', state: createMockListener() },
  ];

  describe('listener / notify system', () => {
    let formContext = null;
    const refreshContext = () => { formContext = getContext(); };

    beforeEach(refreshContext);
    afterEach(() => {
      mockListeners.forEach(({ state }) => {
        state.mockClear();
      });
    });

    it('should register new listeners without crashing', () => {
      mockListeners.forEach((item) => {
        expect(() => formContext.registerListener(item.id, item.state)).not.toThrowError();
      });
    });

    it('should pass the validation notification to all listeners', () => {
      const eventName = 'validation';
      const eventArgs = { foo: 'bar' };

      formContext.notifyFieldEvent(unitFieldName, eventName, eventArgs);
      mockListeners.forEach(item => expect(item.state).toHaveBeenLastCalledWith(
        unitFieldName,
        eventName,
        {
          label: unitFieldState.label,
          ...eventArgs,
        },
      ));
    });

    it('should call the listeners', () => {
      const eventName = 'change';
      const eventArgs = 'myNewValue';

      formContext.notifyFieldEvent(unitFieldName, eventName, eventArgs);
      mockListeners.forEach(item => expect(item.state).toHaveBeenLastCalledWith(
        unitFieldName,
        eventName,
        eventArgs,
      ));
    });
  });

  describe('onSubmit handling', () => {
    afterAll(() => {
      wrapper.setProps({
        onValidate: onValidateHandler,
        onSubmit: onSubmitHandler,
      });
    });

    describe('all valid', () => {
      it('should not throw an error', () => {
        const formElement = wrapper.find('form');
        expect(() => formElement.simulate('submit', mockEvent())).not.toThrowError();
      });

      it('should call all the validation functions', () => {
        mockFields.forEach(item => expect(item.validate).toHaveBeenLastCalledWith({
          checkAsync: true,
          immediateAsync: true,
        }));
      });

      it('should call the onValidate prop', () => {
        expect(onValidateHandler).toHaveBeenCalledWith(expectedFormValues);
        onValidateHandler.mockClear();
      });

      it('should call the onSubmit prop', () => {
        expect(onSubmitHandler).toHaveBeenCalledWith(expectedFormValues, undefined);
        onSubmitHandler.mockClear();
      });

      it('should work without optional props', () => {
        wrapper.setProps({
          onValidate: undefined,
          onSubmit: undefined,
        });

        const formElement = wrapper.find('form');
        expect(() => formElement.simulate('submit', mockEvent())).not.toThrowError();
      });
    });

    describe('invalid through form validator', () => {
      const invalidValidator = jest.fn().mockReturnValue({
        [unitFieldName]: 'error',
      });

      beforeAll(() => wrapper.setProps({ onValidate: invalidValidator }));
      afterAll(() => wrapper.setProps({ onValidate: onValidateHandler }));

      it('should not throw an error', () => {
        const formElement = wrapper.find('form');
        expect(() => formElement.simulate('submit', mockEvent())).not.toThrowError();
      });

      it('should update the validation state of the field', () => {
        expect(unitFieldState.updateValidation).toHaveBeenCalledWith({
          valid: false,
          error: {
            message_id: 'error',
            params: { },
          },
        });
      });

      it('should trigger a submit-invalid event', () => {
        mockListeners.forEach(item => expect(item.state).toHaveBeenLastCalledWith(
          '_form',
          'submit-invalid',
          undefined,
        ));

        mockListeners.forEach(({ state }) => {
          state.mockClear();
        });
      });

      it('should not call the onSubmit prop', () => {
        expect(onSubmitHandler).not.toHaveBeenCalled();
        onSubmitHandler.mockClear();
      });
    });

    describe('invalid through field validators', () => {
      let originalValidate;
      beforeAll(() => {
        originalValidate = unitFieldState.validate;
        unitFieldState.validate = jest.fn().mockResolvedValue({
          isValidating: false,
          valid: false,
          error: 'foobar',
        });
      });

      afterAll(() => {
        unitFieldState.validate = originalValidate;
      });

      it('should not throw an error', () => {
        const formElement = wrapper.find('form');
        expect(() => formElement.simulate('submit', mockEvent())).not.toThrowError();
      });

      it('should trigger a submit-invalid event', () => {
        mockListeners.forEach(item => expect(item.state).toHaveBeenLastCalledWith(
          '_form',
          'submit-invalid',
          undefined,
        ));

        mockListeners.forEach(({ state }) => {
          state.mockClear();
        });
      });

      it('should not call the onSubmit prop', () => {
        expect(onSubmitHandler).not.toHaveBeenCalled();
        onSubmitHandler.mockClear();
      });

      it('should not crash if there are no listeners', () => {
        const formContext = getContext();

        mockListeners.forEach((item) => {
          expect(() => formContext.unregisterListener(item.id)).not.toThrowError();
        });

        const formElement = wrapper.find('form');
        expect(() => formElement.simulate('submit', mockEvent())).not.toThrowError();
      });
    });

    describe('context busy state', () => {
      const testBusyState = (expected, done) => {
        const formElement = wrapper.find('form');
        formElement.simulate('submit', mockEvent());

        process.nextTick(() => {
          wrapper.update();
          expect(getContext().busy).toBe(expected);
          done();
        });
      };

      it('should not be busy if the onSubmit callback returns immediately', (done) => {
        testBusyState(false, done);
      });

      it('should not be busy if there is no onSubmit callback', (done) => {
        wrapper.setProps({ onSubmit: undefined });
        testBusyState(false, done);
      });

      describe('async onSubmit callback', () => {
        /** Mock onSubmit that simulates a slow submit handler */
        const slowOnSubmit = () => new Promise(
          resolve => setTimeout(() => {
            resolve();
          }, 1000),
        );

        beforeAll(() => {
          jest.useFakeTimers();
          wrapper.setProps({ onSubmit: slowOnSubmit });
        });

        afterAll(() => {
          wrapper.setProps({ onSubmit: onSubmitHandler });
        });

        afterAll(jest.useRealTimers);

        it('should not throw an error onSubmit', () => {
          const formElement = wrapper.find('form');
          expect(() => formElement.simulate('submit', mockEvent())).not.toThrowError();
        });

        it('should be busy after invoking onSubmit', (done) => {
          process.nextTick(() => {
            expect(getContext().busy).toBe(true);
            done();
          });
        });

        it('should not be busy after onSubmit finished', (done) => {
          jest.runAllTimers();

          process.nextTick(() => {
            wrapper.update();
            expect(getContext().busy).toBe(false);
            done();
          });
        });
      });
    });
  });

  describe('onReset handling', () => {
    it('should not throw an error', () => {
      const formElement = wrapper.find('form');
      expect(() => formElement.simulate('reset', mockEvent())).not.toThrowError();
    });

    it('should reset all fields', () => {
      mockFields.forEach(item => expect(item.reset).toHaveBeenCalled());
    });

    it('should call the onReset prop', () => {
      expect(onResetHandler).toHaveBeenCalled();
      onResetHandler.mockClear();
    });

    it('should work without the onReset prop', () => {
      wrapper.setProps({ onReset: undefined });
      const formElement = wrapper.find('form');
      expect(() => formElement.simulate('reset', mockEvent())).not.toThrowError();
    });
  });

  describe('cleanup handling', () => {
    const formContext = getContext();

    it('should unregister all fields without throwing an error', () => {
      expect(() => formContext.unregisterField(unitFieldName)).not.toThrowError();
      expect(() => formContext.unregisterField(subFieldName)).not.toThrowError();
      expect(() => formContext.unregisterField(unitGroupName)).not.toThrowError();
    });
  });
});
