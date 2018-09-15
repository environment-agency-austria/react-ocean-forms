import * as React from 'react';

// tslint:disable-next-line:no-implicit-dependencies
import { shallow, ShallowWrapper } from 'enzyme';

import { createMockFormContext, createMockValidation } from '../../test-utils/enzymeFormContext';
import { IFieldState, IFormContext } from '../FormContext';
import { IValidationProp } from '../withValidation';
import { BaseFieldGroup } from './FieldGroup';
import { IFieldGroupProps } from './FieldGroup.types';

describe('<FieldGroup />', () => {
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
    fieldState: IFieldState;
    validation: IValidationProp;
    wrapper: ShallowWrapper;
    renderMock: jest.Mock;
    groupContext: IFormContext;
  }

  const setup = ({
    props,
    contextOverrides,
    validationOverrides,
  }: ISetupArgs = {}): ISetupResult => {
    let fieldState = null;
    const registerCallback = (name: string, state: IFieldState): void => { fieldState = state; };
    const renderMock = jest.fn().mockReturnValue(null);

    const formContext = {
      ...createMockFormContext(registerCallback),
      getValues: jest.fn().mockReturnValue({
        foo: 'bar',
        hue: 'hue',
        [mockName]: mockValue,
      }),
      ...contextOverrides,
    };
    const validation = {
      ...createMockValidation(),
      ...validationOverrides,
    };

    const wrapper = shallow((
      <BaseFieldGroup
        name={mockName}
        fullName={mockName}
        label={mockLabel}
        context={formContext}
        validation={validation}
        render={renderMock}
        {...props}
      />
    ));

    const groupContext = wrapper.first().prop('value');

    return {
      formContext,
      //@ts-ignore Field state is always initialized through the registerCallback
      fieldState,
      validation,
      wrapper,
      renderMock,
      groupContext,
    };
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

          isGroup: true,
        },
      );
    });

    it('should unregister itself on unmount', () => {
      wrapper.unmount();
      expect(formContext.unregisterField).toHaveBeenCalledWith(mockName);
    });
  });

  describe('Invalid form context', () => {
    const mockErrorString = `Could not find a form context for field group "${mockName}". `
                          + 'Fields can only be used inside a Form tag.';

    it('should throw an error if there is no form context', () => {
      expect(() => setup({ props: { context: undefined } })).toThrowError(mockErrorString);
    });

    it('should throw an error if the form context is invalid', () => {
      // @ts-ignore The whole point of this test is to check the behaviour with an invalid type
      expect(() => setup({ props: { context: { foo: 'bar' } } })).toThrowError(mockErrorString);
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

        fieldState.validate(mockValidateArgs);

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

      describe.each([
        ['test', { foo: 'bar' }],
        ['random', null],
      ])('Event "%s"', (eventName, eventArgs) => {
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
      const formStates = [
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
  });

  describe('render prop', () => {
    it('should get called with the correct parameters', () => {
      const { renderMock } = setup();
      expect(renderMock).toHaveBeenCalledWith({
        fullName: mockName,
        isValidating: false,
        valid: true,
        error: null,
      });
    });

    it('should correctly pass the validation state', () => {
      const mockIsValidating = true;
      const mockIsValid = false;
      const mockError = { message_id: 'bar', params: {} };

      const { renderMock } = setup({
        validationOverrides: {
          isValidating: mockIsValidating,
          valid: mockIsValid,
          error: mockError,
        },
      });
      expect(renderMock).toHaveBeenCalledWith({
        fullName: mockName,
        isValidating: mockIsValidating,
        valid: mockIsValid,
        error: mockError,
      });
    });
  });

  describe('Edge cases', () => {
    it('FieldGroup.getGroupValue should return an empty object if context.getValues() doesn\'t have values for the group', () => {
      const mockGetValues = jest.fn().mockReturnValue({});
      const { wrapper } = setup({
        contextOverrides: {
          getValues: mockGetValues,
        },
      });

      // @ts-ignore getGroupValue is private, maybe there is a better solution to test this?
      expect((wrapper.instance() as BaseFieldGroup).getGroupValue()).toEqual({});
      expect(mockGetValues).toHaveBeenCalled();
    });
  });
});
