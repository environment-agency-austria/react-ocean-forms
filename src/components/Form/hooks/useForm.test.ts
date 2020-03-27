import { renderHook, act } from '@testing-library/react-hooks';

import { IFormProps } from '../Form.types';
import { IFormContext, IFieldValues } from '../../FormContext';

import { useForm } from './useForm';
import {
  useFieldEvents,
  IUseFieldEventsResult,
  IUseFieldStatesResult,
  useFieldStates,
  IFieldState,
} from '../../../hooks/internal';

// Only mock parts of the internal hooks, as
// some of them are needed for useForm to function
// properly inside the unit tests (useIsUnmounted)
jest.mock('../../../hooks/internal', () => {
  const originalModule = jest.requireActual('../../../hooks/internal');

  return {
    __esModule: true,
    ...originalModule,
    useFieldEvents: jest.fn(),
    useFieldStates: jest.fn(),
  };
});

describe('useForm', () => {
  interface ISetupArgs {
    props?: IFormProps;
    fieldStatesOverride?: Partial<IUseFieldStatesResult>;
  }

  interface IMockResult {
    current: IFormContext;
  }

  interface ISetupResult {
    result: IMockResult;
    fieldEventResult: IUseFieldEventsResult;
    fieldStatesResult: IUseFieldStatesResult;
  }

  const setup = ({ props = {}, fieldStatesOverride }: Partial<ISetupArgs> = {}): ISetupResult => {
    const fieldEventResult: IUseFieldEventsResult = {
      notifyListeners: jest.fn(),
      registerListener: jest.fn(),
      unregisterListener: jest.fn(),
    };
    (useFieldEvents as jest.Mock).mockReturnValue(fieldEventResult);

    const fieldStatesResult: IUseFieldStatesResult = {
      registerField: jest.fn(),
      unregisterField: jest.fn(),
      getFieldState: jest.fn(),
      forEachFieldState: jest.fn(),
      ...fieldStatesOverride,
    };
    (useFieldStates as jest.Mock).mockReturnValue(fieldStatesResult);

    return {
      fieldEventResult,
      fieldStatesResult,
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

  describe('formContext.getValues - form values', () => {
    const unitField = createMockField('unitField', 'Unit field');
    const unitGroup = createMockField('unitGroup', 'Unit group', true);
    const unitSubField = createMockField(`${unitGroup.name}.subField`, 'Sub field');
    const unitSubField2 = createMockField(`${unitGroup.name}.subField2`, 'Sub field 2');

    const mockFields = new Map<string, IFieldState>([
      [unitField.name, unitField.state],
      [unitGroup.name, unitGroup.state],
      [unitSubField.name, unitSubField.state],
      [unitSubField2.name, unitSubField2.state],
    ]);

    const forEachFieldState = jest.fn().mockImplementation((cb) => {
      mockFields.forEach(cb);
    });
    const { result } = setup({ fieldStatesOverride: { forEachFieldState } });

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
      mockFields: Map<string, IFieldState>;
    }

    const unitFieldName = 'unitField';

    const setupSubmit = async ({ props, customField }: Partial<ISetupSubmitArgs> = {}): Promise<
      ISetupSubmitResult
    > => {
      const unitField = createMockField(unitFieldName, 'Unit field');
      const unitGroup = createMockField('unitGroup', 'Unit group', true);
      const unitSubField = createMockField(`${unitGroup.name}.subField`, 'Sub field');

      const mockFields = new Map<string, IFieldState>([
        [unitField.name, unitField.state],
        [unitGroup.name, unitGroup.state],
        [unitSubField.name, unitSubField.state],
      ]);

      if (customField) {
        mockFields.set(customField.name, customField.state);
      }

      const forEachFieldState = jest.fn().mockImplementation((cb) => {
        mockFields.forEach(cb);
      });

      const result = setup({ props, fieldStatesOverride: { forEachFieldState } });

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

        mockFields.forEach((item) =>
          expect(item.validate).toHaveBeenLastCalledWith({
            checkAsync: true,
            immediateAsync: true,
          })
        );
      });

      it('should call the onValidate prop', async () => {
        const onValidateHandler = jest.fn().mockReturnValue(null);
        const { expectedFormValues } = await setupSubmit({
          props: { onValidate: onValidateHandler },
        });

        expect(onValidateHandler).toHaveBeenCalledWith(expectedFormValues);
      });

      it('should call the onSubmit prop', async () => {
        const onSubmitHandler = jest.fn();
        const { expectedFormValues } = await setupSubmit({ props: { onSubmit: onSubmitHandler } });

        expect(onSubmitHandler).toHaveBeenCalledWith(expectedFormValues, undefined);
      });

      describe('onValidate handler that returns valid field states', () => {
        it('should call the onSubmit prop', async () => {
          const onValidateHandler = jest.fn().mockReturnValue({
            unitField: undefined,
          });
          const onSubmitHandler = jest.fn();
          const { expectedFormValues } = await setupSubmit({
            props: { onValidate: onValidateHandler, onSubmit: onSubmitHandler },
          });

          expect(onSubmitHandler).toHaveBeenCalledWith(expectedFormValues, undefined);
        });
      });
    });

    describe('invalid through form validator', () => {
      const createInvalidValidator = (): jest.Mock =>
        jest.fn().mockReturnValue({
          [unitFieldName]: 'error',
        });

      it('should update the validation state of the field', async () => {
        const { mockFields } = await setupSubmit({
          props: { onValidate: createInvalidValidator() },
        });

        mockFields.forEach((item, name) => {
          if (name !== unitFieldName) {
            return;
          }
          expect(item.updateValidation).toHaveBeenCalledWith({
            valid: false,
            error: {
              message_id: 'error',
              params: {},
            },
          });
        });
      });

      it('should trigger a submit-invalid event', async () => {
        const { fieldEventResult } = await setupSubmit({
          props: { onValidate: createInvalidValidator() },
        });
        expect(fieldEventResult.notifyListeners).toHaveBeenCalledWith('_form', 'submit-invalid');
      });

      it('should not call the onSubmit prop', async () => {
        const onSubmitHandler = jest.fn();
        await setupSubmit({
          props: {
            onValidate: createInvalidValidator(),
            onSubmit: onSubmitHandler,
          },
        });
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
        const { result } = setup({ props: { onSubmit: onSubmitHandler } });
        await testBusyState(result, false);
      });

      it('should not be busy if there is no onSubmit callback', async () => {
        const { result } = setup();
        await testBusyState(result, false);
      });

      describe('busy prop override set to true', () => {
        it('should be always busy', () => {
          const { result } = setup({ props: { busy: true } });
          expect(result.current.busy).toBeTruthy();
        });

        it('should be busy if the onSubmit callback returns immediately', async () => {
          const onSubmitHandler = jest.fn();
          const { result } = setup({ props: { onSubmit: onSubmitHandler, busy: true } });
          await testBusyState(result, true);
        });

        it('should be busy if there is no onSubmit callback', async () => {
          const { result } = setup({ props: { busy: true } });
          await testBusyState(result, true);
        });
      });

      describe('async onSubmit callback', () => {
        const createSlowOnSubmit = (): (() => Promise<void>) => {
          return async (): Promise<void> =>
            new Promise<void>((resolve: Function) =>
              setTimeout((): void => {
                resolve();
              }, 1000)
            );
        };

        beforeAll(() => {
          jest.useFakeTimers();
        });

        afterAll(() => {
          jest.useRealTimers();
        });

        it('should be busy after invoking onSubmit', async () => {
          const { result } = setup({ props: { onSubmit: createSlowOnSubmit() } });
          await simulateSubmitEvent(result.current);

          expect(result.current.busy).toBe(true);
        });

        it('should not be busy after onSubmit finished', async () => {
          const { result } = setup({ props: { onSubmit: createSlowOnSubmit() } });
          await simulateSubmitEvent(result.current);

          await act(async () => {
            jest.runAllTimers();
          });

          expect(result.current.busy).toBe(false);
        });

        it('should be busy after onSubmit finished if the busy prop is set to true', async () => {
          const { result } = setup({ props: { onSubmit: createSlowOnSubmit(), busy: true } });
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
        const { result } = setup({ props: { onReset: onResetHandler, resetOnSubmit: true } });
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
      const unitField = createMockField('unitField', 'Unit field');
      const unitGroup = createMockField('unitGroup', 'Unit group', true);
      const unitSubField = createMockField(`${unitGroup.name}.subField`, 'Sub field');
      const mockFields = new Map<string, IFieldState>([
        [unitField.name, unitField.state],
        [unitGroup.name, unitGroup.state],
        [unitSubField.name, unitSubField.state],
      ]);

      const forEachFieldState = jest.fn().mockImplementation((cb) => {
        mockFields.forEach(cb);
      });

      const { result } = setup({ fieldStatesOverride: { forEachFieldState } });

      simulateResetEvent(result.current);
      mockFields.forEach((item) => expect(item.reset).toHaveBeenCalled());
    });

    it('should call the onReset prop', () => {
      const onResetHandler = jest.fn();
      const { result } = setup({ props: { onReset: onResetHandler } });
      simulateResetEvent(result.current);

      expect(onResetHandler).toHaveBeenCalled();
    });
  });
});
