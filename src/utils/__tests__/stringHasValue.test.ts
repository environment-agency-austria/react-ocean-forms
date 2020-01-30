import { stringHasValue } from '../stringHasValue';

type StringHasValueResult = string | null | undefined;
type TestCase = [string, StringHasValueResult, boolean];

describe('stringHasValue', () => {
  const cases: TestCase[] = [
    ['null', null, false],
    ['undefined', undefined, false],
    ['empty string', '', false],
    ['non empty string', 'This is a test string', true],
  ];

  describe('it should return the correct output', () => {
    it.each(cases)('case %s', (name, input: StringHasValueResult, output: boolean) => {
      expect(stringHasValue(input)).toBe(output);
    });
  });
});
