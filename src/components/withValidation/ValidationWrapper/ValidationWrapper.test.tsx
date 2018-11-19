import * as React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { createMockFormContext } from '../../../test-utils/enzymeFormContext';
import { validators as defaultValidators } from '../../../validators';
import { IFormContext } from '../../FormContext';
import { IValidationProp, IValidationState, IValidationWrapperProps } from '../withValidation.types';
import { BaseValidationWrapper } from './ValidationWrapper';

describe('withValidation', () => {
  const fieldName = 'unitField';

  interface ISetupArgs {
    props?: Partial<IValidationWrapperProps>;
    contextOverrides?: Partial<IFormContext>;
  }

  interface ISetupResult {
    formContext: IFormContext;
    validation: IValidationProp;
    wrapper: ShallowWrapper;
    fullName: string;
  }

  const setup = ({
    props,
    contextOverrides,
  }: Partial<ISetupArgs> = {}): ISetupResult => {
    const formContext: IFormContext = {
      ...createMockFormContext(),
      ...contextOverrides,
    };

    let fullName: string;
    let validation: IValidationProp;

    const renderCallback = (cFullName: string, cValidation: IValidationProp, cContext: IFormContext): JSX.Element => {
      fullName = cFullName;
      validation = cValidation;

      return (
        <div id="test-component" />
      );
    };

    const wrapper = shallow((
      <BaseValidationWrapper
        name={fieldName}
        context={formContext}
        render={renderCallback}
        {...props}
      />
    ));

    return {
      formContext,
      // @ts-ignore
      validation,
      wrapper,
      // @ts-ignore
      fullName,
    };
  };

  it('should render without error', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });

  it('should return a valid state without validators', async () => {
    const { validation } = setup();
    await expect(validation.validate('foo')).resolves.toMatchObject({
      error: null,
      isValidating: false,
      valid: true,
    });
  });

  const mockValue = 'foobar';
  const checkNotifyCalled = (formContext: IFormContext, state: IValidationState): void => {
    expect(formContext.notifyFieldEvent).toHaveBeenLastCalledWith(
      fieldName,
      'validation',
      state,
    );
  };

  const getAsyncTimeout = (wrapper: ShallowWrapper): number | undefined => (wrapper.instance() as BaseValidationWrapper).getAsyncTimeout();

  describe('sync validation', () => {
    it('should call the sync validators and return a validation state', async () => {
      const validator = jest.fn().mockReturnValue(undefined);

      const { validation, formContext } = setup({ props: {
        validators: [validator],
      }});

      const state = await validation.validate(mockValue);
      expect(state).toMatchObject({
        isValidating: false,
        valid: true,
        error: null,
      });

      checkNotifyCalled(formContext, state);
    });

    it('should stop at the first invalid validator', async () => {
      const errorId = 'mockError';
      const validators = [
        jest.fn().mockReturnValue(undefined),
        jest.fn().mockReturnValue(errorId),
        jest.fn().mockReturnValue(undefined),
      ];

      const { validation } = setup({ props: {
        validators,
      }});

      await validation.validate(mockValue);

      expect(validators[0]).toHaveBeenCalledTimes(1);
      expect(validators[1]).toHaveBeenCalledTimes(1);
      expect(validators[2]).not.toHaveBeenCalled();
    });

    it('should not call the async validator if the sync validators are invalid', async () => {
      const validator = jest.fn().mockReturnValue('error');
      const asyncValidator = jest.fn().mockResolvedValue(undefined);

      const { validation } = setup({ props: {
        validators: [validator],
        asyncValidators: [asyncValidator],
      }});

      await validation.validate(mockValue);

      expect(asyncValidator).not.toHaveBeenCalled();
    });

    describe('required validator', () => {
      const createValidator = (defaultValue: unknown): Function => {
        const customRequiredValidator = (): undefined => undefined;
        customRequiredValidator.isDefaultValidator = defaultValue;

        return customRequiredValidator;
      };

      const cases = [
        [
          'should set validation.isRequired to false if there is no required validator present',
          undefined,
          false,
        ],
        [
          'should set validation.isRequired to true if the default validator is present',
          [ defaultValidators.required ],
          true,
        ],
        [
          'should set validation.isRequired to true if a validator with isDefaultValidator=true is present',
          [ createValidator(true) ],
          true,
        ],
        [
          'should set validation.isRequired to false if a validator with isDefaultValidator=false is present',
          [ createValidator(false) ],
          false,
        ],
        [
          'should set validation.isRequired to false if a validator with isDefaultValidator="foobar" is present',
          [ createValidator('foobar') ],
          false,
        ],
      ];

      it.each(cases)('%s', (name, validators, expectedIsRequiredState) => {
        const { validation } = setup({ props: {
          validators,
        }});

        expect(validation.isRequired).toEqual(expectedIsRequiredState);
      });
    });
  });

  describe('async validation', () => {
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
      const asyncValidator = jest.fn().mockResolvedValue(undefined);

      const { validation, formContext } = setup({ props: {
        asyncValidators: [asyncValidator],
      }});

      const state = await validation.validate(mockValue, { checkAsync: false });
      expect(state).toMatchObject({
        isValidating: false,
        valid: true,
        error: null,
      });
      expect(asyncValidator).not.toHaveBeenCalled();

      checkNotifyCalled(formContext, state);
    });

    it('should immediately run the validators if immediateAsync is true', async () => {
      const errorId = 'mockError';
      const asyncValidator = jest.fn().mockResolvedValue(errorId);

      const { validation, formContext } = setup({ props: {
        asyncValidators: [asyncValidator],
      }});

      const state = await validation.validate(mockValue, { immediateAsync: true });
      expect(state).toMatchObject({
        isValidating: false,
        valid: false,
        error: [{
          message_id: errorId,
          params: {},
        }],
      });
      expect(asyncValidator).toHaveBeenCalledTimes(1);

      checkNotifyCalled(formContext, state);
    });

    it('should wait for the default amount until triggering the async validators', async (done) => {
      const errorId = 'mockError';
      const asyncValidator = jest.fn().mockResolvedValue(errorId);

      const { wrapper, validation, formContext } = setup({ props: {
        asyncValidators: [asyncValidator],
      }});

      const state = await validation.validate(mockValue);

      expect(state).toMatchObject({
        isValidating: true,
        valid: true,
        error: null,
      });
      expect(asyncValidator).not.toHaveBeenCalled();
      expect(getAsyncTimeout(wrapper)).toBeGreaterThan(0);
      checkNotifyCalled(formContext, state);

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
        expect(asyncValidator).toHaveBeenCalledTimes(1);
        checkNotifyCalled(formContext, state);
        done();
      });
    });

    it('should clear any existing timeout if validate is called again', async () => {
      const errorId = 'mockError';
      const asyncValidator = jest.fn().mockResolvedValue(errorId);

      const { wrapper, validation } = setup({ props: {
        asyncValidators: [asyncValidator],
      }});

      expect(getAsyncTimeout(wrapper)).toBeUndefined();

      const state1 = await validation.validate(mockValue);
      const timeout1 = getAsyncTimeout(wrapper);

      const state2 = await validation.validate(mockValue);
      const timeout2 = getAsyncTimeout(wrapper);

      expect(state1).toMatchObject({
        isValidating: true,
      });
      expect(state2).toMatchObject({
        isValidating: true,
      });

      expect(timeout1).not.toEqual(timeout2);
      jest.runAllTimers();
    });
  });

  describe('form context callbacks', () => {
    it('should update the validation state if called for', () => {
      const { formContext, validation } = setup();

      const mockError = {
        message_id: 'dummy',
        params: {},
      };
      validation.update({
        valid: false,
        error: mockError,
      });
      checkNotifyCalled(
        formContext,
        {
          valid: false,
          error: mockError,
          isValidating: false,
          isRequired: false,
        },
      );
    });

    it('should correctly reset the validation state', () => {
      const { wrapper, formContext, validation } = setup();

      validation.reset();
      checkNotifyCalled(
        formContext,
        {
          valid: true,
          error: null,
          isValidating: false,
          isRequired: false,
        },
      );
      expect(getAsyncTimeout(wrapper)).toBeUndefined();

      // Edge case where we check if the timeout has
      // been cleared if a validation is in progress
      // when we call reset
      void validation.validate(mockValue);
      validation.reset();
      checkNotifyCalled(
        formContext,
        {
          valid: true,
          error: null,
          isValidating: false,
          isRequired: false,
        },
      );
      expect(getAsyncTimeout(wrapper)).toBeUndefined();
    });
  });

  it('should clear any timeouts on unmount', () => {
    const { wrapper, validation } = setup({
      props: {
        asyncValidators: [ jest.fn().mockResolvedValue(undefined) ],
      },
    });

    void validation.validate(mockValue);
    expect(getAsyncTimeout(wrapper)).not.toBeUndefined();

    const oldInstance = wrapper.instance() as BaseValidationWrapper;
    wrapper.unmount();

    const asyncTimeout = oldInstance.getAsyncTimeout();
    expect(asyncTimeout).toBe(undefined);
  });

  it('should adapt the fieldPrefix to the fullName', () => {
    const { fullName } = setup({
      contextOverrides: {
        fieldPrefix: 'unit',
      },
    });

    expect(fullName).toBe(`unit.${fieldName}`);
  });

  it('should not update its state after unmounting', () => {
    const { wrapper, formContext } = setup();

    const oldInstance = wrapper.instance() as BaseValidationWrapper;
    wrapper.unmount();

    expect(() => {
      // @ts-ignore
      oldInstance.updateAndNotify({ foo: 'bar' });
    }).not.toThrowError();
    expect(formContext.notifyFieldEvent).not.toHaveBeenCalled();
  });
});
