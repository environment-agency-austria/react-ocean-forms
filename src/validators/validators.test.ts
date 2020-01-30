import { TBasicFieldValue } from '../hooks';
import { createMockFormContext } from '../test-utils/enzymeFormContext';
import { validators } from './validators';
import { FieldErrorMessageId } from './validators.types';

describe('default validators', () => {
  describe('required validator', () => {
    const errorId = FieldErrorMessageId.Required;
    const cases: any[] = [
      [errorId, []],
      [undefined, ['mock']],

      [undefined, 0],
      [undefined, 42],

      [errorId, false],
      [undefined, true],

      [errorId, ''],
      [undefined, 'mock'],

      [errorId, undefined],
      [errorId, null],
      [undefined, {}],
    ];

    it.each(cases)(
      'should return %p if %p is passed',
      (output: string | undefined, input: TBasicFieldValue) => {
        expect(validators.required(input)).toBe(output);
      }
    );
  });

  describe('alphaNumeric validator', () => {
    const errorId = FieldErrorMessageId.AlphaNumeric;
    const cases: any[] = [
      [undefined, []],
      [undefined, ['mock']],

      [undefined, 0],
      [undefined, 42],

      [undefined, false],
      [undefined, true],

      [undefined, ''],
      [undefined, 'abcd'],
      [errorId, '€&§'],

      [undefined, undefined],
      [undefined, null],
      [undefined, {}],
    ];

    it.each(cases)(
      'should return %p if %p is passed',
      (output: string | undefined, input: TBasicFieldValue) => {
        expect(validators.alphaNumeric(input)).toBe(output);
      }
    );
  });

  describe('minLength validator', () => {
    const errorId = FieldErrorMessageId.MinLength;
    const cases: any[] = [
      [errorId, [], 5],
      [undefined, ['mock', 'foo', 'bar', 'baz', 'buzz'], 5],

      [undefined, 0, 5],
      [undefined, 42, 5],

      [undefined, false, 5],
      [undefined, true, 5],

      [errorId, '', 5],
      [undefined, 'abcd', 2],

      [undefined, undefined, 5],
      [undefined, null, 5],
      [undefined, {}, 5],
      [errorId, { length: 2 }, 5],
    ];

    it.each(cases)(
      'should return %p if %p is passed',
      (output: string | undefined, input: TBasicFieldValue, length: number) => {
        const context = createMockFormContext();
        const result = validators.minLength(input, context, [length]);
        if (output === undefined) {
          expect(result).toBeUndefined();
        } else {
          expect(result).toEqual({
            message_id: errorId,
            params: { length: String(length) },
          });
        }
      }
    );
  });

  describe('maxLength validator', () => {
    const errorId = FieldErrorMessageId.MaxLength;
    const cases: any[] = [
      [undefined, [], 5],
      [errorId, ['mock', 'foo', 'bar', 'baz', 'buzz', 'honk'], 5],

      [undefined, 0, 5],
      [undefined, 42, 5],

      [undefined, false, 5],
      [undefined, true, 5],

      [undefined, '', 5],
      [errorId, 'abcd', 2],

      [undefined, undefined, 5],
      [undefined, null, 5],
      [undefined, {}, 5],
      [errorId, { length: 8 }, 5],
    ];

    it.each(cases)(
      'should return %p if %p is passed',
      (output: string | undefined, input: TBasicFieldValue, length: number) => {
        const context = createMockFormContext();
        const result = validators.maxLength(input, context, [length]);
        if (output === undefined) {
          expect(result).toBeUndefined();
        } else {
          expect(result).toEqual({
            message_id: errorId,
            params: { length: String(length) },
          });
        }
      }
    );
  });

  const withUtilityCases: any[] = [
    ['withParam', validators.withParam],
    ['withAsyncParam', validators.withAsyncParam],
  ];
  describe.each(withUtilityCases)(
    '%s utility',
    (name: string, utility: (first: Function, ...args: unknown[]) => Function) => {
      const testValidator = jest.fn();
      const param1 = '123';
      const param2 = 456;
      const value = 'abcd';
      const context = createMockFormContext();

      const func = utility(testValidator, param1, param2);

      it('should call the validator', () => {
        func(value, context);
        expect(testValidator).toBeCalled();
      });

      it('should pass all parameters to the validator', () => {
        func(value, context);
        expect(testValidator).toBeCalledWith(value, context, [param1, param2]);
      });
    }
  );
});
