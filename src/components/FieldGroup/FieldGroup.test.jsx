import React from 'react';
import { shallow } from 'enzyme';

import { createMockFormContext, createMockValidation } from '../../test-utils/enzymeFormContext';
import { BaseFieldGroup } from './FieldGroup';

describe('<FieldGroup />', () => {
  const MOCK_NAME = 'unitGroup';
  const MOCK_LABEL = 'Unit group';
  const MOCK_VALUE = {
    field1: 'value1',
    field2: 'value2',
  };

  const setup = ({
    props = undefined,
    contextOverrides = undefined,
    validationOverrides = undefined,
  } = {}) => {
    let fieldState = null;
    const registerCallback = (name, state) => { fieldState = state; };
    const renderMock = jest.fn().mockReturnValue(null);

    const formContext = {
      ...createMockFormContext(registerCallback),
      getValues: jest.fn().mockReturnValue({
        foo: 'bar',
        hue: 'hue',
        [MOCK_NAME]: MOCK_VALUE,
      }),
      ...contextOverrides,
    };
    const validation = {
      ...createMockValidation(),
      ...validationOverrides,
    };

    const wrapper = shallow((
      <BaseFieldGroup
        name={MOCK_NAME}
        fullName={MOCK_NAME}
        label={MOCK_LABEL}
        context={formContext}
        validation={validation}
        render={renderMock}
        {...props}
      />
    ));

    const groupContext = wrapper.first().prop('value');

    return {
      formContext,
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

          isGroup: true,
        },
      );
    });

    it('should unregister itself on unmount', () => {
      wrapper.unmount();
      expect(formContext.unregisterField).toHaveBeenCalledWith(MOCK_NAME);
    });
  });

  describe('Invalid form context', () => {
    const MOCK_ERROR_STRING = `Could not find a form context for field group "${MOCK_NAME}". `
                            + 'Fields can only be used inside a Form tag.';

    it('should throw an error if there is no form context', () => {
      expect(() => setup({ props: { context: undefined } })).toThrowError(MOCK_ERROR_STRING);
    });

    it('should throw an error if the form context is invalid', () => {
      expect(() => setup({ props: { context: { foo: 'bar' } } })).toThrowError(MOCK_ERROR_STRING);
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
        const MOCK_VALIDATE_ARGS = { foo: 'bar' };
        const { fieldState, validation } = setup();

        fieldState.validate(MOCK_VALIDATE_ARGS);

        expect(validation.validate).toHaveBeenLastCalledWith(
          MOCK_VALUE,
          MOCK_VALIDATE_ARGS,
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
        fieldPrefix: MOCK_NAME,
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
        expect(groupContext.fieldPrefix).toBe(MOCK_NAME);
      });
    });

    describe('Context.notifyFieldEvent behaviour', () => {
      const MOCK_SENDER_LOCAL = 'field2';
      const MOCK_SENDER = `${MOCK_NAME}.${MOCK_SENDER_LOCAL}`;

      const triggerNotification = (groupContext, eventName, eventArgs) => {
        const notifyCallback = groupContext.notifyFieldEvent;
        notifyCallback(MOCK_SENDER, eventName, eventArgs);
      };

      const checkEventPassing = (eventName, eventArgs) => {
        it('should pass the event to the parent form context', () => {
          const { groupContext, formContext } = setup();
          triggerNotification(groupContext, eventName, eventArgs);
          expect(formContext.notifyFieldEvent).toHaveBeenCalledWith(
            MOCK_SENDER,
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
        const MOCK_CHANGED_FIELD_VALUE = 'mock-value';
        const eventName = 'change';

        const assertValidateCalled = ({ validate }, checkAsync) => {
          expect(validate).toHaveBeenCalledWith(
            {
              ...MOCK_VALUE,
              [MOCK_SENDER_LOCAL]: MOCK_CHANGED_FIELD_VALUE,
            },
            { checkAsync },
          );
        };

        checkEventPassing(eventName, { foo: 'bar' });

        it('should call the validate function correctly', () => {
          const { groupContext, validation } = setup();
          triggerNotification(groupContext, eventName, MOCK_CHANGED_FIELD_VALUE);
          assertValidateCalled(validation, false);
        });

        it('should respect the Form.asyncValidateOnChange configuration', () => {
          const MOCK_CHECK_ASYNC = true;
          const { groupContext, validation } = setup({
            contextOverrides: {
              asyncValidateOnChange: MOCK_CHECK_ASYNC,
            },
          });
          triggerNotification(groupContext, eventName, MOCK_CHANGED_FIELD_VALUE);
          assertValidateCalled(validation, MOCK_CHECK_ASYNC);
        });

        it('should respect the FieldGroup.asyncValidateOnChange configuration', () => {
          const MOCK_CHECK_ASYNC = true;
          const { groupContext, validation } = setup({
            props: {
              asyncValidateOnChange: MOCK_CHECK_ASYNC,
            },
          });
          triggerNotification(groupContext, eventName, MOCK_CHANGED_FIELD_VALUE);
          assertValidateCalled(validation, MOCK_CHECK_ASYNC);
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
            const MOCK_CHECK_ASYNC = true;
            const { groupContext, validation } = setup({
              [config]: {
                asyncValidateOnChange: MOCK_CHECK_ASYNC,
              },
            });
            triggerNotification(groupContext, eventName);
            expect(validation.validate).not.toHaveBeenCalled();
          });

          it('should trigger a validation if validateOnChange is true', () => {
            const MOCK_CHECK_ASYNC = false;
            const { groupContext, validation } = setup({
              [config]: {
                asyncValidateOnChange: MOCK_CHECK_ASYNC,
              },
            });
            triggerNotification(groupContext, eventName);
            expect(validation.validate).toHaveBeenCalledWith(MOCK_VALUE);
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
          [MOCK_NAME]: { default: 'values' },
        }],
      ];

      it.each(formStates)(`should correctly override %s Context.${prop}`, (stateName, formState) => {
        const MOCK_GROUP_VALUE = { foo: 'bar' };

        const { groupContext } = setup({
          props: {
            [prop]: MOCK_GROUP_VALUE,
          },
          contextOverrides: {
            [prop]: formState,
          },
        });

        expect(groupContext[prop]).toEqual({
          ...formState,
          ...{
            [MOCK_NAME]: MOCK_GROUP_VALUE,
          },
        });
      });
    });
  });

  describe('render prop', () => {
    it('should get called with the correct parameters', () => {
      const { renderMock } = setup();
      expect(renderMock).toHaveBeenCalledWith({
        fullName: MOCK_NAME,
        isValidating: false,
        valid: true,
        error: null,
      });
    });

    it('should correctly pass the validation state', () => {
      const MOCK_IS_VALIDATING = true;
      const MOCK_IS_VALID = false;
      const MOCK_ERROR = { message_id: 'bar' };

      const { renderMock } = setup({
        validationOverrides: {
          isValidating: MOCK_IS_VALIDATING,
          valid: MOCK_IS_VALID,
          error: MOCK_ERROR,
        },
      });
      expect(renderMock).toHaveBeenCalledWith({
        fullName: MOCK_NAME,
        isValidating: MOCK_IS_VALIDATING,
        valid: MOCK_IS_VALID,
        error: MOCK_ERROR,
      });
    });
  });

  describe('Edge cases', () => {
    it('FieldGroup.getGroupValue should return an empty object if context.getValues() doesn\'t have values for the group', () => {
      const MOCK_GET_VALUES = jest.fn().mockReturnValue({});
      const { wrapper } = setup({
        contextOverrides: {
          getValues: MOCK_GET_VALUES,
        },
      });

      expect(wrapper.instance().getGroupValue()).toEqual({});
      expect(MOCK_GET_VALUES).toHaveBeenCalled();
    });
  });
});
