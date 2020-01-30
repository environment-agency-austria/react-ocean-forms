import { renderHook } from '@testing-library/react-hooks';

import { useFieldStates, IFieldState, IUseFieldStatesResult } from './useFieldStates';

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

describe('useFieldStates', () => {
  interface ISetupResult {
    result: {
      current: IUseFieldStatesResult;
    };
  }

  const setup = (): ISetupResult => renderHook(useFieldStates);

  it('should return the correct result', () => {
    const { result } = setup();

    expect(result.current).toMatchObject({
      getFieldState: expect.any(Function),
      registerField: expect.any(Function),
      unregisterField: expect.any(Function),
      forEachFieldState: expect.any(Function),
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
      [
        '4 of 5 props',
        'foo',
        {
          label: 'hey',
          validate: mf,
          updateValidation: mf,
          reset: mf,
        },
      ],
    ];

    test.each(cases)('case %s', (testName: string, fieldName: string, fieldState: IFieldState) => {
      const { result } = setup();
      expect(() => {
        result.current.registerField(fieldName, fieldState);
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('field registration and values', () => {
    const createCases = (): [string, IMockField, boolean?][] => {
      return [
        ['field', createMockField('unitField', 'Unit field')],
        ['group', createMockField('unitGroup', 'Unit group', true)],
        ['sub field', createMockField('unitGroup.subField', 'Sub field', true)],
      ];
    };

    describe('registerField - field registration', () => {
      const cases = createCases();

      test.each(cases)(
        'should register a new %s without crashing',
        (testName, field: IMockField) => {
          const { result } = setup();
          expect(() => {
            result.current.registerField(field.name, field.state);
          }).not.toThrowError();
        }
      );

      it('should throw an error if a field with the given name is already registered', () => {
        const { result } = setup();

        const mockName = 'doubleField';
        const { state: mockState } = createMockField(mockName, mockName);

        result.current.registerField(mockName, mockState);

        expect(() => {
          result.current.registerField(mockName, mockState);
        }).toThrowErrorMatchingSnapshot();
      });
    });

    describe('unregisterField - field cleanup', () => {
      const cases = createCases();

      test.each(cases)('should unregister %s without crashing', (testName, field: IMockField) => {
        const { result } = setup();
        result.current.registerField(field.name, field.state);
        result.current.unregisterField(field.name);
      });
    });

    describe('getFieldState - field states', () => {
      const cases = createCases();

      test.each(cases)(
        'should return the correct field state of a %s',
        (testName, field: IMockField) => {
          const { result } = setup();
          result.current.registerField(field.name, field.state);
          expect(result.current.getFieldState(field.name)).toBe(field.state);
        }
      );

      it('should throw an error when trying to access an non-existing field state', () => {
        const { result } = setup();
        const mockFieldName = 'mock-test';

        expect(() => result.current.getFieldState(mockFieldName)).toThrowError(
          `[Form] getFieldState: Could not find state of field '${mockFieldName}'`
        );
      });
    });

    it('forEachFieldState - should correctly iterate through the field states', () => {
      const { result } = setup();

      const field = createMockField('unitField', 'Unit field');
      result.current.registerField(field.name, field.state);

      const group = createMockField('unitGroup', 'Unit group', true);
      result.current.registerField(group.name, group.state);

      const subField = createMockField('unitGroup.subField', 'Sub field', true);
      result.current.registerField(subField.name, subField.state);

      const forEachCallback = jest.fn();
      result.current.forEachFieldState(forEachCallback);

      expect(forEachCallback).toHaveBeenCalledTimes(3);
      expect(forEachCallback).toHaveBeenNthCalledWith(
        1,
        field.state,
        field.name,
        expect.anything()
      );
      expect(forEachCallback).toHaveBeenNthCalledWith(
        2,
        group.state,
        group.name,
        expect.anything()
      );
      expect(forEachCallback).toHaveBeenNthCalledWith(
        3,
        subField.state,
        subField.name,
        expect.anything()
      );
    });
  });
});
