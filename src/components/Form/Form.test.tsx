import * as React from 'react';

// tslint:disable-next-line:no-implicit-dependencies
import { shallow, ShallowWrapper } from 'enzyme';
import { mockEvent } from '../../test-utils/enzymeEventUtils';
import { IFieldState, IFormContext, TFieldValues, TFormEventListener } from '../FormContext';
import { Form } from './Form';
import { IFormProps } from './Form.types';

describe('<Form />', () => {
  interface ISetupArgs {
    props?: Partial<IFormProps>;
  }

  interface ISetupResult {
    wrapper: ShallowWrapper;
    formContext: IFormContext;
    form: ShallowWrapper;
  }

  const setup = ({
    props,
  }: Partial<ISetupArgs> = {}): ISetupResult => {
    const wrapper = shallow((
      <Form
        {...props}
      >
        <div>unitChild</div>
      </Form>
    ));

    const formContext = wrapper.first().prop('value');
    const form = wrapper.find('form');

    return {
      wrapper,
      formContext,
      form,
    };
  };

  const createMockFieldState = (label: string, isGroup?: boolean): IFieldState => ({
    label,
    isGroup,
    validate: jest.fn().mockResolvedValue({
      isValidating: false,
      valid: true,
      error: null,
    }),
    updateValidation: jest.fn(),
    reset: jest.fn(),
    getValue: jest.fn().mockReturnValue(label),
  });

  interface IMockField {
    name: string;
    state: IFieldState;
  }

  const createMockField = (name: string, label: string, isGroup?: boolean): IMockField => ({
    name,
    state: createMockFieldState(label, isGroup),
  });

  const registerUnitField = (fields: IMockField[], formContext: IFormContext): void => {
    fields.forEach(field => formContext.registerField(field.name, field.state));
  };

  interface IMockListener {
    id: string;
    state: TFormEventListener;
  }

  const createMockListener = (id?: string): IMockListener => ({
    id: id || 'listener',
    state: jest.fn(),
  });

  const createMockListeners = (count: number): IMockListener[] => {
    const result = [];
    for (let i = 0; i < count; i += 1) {
      result.push(createMockListener(`listener${i}`));
    }

    return result;
  };

  it('should render without error', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });

  it('should create a valid form context', () => {
    const { formContext } = setup();
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
      const { formContext } = setup({
        props: { [prop]: value },
      });
      expect(formContext).toMatchObject({ [contextProp]: value });
    });
  });

  describe('invalid field registration', () => {
    // tslint:disable-next-line:no-empty
    const mf = (): void => {};
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

    test.each(cases)('case %s', (testName, fieldName, fieldState) => {
      const { formContext } = setup();
      expect(() => formContext.registerField(fieldName, fieldState)).toThrowErrorMatchingSnapshot();
    });
  });

  describe('field states and values', () => {
    const createCases = (): (string | IMockField)[][] => {
      return [
        ['field', createMockField('unitField', 'Unit field')],
        ['group', createMockField('unitGroup', 'Unit group', true)],
        ['sub field', createMockField('unitGroup.subField', 'Sub field', true)],
      ];
    };

    describe('formContext.registerField - field registration', () => {
      const cases = createCases();

      test.each(cases)('should register a new %s without crashing', (testName, field) => {
        const { formContext } = setup();
        expect(() => registerUnitField([field], formContext)).not.toThrowError();
      });
    });

    describe('formContext.unregisterField - field cleanup', () => {
      const cases = createCases();

      test.each(cases)('should unregister %s without crashing', (testName, field) => {
        const { formContext } = setup();
        formContext.registerField(field.name, field.state);
        formContext.unregisterField(field.name);
      });
    });

    describe('formContext.getFieldState - field states', () => {
      const cases = createCases();

      test.each(cases)('should return the correct field state of a %s', (testName, field) => {
        const { formContext } = setup();
        registerUnitField([field], formContext);
        expect(formContext.getFieldState(field.name)).toBe(field.state);
      });
    });

    describe('formContext.getValues - form values', () => {
      const { formContext } = setup();

      const unitField = createMockField('unitField', 'Unit field');
      const unitGroup = createMockField('unitGroup', 'Unit group', true);
      const unitSubField = createMockField(`${unitGroup.name}.subField`, 'Sub field');

      const mockFields = [unitField, unitGroup, unitSubField];
      registerUnitField(mockFields, formContext);

      let formValues: TFieldValues;
      it('should return the values without crashing', () => {
        expect(() => {
          formValues = formContext.getValues();
        }).not.toThrowError();
      });

      it('should call unitField.getValue', () => {
        expect(unitField.state.getValue).toHaveBeenCalled();
      });

      it('should call subField.getValue', () => {
        expect(unitSubField.state.getValue).toHaveBeenCalled();
      });

      it('should not call group.getValue', () => {
        // The value of fieldGroups is computed by its children
        expect(unitGroup.state.getValue).not.toHaveBeenCalled();
      });

      it('should return the correct form values', () => {
        const subFieldLocalName = unitSubField.name.substring(unitGroup.name.length + 1);
        const expectedFormValues = {
          [unitField.name]: unitField.state.label,
          [unitGroup.name]: {
            [subFieldLocalName]: unitSubField.state.label,
          },
        };

        expect(formValues).toMatchObject(expectedFormValues);
      });
    });
  });

  describe('listener / notify system', () => {
    interface ISetupListenerResult extends ISetupResult {
      unitField: IMockField;
      mockListeners: IMockListener[];
    }

    const setupListener = (count: number): ISetupListenerResult => {
      const setupResult = setup();

      const unitField = createMockField('unitField', 'Unit field');
      setupResult.formContext.registerField(unitField.name, unitField.state);

      const mockListeners = createMockListeners(count);
      mockListeners.forEach(item => setupResult.formContext.registerListener(item.id, item.state));

      return {
        ...setupResult,
        mockListeners,
        unitField,
      };
    };

    it('should register new listeners without crashing', () => {
      const mockListeners = createMockListeners(3);
      const { formContext } = setup();
      mockListeners.forEach((item) => {
        expect(() => formContext.registerListener(item.id, item.state)).not.toThrowError();
      });
    });

    it('should unregister new listeners without crashing', () => {
      const mockListeners = createMockListeners(3);
      const { formContext } = setup();
      mockListeners.forEach((item) => {
        formContext.registerListener(item.id, item.state);
        expect(() => formContext.unregisterListener(item.id)).not.toThrowError();
      });
    });

    it('should pass the validation notification to all listeners', () => {
      const eventName = 'validation';
      const eventArgs = { foo: 'bar' };

      const { formContext, unitField, mockListeners } = setupListener(3);

      formContext.notifyFieldEvent(unitField.name, eventName, eventArgs);
      mockListeners.forEach(item => expect(item.state).toHaveBeenLastCalledWith(
        unitField.name,
        eventName,
        {
          label: unitField.state.label,
          ...eventArgs,
        },
      ));
    });

    it('should call the listeners', () => {
      const eventName = 'change';
      const eventArgs = 'myNewValue';

      const { formContext, unitField, mockListeners } = setupListener(3);

      formContext.notifyFieldEvent(unitField.name, eventName, eventArgs);
      mockListeners.forEach(item => expect(item.state).toHaveBeenLastCalledWith(
        unitField.name,
        eventName,
        eventArgs,
      ));
    });
  });

  describe('onSubmit handling', () => {
    // @ts-ignore Form submit is private
    const simulateSubmitEvent = async (wrapper: ShallowWrapper): Promise<void> => (wrapper.instance() as Form).submit();

    interface ISetupSubmitArgs extends ISetupArgs {
      addListeners: boolean;
      customField: IMockField;
    }

    interface ISetupSubmitResult extends ISetupResult {
      expectedFormValues: TFieldValues;
      mockFields: IMockField[];
      mockListeners?: IMockListener[];
    }

    const unitFieldName = 'unitField';

    const setupSubmit = async ({
      props,
      customField,
      addListeners = false,
    }: Partial<ISetupSubmitArgs> = {}): Promise<ISetupSubmitResult> => {
      const result = setup({ props });

      const unitField = createMockField(unitFieldName, 'Unit field');
      const unitGroup = createMockField('unitGroup', 'Unit group', true);
      const unitSubField = createMockField(`${unitGroup.name}.subField`, 'Sub field');

      const mockFields = [unitField, unitGroup, unitSubField];
      if (customField) {
        mockFields.push(customField);
      }

      registerUnitField(mockFields, result.formContext);

      let mockListeners;

      if (addListeners) {
        mockListeners = createMockListeners(3);
        mockListeners.forEach(item => result.formContext.registerListener(item.id, item.state));
      }

      await simulateSubmitEvent(result.wrapper);

      const subFieldLocalName = unitSubField.name.substring(unitGroup.name.length + 1);
      const expectedFormValues = {
        [unitField.name]: unitField.state.label,
        [unitGroup.name]: {
          [subFieldLocalName]: unitSubField.state.label,
        },
      };

      return {
        ...result,
        expectedFormValues,
        mockFields,
        mockListeners,
      };
    };

    describe('all valid', () => {
      it('should call all the validation functions', async () => {
        const { mockFields } = await setupSubmit();

        mockFields.forEach(item => expect(item.state.validate).toHaveBeenLastCalledWith({
          checkAsync: true,
          immediateAsync: true,
        }));
      });

      it('should call the onValidate prop', async () => {
        const onValidateHandler = jest.fn().mockReturnValue(null);
        const { expectedFormValues } = await setupSubmit({ props: { onValidate: onValidateHandler }});

        expect(onValidateHandler).toHaveBeenCalledWith(expectedFormValues);
      });

      it('should call the onSubmit prop', async () => {
        const onSubmitHandler = jest.fn();
        const { expectedFormValues } = await setupSubmit({ props: { onSubmit: onSubmitHandler }});

        expect(onSubmitHandler).toHaveBeenCalledWith(expectedFormValues, undefined);
      });
    });

    describe('invalid through form validator', () => {
      const createInvalidValidator = (): jest.Mock => jest.fn().mockReturnValue({
        [unitFieldName]: 'error',
      });

      it('should update the validation state of the field', async () => {
        const { mockFields } = await setupSubmit({ props: { onValidate: createInvalidValidator() }});

        // tslint:disable-next-line:no-non-null-assertion
        expect(mockFields.find(item => item.name === unitFieldName)!.state.updateValidation).toHaveBeenCalledWith({
          valid: false,
          error: {
            message_id: 'error',
            params: { },
          },
        });
      });

      it('should trigger a submit-invalid event', async () => {
        const { mockListeners } = await setupSubmit({ props: { onValidate: createInvalidValidator() }, addListeners: true});
        // tslint:disable-next-line:no-non-null-assertion
        mockListeners!.forEach(item => expect(item.state).toHaveBeenLastCalledWith(
          '_form',
          'submit-invalid',
          undefined,
        ));
      });

      it('should not call the onSubmit prop', async () => {
        const onSubmitHandler = jest.fn();
        await setupSubmit({ props: {
          onValidate: createInvalidValidator(),
          onSubmit: onSubmitHandler,
        }});
        expect(onSubmitHandler).not.toHaveBeenCalled();
      });
    });

    describe('invalid through field validators', () => {
      const createInvalidField = (): IMockField => {
        const field = createMockField('invalidField', 'Invalid field');
        field.state.validate = jest.fn().mockResolvedValue({
          isValidating: false,
          valid: false,
          error: 'foobar',
        });

        return field;
      };

      it('should trigger a submit-invalid event', async () => {
        const { mockListeners } = await setupSubmit({ customField: createInvalidField(), addListeners: true});

        // tslint:disable-next-line:no-non-null-assertion
        mockListeners!.forEach(item => expect(item.state).toHaveBeenLastCalledWith(
          '_form',
          'submit-invalid',
          undefined,
        ));
      });

      it('should not call the onSubmit prop', async () => {
        const onSubmitHandler = jest.fn();
        await setupSubmit({
          props: { onSubmit: onSubmitHandler },
          customField: createInvalidField(),
        });
        expect(onSubmitHandler).not.toHaveBeenCalled();
      });
    });

    describe('context busy state', () => {
      const testBusyState = (wrapper: ShallowWrapper, formContext: IFormContext, expected: boolean, done: jest.DoneCallback): void => {
        simulateSubmitEvent(wrapper);

        process.nextTick(() => {
          wrapper.update();
          expect(formContext.busy).toBe(expected);
          done();
        });
      };

      it('should not be busy if the onSubmit callback returns immediately', (done) => {
        const onSubmitHandler = jest.fn();
        const { wrapper, formContext } = setup({ props: { onSubmit: onSubmitHandler }});
        testBusyState(wrapper, formContext, false, done);
      });

      it('should not be busy if there is no onSubmit callback', (done) => {
        const { wrapper, formContext } = setup();
        testBusyState(wrapper, formContext, false, done);
      });

      describe('async onSubmit callback', () => {
        const createSlowOnSubmit = (): () => Promise<void> => {
          return (): Promise<void> => new Promise(
            (resolve: Function): NodeJS.Timer => setTimeout(
              (): void => { resolve(); },
              1000,
            ),
          );
        };

        beforeAll(() => {
          jest.useFakeTimers();
        });

        afterAll(() => {
          jest.useRealTimers();
        });

        it('should be busy after invoking onSubmit', async (done) => {
          const { wrapper } = setup({ props: { onSubmit: createSlowOnSubmit() }});
          await simulateSubmitEvent(wrapper);

          process.nextTick(() => {
            wrapper.update();
            const formContext: IFormContext = wrapper.first().prop('value');
            expect(formContext.busy).toBe(true);
            done();
          });
        });

        it('should not be busy after onSubmit finished', async (done) => {
          const { wrapper } = setup({ props: { onSubmit: createSlowOnSubmit() }});
          await simulateSubmitEvent(wrapper);

          jest.runAllTimers();

          process.nextTick(() => {
            wrapper.update();
            const formContext: IFormContext = wrapper.first().prop('value');
            expect(formContext.busy).toBe(false);
            done();
          });
        });
      });
    });
  });

  describe('onReset handling', () => {
    const simulateResetEvent = (form: ShallowWrapper): ShallowWrapper => form.simulate('reset', mockEvent());

    it('should reset all fields', () => {
      const { form, formContext } = setup();

      const unitField = createMockField('unitField', 'Unit field');
      const unitGroup = createMockField('unitGroup', 'Unit group', true);
      const unitSubField = createMockField(`${unitGroup.name}.subField`, 'Sub field');
      const mockFields = [unitField, unitGroup, unitSubField];
      registerUnitField(mockFields, formContext);

      simulateResetEvent(form);
      mockFields.forEach(item => expect(item.state.reset).toHaveBeenCalled());
    });

    it('should call the onReset prop', () => {
      const onResetHandler = jest.fn();
      const { form } = setup({ props: { onReset: onResetHandler }});
      simulateResetEvent(form);

      expect(onResetHandler).toHaveBeenCalled();
    });
  });
});
