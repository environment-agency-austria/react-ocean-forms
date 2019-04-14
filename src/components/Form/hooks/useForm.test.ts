import { renderHook, cleanup, act } from 'react-hooks-testing-library';

import { IFormProps } from '../Form.types';
import { IFormContext, IFieldState, IFieldValues } from '../../FormContext';

import { useForm } from './useForm';
import { useFieldEvents, IUseFieldEventsResult } from '../../../hooks/internal';

jest.mock('../../../hooks/internal');
afterEach(cleanup);

describe('useForm', () => {
  interface ISetupArgs {
    props?: IFormProps;
  }

  interface IMockResult {
    current: IFormContext;
  }

  interface ISetupResult {
    result: IMockResult;
    fieldEventResult: IUseFieldEventsResult;
  }

  const setup = ({ props = { } }: Partial<ISetupArgs> = {}): ISetupResult => {
    const fieldEventResult: IUseFieldEventsResult = {
      notifyListeners: jest.fn(),
      registerListener: jest.fn(),
      unregisterListener: jest.fn(),
    };
    (useFieldEvents as jest.Mock).mockReturnValue(fieldEventResult);

    return {
      fieldEventResult,
      ...renderHook(() => useForm(props)),
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
    fields.forEach(field => {
      formContext.registerField(field.name, field.state);
    });
  };

  it('should create a valid form context', () => {
    const { result } = setup();
    expect(result.current).toMatchObject({
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
    const cases: any[] = [
      ['disabled', true, 'disabled'],
      ['formatString', jest.fn(), 'stringFormatter'],
      ['asyncValidateOnChange', true, 'asyncValidateOnChange'],
      ['asyncValidationWait', 800, 'asyncValidationWait'],
      ['defaultValues', { foo: 'bar' }, 'defaultValues'],
      ['values', { foo: 'bar' }, 'values'],
      ['plaintext', true, 'plaintext'],
    ];

    test.each(cases)('case %s', (prop, value, contextProp) => {
      const { result } = setup({
        props: { [prop]: value },
      });
      expect(result.current).toMatchObject({ [contextProp]: value });
    });
  });

  describe('invalid field registration', () => {
    const mf = (): void => {};
    const cases: any[] = [
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

    test.each(cases)('case %s', (testName: string, fieldName: string, fieldState: IFieldState) => {
      const { result } = setup();
      expect(() => {
        result.current.registerField(fieldName, fieldState);
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('field states and values', () => {
    const createCases = (): [string, IMockField, boolean?][] => {
      return [
        ['field', createMockField('unitField', 'Unit field')],
        ['group', createMockField('unitGroup', 'Unit group', true)],
        ['sub field', createMockField('unitGroup.subField', 'Sub field', true)],
      ];
    };

    describe('formContext.registerField - field registration', () => {
      const cases = createCases();

      test.each(cases)('should register a new %s without crashing', (testName, field: IMockField) => {
        const { result } = setup();
        expect(() => {
          registerUnitField([field], result.current);
        }).not.toThrowError();
      });
    });

    describe('formContext.unregisterField - field cleanup', () => {
      const cases = createCases();

      test.each(cases)('should unregister %s without crashing', (testName, field: IMockField) => {
        const { result } = setup();
        result.current.registerField(field.name, field.state);
        result.current.unregisterField(field.name);
      });
    });

    describe('formContext.getFieldState - field states', () => {
      const cases = createCases();

      test.each(cases)('should return the correct field state of a %s', (testName, field: IMockField) => {
        const { result } = setup();
        registerUnitField([field], result.current);
        expect(result.current.getFieldState(field.name)).toBe(field.state);
      });

      it('should throw an error when trying to access an non-existing field state', () => {
        const { result } = setup();
        const mockFieldName = 'mock-test';

        expect(
          () => result.current.getFieldState(mockFieldName),
        ).toThrowError(`[Form] getFieldState: Could not find state of field '${mockFieldName}'`);
      });
    });

    describe('formContext.getValues - form values', () => {
      const { result } = setup();

      const unitField = createMockField('unitField', 'Unit field');
      const unitGroup = createMockField('unitGroup', 'Unit group', true);
      const unitSubField = createMockField(`${unitGroup.name}.subField`, 'Sub field');
      const unitSubField2 = createMockField(`${unitGroup.name}.subField2`, 'Sub field 2');

      const mockFields = [unitField, unitGroup, unitSubField, unitSubField2];
      registerUnitField(mockFields, result.current);

      let formValues: IFieldValues;
      it('should return the values without crashing', () => {
        expect(() => {
          formValues = result.current.getValues();
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
        const subFieldLocalName2 = unitSubField2.name.substring(unitGroup.name.length + 1);

        const expectedFormValues = {
          [unitField.name]: unitField.state.label,
          [unitGroup.name]: {
            [subFieldLocalName]: unitSubField.state.label,
            [subFieldLocalName2]: unitSubField2.state.label,
          },
        };

        expect(formValues).toMatchObject(expectedFormValues);
      });
    });
  });

  describe('onSubmit handling', () => {
    const simulateSubmitEvent = async (context: IFormContext): Promise<void> => {
      return act(async () => {
        await context.submit();
      });
    };

    interface ISetupSubmitArgs extends ISetupArgs {
      customField: IMockField;
    }

    interface ISetupSubmitResult extends ISetupResult {
      expectedFormValues: IFieldValues;
      mockFields: IMockField[];
    }

    const unitFieldName = 'unitField';

    const setupSubmit = async ({ props, customField, }: Partial<ISetupSubmitArgs> = {}): Promise<ISetupSubmitResult> => {
      const result = setup({ props });

      const unitField = createMockField(unitFieldName, 'Unit field');
      const unitGroup = createMockField('unitGroup', 'Unit group', true);
      const unitSubField = createMockField(`${unitGroup.name}.subField`, 'Sub field');

      const mockFields = [unitField, unitGroup, unitSubField];
      if (customField) {
        mockFields.push(customField);
      }

      registerUnitField(mockFields, result.result.current);

      await simulateSubmitEvent(result.result.current);

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

      describe('onValidate handler that returns valid field states', () => {
        it('should call the onSubmit prop', async () => {
          const onValidateHandler = jest.fn().mockReturnValue({
            unitField: undefined,
          });
          const onSubmitHandler = jest.fn();
          const { expectedFormValues } = await setupSubmit({ props: { onValidate: onValidateHandler, onSubmit: onSubmitHandler }});

          expect(onSubmitHandler).toHaveBeenCalledWith(expectedFormValues, undefined);
        });
      });
    });

    describe('invalid through form validator', () => {
      const createInvalidValidator = (): jest.Mock => jest.fn().mockReturnValue({
        [unitFieldName]: 'error',
      });

      it('should update the validation state of the field', async () => {
        const { mockFields } = await setupSubmit({ props: { onValidate: createInvalidValidator() }});

        mockFields.forEach(item => {
          if (item.name !== unitFieldName) { return; }
          expect(item.state.updateValidation).toHaveBeenCalledWith({
            valid: false,
            error: {
              message_id: 'error',
              params: { },
            },
          });
        });
      });

      it('should trigger a submit-invalid event', async () => {
        const { fieldEventResult } = await setupSubmit({ props: { onValidate: createInvalidValidator() } });
        expect(fieldEventResult.notifyListeners).toHaveBeenCalledWith('_form', 'submit-invalid');
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
        const { fieldEventResult } = await setupSubmit({ customField: createInvalidField() });
        expect(fieldEventResult.notifyListeners).toHaveBeenCalledWith('_form', 'submit-invalid');
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
      const testBusyState = async (result: IMockResult, expected: boolean): Promise<void> => {
        await simulateSubmitEvent(result.current);
        expect(result.current.busy).toBe(expected);
      };

      it('should not be busy if the onSubmit callback returns immediately', async () => {
        const onSubmitHandler = jest.fn();
        const { result } = setup({ props: { onSubmit: onSubmitHandler }});
        await testBusyState(result, false);
      });

      it('should not be busy if there is no onSubmit callback', async () => {
        const { result } = setup();
        await testBusyState(result, false);
      });

      describe('busy prop override set to true', () => {
        it('should be always busy', () => {
          const { result } = setup({ props: { busy: true }});
          expect(result.current.busy).toBeTruthy();
        });

        it('should be busy if the onSubmit callback returns immediately', async () => {
          const onSubmitHandler = jest.fn();
          const { result } = setup({ props: { onSubmit: onSubmitHandler, busy: true }});
          await testBusyState(result, true);
        });

        it('should be busy if there is no onSubmit callback', async () => {
          const { result } = setup({ props: { busy: true }});
          await testBusyState(result, true);
        });
      });

      describe('async onSubmit callback', () => {
        const createSlowOnSubmit = (): () => Promise<void> => {
          return async (): Promise<void> => new Promise<void>(
            (resolve: Function) => setTimeout(
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

        it('should be busy after invoking onSubmit', async () => {
          const { result } = setup({ props: { onSubmit: createSlowOnSubmit() }});
          await simulateSubmitEvent(result.current);

          expect(result.current.busy).toBe(true);
        });

        it('should not be busy after onSubmit finished', async () => {
          const { result } = setup({ props: { onSubmit: createSlowOnSubmit() }});
          await simulateSubmitEvent(result.current);

          await act(async () => {
            jest.runAllTimers();
          });

          expect(result.current.busy).toBe(false);
        });

        it('should be busy after onSubmit finished if the busy prop is set to true', async () => {
          const { result } = setup({ props: { onSubmit: createSlowOnSubmit(), busy: true }});
          await simulateSubmitEvent(result.current);

          await act(async () => {
            jest.runAllTimers();
          });

          expect(result.current.busy).toBe(true);
        });
      });
    });

    describe('reset on successful submit', () => {
      it('should call the onReset prop on submit when resetOnSubmit is true', async () => {
        const onResetHandler = jest.fn();
        const { result } = setup({ props: { onReset: onResetHandler, resetOnSubmit: true }});
        await simulateSubmitEvent(result.current);

        expect(onResetHandler).toHaveBeenCalled();
      });
    });
  });

  describe('onReset handling', () => {
    const simulateResetEvent = (formContext: IFormContext): void => {
      act(() => {
        formContext.reset();
      });
    };

    it('should reset all fields', () => {
      const { result } = setup();

      const unitField = createMockField('unitField', 'Unit field');
      const unitGroup = createMockField('unitGroup', 'Unit group', true);
      const unitSubField = createMockField(`${unitGroup.name}.subField`, 'Sub field');
      const mockFields = [unitField, unitGroup, unitSubField];
      registerUnitField(mockFields, result.current);

      simulateResetEvent(result.current);
      mockFields.forEach(item => expect(item.state.reset).toHaveBeenCalled());
    });

    it('should call the onReset prop', () => {
      const onResetHandler = jest.fn();
      const { result } = setup({ props: { onReset: onResetHandler }});
      simulateResetEvent(result.current);

      expect(onResetHandler).toHaveBeenCalled();
    });
  });
});
