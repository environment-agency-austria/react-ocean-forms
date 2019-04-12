import { renderHook, cleanup } from 'react-hooks-testing-library';

import { createMockFormContext, createMockValidation } from '../../../test-utils/enzymeFormContext';
import { useFormContext, useFullName, useValidation, useFieldRegistration } from '../../../hooks';
import { IFormContext, IFieldState } from '../../FormContext';
import { IValidationProp } from '../../withValidation';

import { IFieldGroupRenderParams, IFieldGroupProps } from '../FieldGroup.types';
import { useFieldGroup } from './useFieldGroup';

jest.mock('../../../hooks');
afterEach(cleanup);

describe('useFieldGroup', () => {
  const mockName = 'unitGroup';
  const mockLabel = 'Unit group';
  const mockValue = {
    field1: 'value1',
    field2: 'value2',
  };

  interface ISetupArgs {
    props?: Partial<IFieldGroupProps>;
    contextOverrides?: Partial<IFormContext>;
    validationOverrides?: Partial<IValidationProp>;
  }

  interface ISetupResult {
    formContext: IFormContext;
    validation: IValidationProp;

    fieldState: IFieldState;
    groupContext: IFormContext;
    renderParams: IFieldGroupRenderParams;

    unmount(): boolean;
  }

  const setup = ({
    props = { },
    contextOverrides,
    validationOverrides,
  }: ISetupArgs = {}): ISetupResult => {
    let fieldState = null;

    (useFullName as jest.Mock).mockImplementation((name: string) => name)
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
      ...createMockValidation(),
      ...validationOverrides,
    };
    (useValidation as jest.Mock).mockReturnValue({
      validationState: {
        isValidating: validation.isValidating,
        valid: validation.valid,
        error: validation.error,
        isRequired: validation.isRequired,
      },
      validate: validation.validate,
      resetValidation: validation.reset,
      updateValidationState: validation.update,
    });

    (useFieldRegistration as jest.Mock).mockImplementation((fullName, label, isGroup, updateValidation, validate, reset, getValue) => {
      fieldState = {
        label,

        updateValidation,
        validate,
        reset,
        getValue,

        isGroup,
      };
    });

    const { result, unmount } = renderHook(() => useFieldGroup(
      mockName,
      mockLabel,
      props.validators,
      props.asyncValidators,
      props.asyncValidationWait,
      props.disabled,
      props.plaintext,
      props.asyncValidateOnChange,
      props.defaultValues,
      props.values,
    ));

    return {
      formContext,
      validation,

      // @ts-ignore
      fieldState,
      groupContext: result.current[0],
      renderParams: result.current[1],

      unmount,
    };
  };

  describe('Form registration', () => {
    it('should register itself using useFieldRegistration', () => {
      const { validation } = setup();
      expect((useFieldRegistration as jest.Mock)).toHaveBeenCalledWith(
        mockName,
        mockLabel,
        true,
        validation.update,
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
      );
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

        expect(validation.validate).toHaveBeenLastCalledWith(
          mockValue,
          mockValidateArgs,
        );
      });
    });

    describe('Context.reset', () => {
      it('should reset its validation state', () => {
        const { fieldState, validation } = setup();

        fieldState.reset();
        expect(validation.reset).toHaveBeenCalled();
      });
    });
  });

  describe('Context overrides', () => {
    it('should create a valid form context', () => {
      const { formContext, groupContext } = setup();
      expect(groupContext).toMatchObject({
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
        const { groupContext } = setup();
        expect(groupContext.fieldPrefix).toBe(mockName);
      });
    });

    describe('Context.notifyFieldEvent behaviour', () => {
      const mockSenderLocal = 'field2';
      const mockSender = `${mockName}.${mockSenderLocal}`;

      const triggerNotification = (groupContext: IFormContext, eventName: string, eventArgs?: unknown): void => {
        const notifyCallback = groupContext.notifyFieldEvent;
        notifyCallback(mockSender, eventName, eventArgs);
      };

      const checkEventPassing = (eventName: string, eventArgs?: unknown): void => {
        it('should pass the event to the parent form context', () => {
          const { groupContext, formContext } = setup();
          triggerNotification(groupContext, eventName, eventArgs);
          expect(formContext.notifyFieldEvent).toHaveBeenCalledWith(
            mockSender,
            eventName,
            eventArgs,
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

        const assertValidateCalled = ({ validate }: IValidationProp, checkAsync: boolean): void => {
          expect(validate).toHaveBeenCalledWith(
            {
              ...mockValue,
              [mockSenderLocal]: mockChangedFieldValue,
            },
            { checkAsync },
          );
        };

        checkEventPassing(eventName, { foo: 'bar' });

        it('should call the validate function correctly', () => {
          const { groupContext, validation } = setup();
          triggerNotification(groupContext, eventName, mockChangedFieldValue);
          assertValidateCalled(validation, false);
        });

        it('should respect the Form.asyncValidateOnChange configuration', () => {
          const mockCheckAsync = true;
          const { groupContext, validation } = setup({
            contextOverrides: {
              asyncValidateOnChange: mockCheckAsync,
            },
          });
          triggerNotification(groupContext, eventName, mockChangedFieldValue);
          assertValidateCalled(validation, mockCheckAsync);
        });

        it('should respect the FieldGroup.asyncValidateOnChange configuration', () => {
          const mockCheckAsync = true;
          const { groupContext, validation } = setup({
            props: {
              asyncValidateOnChange: mockCheckAsync,
            },
          });
          triggerNotification(groupContext, eventName, mockChangedFieldValue);
          assertValidateCalled(validation, mockCheckAsync);
        });

        it('should use an empty object as the current state if the form does not provide one', () => {
          const { groupContext, validation } = setup({
            contextOverrides: {
              getValues: jest.fn().mockReturnValue({
                foo: 'bar',
              }),
            },
          });

          triggerNotification(groupContext, eventName, mockChangedFieldValue);
          expect(validation.validate).toHaveBeenCalledWith(
            {
              [mockSenderLocal]: mockChangedFieldValue,
            },
            { checkAsync: false },
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
            const { groupContext, validation } = setup({
              [config]: {
                asyncValidateOnChange: mockCheckAsync,
              },
            });
            triggerNotification(groupContext, eventName);
            expect(validation.validate).not.toHaveBeenCalled();
          });

          it('should trigger a validation if validateOnChange is true', () => {
            const mockCheckAsync = false;
            const { groupContext, validation } = setup({
              [config]: {
                asyncValidateOnChange: mockCheckAsync,
              },
            });
            triggerNotification(groupContext, eventName);
            expect(validation.validate).toHaveBeenCalledWith(mockValue);
          });
        });
      });
    });

    const propCases = [
      ['defaultValues'],
      ['values'],
    ];

    describe.each(propCases)('Context.%s behaviour', (prop) => {
      const formStates: [string, unknown][] = [
        ['null', null],
        ['undefined', undefined],
        ['empty', {}],
        ['existing', {
          mockField: '42',
          [mockName]: { default: 'values' },
        }],
      ];

      it.each(formStates)(`should correctly override %s Context.${prop}`, (stateName, formState) => {
        const mockGroupValue = { foo: 'bar' };

        const { groupContext } = setup({
          props: {
            [prop]: mockGroupValue,
          },
          contextOverrides: {
            [prop]: formState,
          },
        });

        // @ts-ignore any is OK here
        expect(groupContext[prop]).toEqual({
          ...formState,
          ...{
            [mockName]: mockGroupValue,
          },
        });
      });
    });

    const overrideCases = [
      ['plaintext'],
      ['disabled'],
    ];

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
          const { groupContext } = setup({
            props: {
              [prop]: propValue,
            },
            contextOverrides: {
              [prop]: contextValue,
            },
          });

          // @ts-ignore any is OK here
          expect(groupContext[prop]).toEqual(expectedValue);
        },
      );
    });
  });

  describe('render params', () => {
    it('should create the correct parameters', () => {
      const { renderParams } = setup();
      expect(renderParams).toMatchObject({
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

      const { renderParams } = setup({
        validationOverrides: {
          isValidating: mockIsValidating,
          isRequired: mockIsRequired,
          valid: mockIsValid,
          error: mockError,
        },
      });
      expect(renderParams).toMatchObject({
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
