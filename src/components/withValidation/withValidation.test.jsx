import React from 'react';
import { shallow } from 'enzyme';

import { createMockFormContext } from '../../test-utils/enzymeFormContext';
import { baseWithValidation } from './withValidation';

describe('withValidation', () => {
  const formContext = createMockFormContext();
  const TestComponent = () => (<div id="test-component" />);
  const WrappedComponent = baseWithValidation(TestComponent);

  const fieldName = 'unitField';

  const setup = props => shallow((
    <WrappedComponent
      name={fieldName}
      context={formContext}
      {...props}
    />
  ));
  let root = setup();

  let wrapper = null;
  let validationRef = null;

  const updateWrapper = () => root.find('TestComponent');

  beforeEach(() => {
    wrapper = updateWrapper();
    validationRef = root.prop('validation');
  });

  it('should render without error', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should return a valid state without validators', async () => {
    await expect(validationRef.validate()).resolves.toMatchObject({
      error: null,
      isValidating: false,
      valid: true,
    });
  });

  const mockValue = 'foobar';
  const checkNotifyCalled = (state) => {
    expect(formContext.notifyFieldEvent).toHaveBeenLastCalledWith(
      fieldName,
      'validation',
      state,
    );
    formContext.notifyFieldEvent.mockReset();
  };

  describe('sync validation', () => {
    const errorId = 'foo';
    const validators = [
      jest.fn().mockReturnValue(undefined),
      jest.fn().mockReturnValue(undefined).mockReturnValueOnce(errorId),
      jest.fn().mockReturnValue(undefined),
    ];

    const asyncValidator = jest.fn().mockResolvedValue(undefined);

    beforeAll(() => {
      root.setProps({ validators, asyncValidators: [asyncValidator] });
    });

    afterAll(() => {
      root.setProps({ validators: undefined });
    });

    it('should call the sync validators and return a validation state', async () => {
      const state = await validationRef.validate(mockValue);
      expect(state).toMatchObject({
        isValidating: false,
        valid: false,
        error: {
          message_id: errorId,
          params: {},
        },
      });

      checkNotifyCalled(state);
    });

    it('should stop at the first invalid validator', () => {
      expect(validators[0]).toHaveBeenCalledTimes(1);
      expect(validators[1]).toHaveBeenCalledTimes(1);
      expect(validators[2]).not.toHaveBeenCalled();
    });

    it('should not call the async validator if the sync validators are invalid', () => {
      expect(asyncValidator).not.toHaveBeenCalled();
      root.setProps({ asyncValidators: undefined });
    });

    it('should return a valid state if all sync validators are valid and no async are present', async () => {
      const state = await validationRef.validate(mockValue);
      expect(state).toMatchObject({
        isValidating: false,
        valid: true,
        error: null,
      });

      checkNotifyCalled(state);
    });
  });

  describe('async validation', () => {
    const errorId = 'foo';
    const asyncValidators = [
      jest.fn().mockResolvedValue(undefined),
      jest.fn().mockResolvedValue(undefined).mockResolvedValueOnce(errorId),
      jest.fn().mockResolvedValue(undefined)
        .mockResolvedValueOnce(undefined).mockResolvedValueOnce(errorId),
    ];

    beforeAll(() => {
      root.setProps({ asyncValidators });
    });

    beforeEach(jest.useFakeTimers);
    afterEach(() => {
      // We must clear and reset the fake timers in order
      // to be able to check if setTimeout has been called
      // for every test. Otherwise it keeps this information
      // through multiple tests.
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it('should ignore async validators if checkAsync is false', async () => {
      const state = await validationRef.validate(mockValue, { checkAsync: false });
      expect(state).toMatchObject({
        isValidating: false,
        valid: true,
        error: null,
      });

      checkNotifyCalled(state);
    });

    it('should immediately run the validators if immediateAsync is true', async () => {
      const state = await validationRef.validate(mockValue, { immediateAsync: true });
      expect(state).toMatchObject({
        isValidating: false,
        valid: false,
        error: [{
          message_id: errorId,
          params: {},
        }],
      });

      checkNotifyCalled(state);
    });

    it('should wait for the default amount until triggering the async validators', async (done) => {
      const state = await validationRef.validate(mockValue);

      expect(state).toMatchObject({
        isValidating: true,
        valid: true,
        error: null,
        asyncTimeout: expect.any(Number),
      });
      checkNotifyCalled(state);

      jest.runAllTimers();

      process.nextTick(() => {
        expect(state).toMatchObject({
          isValidating: false,
          valid: false,
          error: [{
            message_id: errorId,
            params: {},
          }],
        });
        checkNotifyCalled(state);
        done();
      });
    });

    it('should clear any existing timeout if validate is called again', async () => {
      // Just to make code coverage happy
      root.setProps({ asyncValidationWait: 200 });

      const state1 = await validationRef.validate(mockValue);
      const state2 = await validationRef.validate(mockValue);

      expect(state1).toMatchObject({
        isValidating: true,
        asyncTimeout: expect.any(Number),
      });
      expect(state2).toMatchObject({
        isValidating: true,
        asyncTimeout: expect.any(Number),
      });

      expect(state1.asyncTimeout).not.toEqual(state2.asyncTimeout);
      jest.runAllTimers();
    });
  });

  describe('form context callbacks', () => {
    it('should update the validation state if called for', () => {
      validationRef.update({
        valid: false,
        error: 'dummy',
      });
      checkNotifyCalled({
        valid: false,
        error: 'dummy',
        asyncTimeout: null,
        fullName: fieldName,
        isValidating: false,
      });
    });

    it('should correctly reset the validation state', () => {
      validationRef.reset();
      checkNotifyCalled({
        valid: true,
        error: null,
        asyncTimeout: null,
        isValidating: false,
      });

      // Edge case where we check if the timeout has
      // been cleared if a validation is in progress
      // when we call reset
      validationRef.validate(mockValue);
      validationRef.reset();
      checkNotifyCalled({
        valid: true,
        error: null,
        asyncTimeout: null,
        isValidating: false,
      });
    });
  });

  it('should clear any timeouts on unmount', () => {
    validationRef.validate(mockValue);
    root.unmount();
    // How to test this?
  });

  it('should adapt the fieldPrefix to the fullName', () => {
    formContext.fieldPrefix = 'unit';

    root = setup();
    wrapper = updateWrapper();

    expect(wrapper.prop('fullName')).toBe(`unit.${fieldName}`);
  });


  it('should not update its state after unmounting', () => {
    formContext.notifyFieldEvent.mockReset();

    const oldInstance = root.instance();
    root.unmount();

    expect(() => oldInstance.updateAndNotify({ foo: 'bar' })).not.toThrowError();
    expect(formContext.notifyFieldEvent).not.toHaveBeenCalled();
  });
});
