import { renderHook } from '@testing-library/react-hooks';

import {
  createMockFormContext,
  createMockValidationResult,
} from '../../../test-utils/enzymeFormContext';
import { useFormContext, useValidation, IUseValidationResult } from '../../../hooks';
import { useFullName, useFieldRegistration, IFieldState } from '../../../hooks/internal';
import { IFormContext } from '../../FormContext';

import { useFieldGroup } from './useFieldGroup';
import { IUseFieldGroupArgs, IUseFieldGroupResult } from './useFieldGroup.types';

jest.mock('../../../hooks');
jest.mock('../../../hooks/internal');

describe('useFieldGroup', () => {
  const mockName = 'unitGroup';
  const mockLabel = 'Unit group';
  const mockValue = {
    field1: 'value1',
    field2: 'value2',
  };

  interface ISetupArgs {
    props?: Partial<IUseFieldGroupArgs>;
    contextOverrides?: Partial<IFormContext>;
    validationOverrides?: Partial<IUseValidationResult>;
  }

  interface ISetupResult {
    formContext: IFormContext;
    validation: IUseValidationResult;

    fieldState: IFieldState;

    result: { current: IUseFieldGroupResult };
    unmount(): boolean;
  }

  const setup = ({
    props = {},
    contextOverrides,
    validationOverrides,
  }: ISetupArgs = {}): ISetupResult => {
    let fieldState = null;

    (useFullName as jest.Mock).mockImplementation((name: string) => name);
    const formContext = {
      ...createMockFormContext(),
      values: undefined,
      getValues: jest.fn().mockReturnValue({
        foo: 'bar',
        hue: 'hue',
        [mockName]: mockValue,
      }),
      ...contextOverrides,
    };
    (useFormContext as jest.Mock).mockReturnValue(formContext);

    const validation = {
      ...createMockValidationResult(),
      ...validationOverrides,
    };
    (useValidation as jest.Mock).mockReturnValue(validation);

    (useFieldRegistration as jest.Mock).mockImplementation((fullName, state) => {
      fieldState = state;
    });

    const fieldGroupProps = {
      name: mockName,
      label: mockLabel,
      ...props,
    };

    const { result, unmount } = renderHook(() => useFieldGroup(fieldGroupProps));

    return {
      formContext,
      validation,

      // @ts-ignore
      fieldState,

      result,
      unmount,
    };
  };

  describe('Form registration', () => {
    it('should register itself using useFieldRegistration', () => {
      const { fieldState } = setup();
      expect(useFieldRegistration as jest.Mock).toHaveBeenCalledWith(mockName, fieldState);
    });
  });

  describe('Form context callbacks', () => {
    describe('Context.getValue', () => {
      it('should always return an empty object', () => {
        // Currently the form checks if the "Field" is a group,
        // ignores its values and fetches them from all the child
        // Fields of the group.
        const { fieldState } = setup();
        expect(fieldState.getValue()).toEqual({});
      });
    });

    describe('Context.validate', () => {
      it('should correctly pass the validate method', () => {
        const mockValidateArgs = { checkAsync: false };
        const { fieldState, validation } = setup();

        void fieldState.validate(mockValidateArgs);

        expect(validation.validate).toHaveBeenLastCalledWith(mockValue, mockValidateArgs);
      });
    });

    describe('Context.reset', () => {
      it('should reset its validation state', () => {
        const { fieldState, validation } = setup();

        fieldState.reset();
        expect(validation.resetValidation).toHaveBeenCalled();
      });
    });
  });

  describe('Context overrides', () => {
    it('should create a valid form context', () => {
      const { formContext, result } = setup();
      expect(result.current.groupFormContext).toMatchObject({
        fieldPrefix: mockName,
        registerField: formContext.registerField,
        unregisterField: formContext.unregisterField,
        notifyFieldEvent: expect.any(Function),
        registerListener: formContext.registerListener,
        unregisterListener: formContext.unregisterListener,
        getFieldState: formContext.getFieldState,
        getValues: formContext.getValues,
        busy: formContext.busy,
        disabled: formContext.disabled,
        asyncValidateOnChange: formContext.asyncValidateOnChange,
        asyncValidationWait: formContext.asyncValidationWait,
        defaultValues: formContext.defaultValues,
        values: formContext.values,
        plaintext: formContext.plaintext,
        stringFormatter: formContext.stringFormatter,
        submit: formContext.submit,
      });
    });

    describe('Context.fieldPrefix behaviour', () => {
      it('should override the fieldPrefix with the FieldGroup fullName', () => {
        const { result } = setup();
        expect(result.current.groupFormContext.fieldPrefix).toBe(mockName);
      });
    });

    describe('Context.notifyFieldEvent behaviour', () => {
      const mockSenderLocal = 'field2';
      const mockSender = `${mockName}.${mockSenderLocal}`;

      const triggerNotification = (
        groupContext: IFormContext,
        eventName: string,
        eventArgs?: unknown
      ): void => {
        const notifyCallback = groupContext.notifyFieldEvent;
        notifyCallback(mockSender, eventName, eventArgs);
      };

      const checkEventPassing = (eventName: string, eventArgs?: unknown): void => {
        it('should pass the event to the parent form context', () => {
          const { result, formContext } = setup();
          triggerNotification(result.current.groupFormContext, eventName, eventArgs);
          expect(formContext.notifyFieldEvent).toHaveBeenCalledWith(
            mockSender,
            eventName,
            eventArgs
          );
        });
      };

      const cases: [string, unknown][] = [
        ['test', { foo: 'bar' }],
        ['random', null],
      ];
      describe.each(cases)('Event "%s"', (eventName: string, eventArgs: unknown) => {
        checkEventPassing(eventName, eventArgs);
      });

      describe('Event "change"', () => {
        const mockChangedFieldValue = 'mock-value';
        const eventName = 'change';

        const assertValidateCalled = (
          { validate }: IUseValidationResult,
          checkAsync: boolean
        ): void => {
          expect(validate).toHaveBeenCalledWith(
            {
              ...mockValue,
              [mockSenderLocal]: mockChangedFieldValue,
            },
            { checkAsync }
          );
        };

        checkEventPassing(eventName, { foo: 'bar' });

        it('should call the validate function correctly', () => {
          const { result, validation } = setup();
          triggerNotification(result.current.groupFormContext, eventName, mockChangedFieldValue);
          assertValidateCalled(validation, false);
        });

        it('should respect the Form.asyncValidateOnChange configuration', () => {
          const mockCheckAsync = true;
          const { result, validation } = setup({
            contextOverrides: {
              asyncValidateOnChange: mockCheckAsync,
            },
          });
          triggerNotification(result.current.groupFormContext, eventName, mockChangedFieldValue);
          assertValidateCalled(validation, mockCheckAsync);
        });

        it('should respect the FieldGroup.asyncValidateOnChange configuration', () => {
          const mockCheckAsync = true;
          const { result, validation } = setup({
            props: {
              asyncValidateOnChange: mockCheckAsync,
            },
          });
          triggerNotification(result.current.groupFormContext, eventName, mockChangedFieldValue);
          assertValidateCalled(validation, mockCheckAsync);
        });

        it('should use an empty object as the current state if the form does not provide one', () => {
          const { result, validation } = setup({
            contextOverrides: {
              getValues: jest.fn().mockReturnValue({
                foo: 'bar',
              }),
            },
          });

          triggerNotification(result.current.groupFormContext, eventName, mockChangedFieldValue);
          expect(validation.validate).toHaveBeenCalledWith(
            {
              [mockSenderLocal]: mockChangedFieldValue,
            },
            { checkAsync: false }
          );
        });
      });

      describe('Event "blur"', () => {
        const eventName = 'blur';
        checkEventPassing(eventName, { foo: 'bar' });

        const cases = [
          ['Form.asyncValidateOnChange', 'props'],
          ['FieldGroup.asyncValidateOnChange', 'contextOverrides'],
        ];

        describe.each(cases)('should respect the %s configuration', (name, config) => {
          it('should not trigger a validation if validateOnChange is true', () => {
            const mockCheckAsync = true;
            const { result, validation } = setup({
              [config]: {
                asyncValidateOnChange: mockCheckAsync,
              },
            });
            triggerNotification(result.current.groupFormContext, eventName);
            expect(validation.validate).not.toHaveBeenCalled();
          });

          it('should trigger a validation if validateOnChange is true', () => {
            const mockCheckAsync = false;
            const { result, validation } = setup({
              [config]: {
                asyncValidateOnChange: mockCheckAsync,
              },
            });
            triggerNotification(result.current.groupFormContext, eventName);
            expect(validation.validate).toHaveBeenCalledWith(mockValue);
          });
        });
      });
    });

    const propCases: [keyof IFormContext][] = [['defaultValues'], ['values']];

    describe.each(propCases)('Context.%s behaviour', (prop) => {
      const formStates: [string, null | undefined | object][] = [
        ['null', null],
        ['undefined', undefined],
        ['empty', {}],
        [
          'existing',
          {
            mockField: '42',
            [mockName]: { default: 'values' },
          },
        ],
      ];

      it.each(formStates)(
        `should correctly override %s Context.${prop}`,
        (stateName, formState) => {
          const mockGroupValue = { foo: 'bar' };

          const { result } = setup({
            props: {
              [prop]: mockGroupValue,
            },
            contextOverrides: {
              [prop]: formState,
            },
          });

          expect(result.current.groupFormContext[prop]).toEqual({
            ...formState,
            ...{
              [mockName]: mockGroupValue,
            },
          });
        }
      );
    });

    const overrideCases = [['plaintext'], ['disabled']];

    describe.each(overrideCases)('Context.%s behaviour', (prop) => {
      const cases: [boolean, undefined | boolean, boolean][] = [
        [false, undefined, false],
        [true, undefined, true],
        [false, false, false],
        [false, false, true],
        [true, true, true],
        [true, true, false],
      ];

      it.each(cases)(
        `${prop} should be %s if Field.${prop} is %s and FormContext.${prop} is %s`,
        (expectedValue: boolean, propValue: boolean | undefined, contextValue: boolean) => {
          const { result } = setup({
            props: {
              [prop]: propValue,
            },
            contextOverrides: {
              [prop]: contextValue,
            },
          });

          // @ts-ignore any is OK here
          expect(result.current.groupFormContext[prop]).toEqual(expectedValue);
        }
      );
    });
  });

  describe('render params', () => {
    it('should create the correct parameters', () => {
      const { result } = setup();
      expect(result.current.renderParams).toMatchObject({
        fullName: mockName,
        isValidating: false,
        isRequired: false,
        valid: true,
        error: null,
      });
    });

    it('should correctly pass the validation state', () => {
      const mockIsValidating = true;
      const mockIsRequired = true;
      const mockIsValid = false;
      const mockError = { message_id: 'bar', params: {} };

      const { result } = setup({
        validationOverrides: {
          validationState: {
            isValidating: mockIsValidating,
            isRequired: mockIsRequired,
            valid: mockIsValid,
            error: mockError,
          },
        },
      });
      expect(result.current.renderParams).toMatchObject({
        fullName: mockName,
        isValidating: mockIsValidating,
        isRequired: mockIsRequired,
        valid: mockIsValid,
        error: mockError,
      });
    });
  });

  // describe('Edge cases', () => {
  //   it('FieldGroup.getGroupValue should return undefined if context.getValues() doesn\'t have values for the group', () => {
  //     const mockGetValues = jest.fn().mockReturnValue({});
  //     const { wrapper } = setup({
  //       contextOverrides: {
  //         getValues: mockGetValues,
  //       },
  //     });

  //     // @ts-ignore getGroupValue is private, maybe there is a better solution to test this?
  //     expect((wrapper.instance() as BaseFieldGroup).getGroupValue()).toBeUndefined();
  //     expect(mockGetValues).toHaveBeenCalled();
  //   });
  // });
});
