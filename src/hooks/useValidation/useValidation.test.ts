import { renderHook, cleanup, act } from 'react-hooks-testing-library';

import { IFormContext, IValidationProp, IValidatedComponentProps } from '../../components';
import { createMockFormContext } from '../../test-utils/enzymeFormContext';
import { TValidator, validators as defaultValidators } from '../../validators';

import { useValidation, IBasicValidationState, IUseValidationResult } from './useValidation';
import { useFormContext } from '../useFormContext';

jest.mock('../useFormContext');
afterEach(cleanup);

describe('useValidation', () => {
  const fieldName = 'unitField';

  interface ISetupArgs {
    props?: Partial<IValidatedComponentProps>;
    contextOverrides?: Partial<IFormContext>;
  }

  interface ISetupResult {
    formContext: IFormContext;
    validation: IValidationProp;

    unmount(): boolean;
    rerender(): void;
    waitForNextUpdate(): Promise<void>;
    result: { current: IUseValidationResult };
  }

  const setup = ({
    props = { },
    contextOverrides,
  }: Partial<ISetupArgs> = {}): ISetupResult => {
    const formContext: IFormContext = {
      ...createMockFormContext(),
      ...contextOverrides,
    };
    (useFormContext as jest.Mock).mockReturnValue(formContext);

    const { result, unmount, rerender, waitForNextUpdate } = renderHook(() => useValidation(
      props.name === undefined ? fieldName : props.name,
      props.validators,
      props.asyncValidators,
      props.asyncValidationWait,
    ));

    const validation: IValidationProp = {
      ...result.current.validationState,
      validate: result.current.validate,
      reset: result.current.resetValidation,
      update: result.current.updateValidationState,
    };

    return {
      formContext,
      validation,

      unmount,
      rerender,
      result,
      waitForNextUpdate,
    };
  };

  it('should return a valid state without validators', async () => {
    const { validation } = setup();

    await act(async () => { validation.validate('foo') });
    expect(validation).toMatchObject({
      error: null,
      isValidating: false,
      valid: true,
    });
  });

  const mockValue = 'foobar';
  const checkNotifyCalled = (formContext: IFormContext, state: IBasicValidationState): void => {
    expect(formContext.notifyFieldEvent).toHaveBeenLastCalledWith(
      fieldName,
      'validation',
      state,
    );
  };

  describe('sync validation', () => {
    it('should call the sync validators and return a validation state', async () => {
      const validator = jest.fn().mockReturnValue(undefined);

      const { validation, formContext } = setup({ props: {
        validators: [validator],
      }});

      await act(async () => {
        const state = await validation.validate(mockValue);
        expect(state).toMatchObject({
          isValidating: false,
          valid: true,
          error: null,
        });

        checkNotifyCalled(formContext, state);
      });
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

      await act(async () => {
        await validation.validate(mockValue);
      });

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

      await act(async () => {
        await validation.validate(mockValue);
      });

      expect(asyncValidator).not.toHaveBeenCalled();
    });

    describe('required validator', () => {
      const createValidator = (defaultValue: unknown): TValidator => {
        const customRequiredValidator = (): undefined => undefined;
        customRequiredValidator.isDefaultValidator = defaultValue;

        return customRequiredValidator;
      };

      const cases: [string, undefined | TValidator[], boolean][] = [
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

      it.each(cases)('%s', (name: string, validators: undefined | TValidator[], expectedIsRequiredState: unknown) => {
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

      await act(async () => {
        const state = await validation.validate(mockValue, { checkAsync: false });
        expect(state).toMatchObject({
          isValidating: false,
          valid: true,
          error: null,
        });
        expect(asyncValidator).not.toHaveBeenCalled();

        checkNotifyCalled(formContext, state);
      });
    });

    it('should immediately run the validators if immediateAsync is true', async () => {
      const errorId = 'mockError';
      const asyncValidator = jest.fn().mockResolvedValue(errorId);

      const { validation, formContext } = setup({ props: {
        asyncValidators: [asyncValidator],
      }});

      await act(async () => {
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
    });

    it('should wait for the default amount until triggering the async validators', async () => {
      const errorId = 'mockError';
      const asyncValidator = jest.fn().mockResolvedValue(errorId);

      const { validation, formContext, result } = setup({ props: {
        asyncValidators: [asyncValidator],
      }});

      const spiedTimeout = jest.spyOn(window, 'setTimeout');

      await act(async () => {
        const state = await validation.validate(mockValue);

        expect(state).toMatchObject({
          isValidating: true,
          valid: true,
          error: null,
        });
        expect(asyncValidator).not.toHaveBeenCalled();
        checkNotifyCalled(formContext, state);
        expect(formContext.notifyFieldEvent).toHaveBeenCalledTimes(1);

        expect(spiedTimeout).toHaveBeenCalledWith(
          expect.any(Function),
          formContext.asyncValidationWait,
        );
      });

      await act(async () => {
        jest.runAllTimers();
        expect(asyncValidator).toHaveBeenCalledTimes(1);
      });

      expect(formContext.notifyFieldEvent).toHaveBeenCalledTimes(2);
      expect(result.current.validationState).toMatchObject({
        isValidating: false,
        valid: false,
        error: [{
          message_id: errorId,
          params: {},
        }],
      });
    });

    it('should prefer the ValidationWrapper.asyncValidationWait prop over the formContext one', async () => {
      const errorId = 'mockError';
      const asyncValidator = jest.fn().mockResolvedValue(errorId);

      const { validation } = setup({ props: {
        asyncValidators: [asyncValidator],
        asyncValidationWait: 42,
      }});

      await act(async () => {
        const spiedTimeout = jest.spyOn(window, 'setTimeout');
        await validation.validate(mockValue);

        expect(spiedTimeout).toHaveBeenCalledWith(
          expect.any(Function),
          42,
        );
      });
    });

    it('should clear any existing timeout if validate is called again', async () => {
      const errorId = 'mockError';
      const asyncValidator = jest.fn().mockResolvedValue(errorId);

      const { validation } = setup({ props: {
        asyncValidators: [asyncValidator],
      }});

      await act(async () => {
        const state1 = await validation.validate(mockValue);
        expect(state1).toMatchObject({
          isValidating: true,
        });
      });
      expect(asyncValidator).toHaveBeenCalledTimes(0);

      await act(async () => {
        const state2 = await validation.validate(mockValue);
        expect(state2).toMatchObject({
          isValidating: true,
        });
      });

      await act(async () => {
        jest.runAllTimers();
        expect(asyncValidator).toHaveBeenCalledTimes(1);
      });
    });

    it('should set validationState.error to null if it is an empty array after filtering invalid errors out', async () => {
      const asyncValidator = jest.fn().mockResolvedValue({ foo: 'bar' });

      const { validation } = setup({ props: {
        asyncValidators: [asyncValidator],
      }});

      await act(async () => {
        const state = await validation.validate(mockValue, { immediateAsync: true });
        expect(state).toMatchObject({
          isValidating: false,
          valid: true,
          error: null,
        });
      });
    });
  });

  describe('form context callbacks', () => {
    it('should update the validation state if called for', () => {
      const { formContext, validation } = setup();

      const mockError = {
        message_id: 'dummy',
        params: {},
      };

      act(() => {
        validation.update({
          valid: false,
          error: mockError,
        });
      });
      checkNotifyCalled(
        formContext,
        {
          valid: false,
          error: mockError,
          isValidating: false,
        },
      );
    });

    it('should correctly reset the validation state', async () => {
      const { formContext, validation } = setup();

      act(() => {
        validation.reset();
      });
      checkNotifyCalled(
        formContext,
        {
          valid: true,
          error: null,
          isValidating: false,
        },
      );
    });
  });

  it('should not update its state after unmounting', () => {
    const { validation, formContext, unmount } = setup();

    unmount();

    expect(() => {
      validation.update({ isValidating: true });
    }).not.toThrowError();
    expect(formContext.notifyFieldEvent).not.toHaveBeenCalled();
  });
});
