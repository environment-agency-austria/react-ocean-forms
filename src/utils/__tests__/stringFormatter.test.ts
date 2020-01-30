import {
  addCustomMessages,
  IMessageValues,
  stringFormatter,
  TEST_MESSAGES,
} from '../stringFormatter';

describe('stringFormatter', () => {
  const cases: [string, any][] = [
    ['Object', { foo: 'bar' }],
    ['Number', 12345],
    ['Array', [1, 2, 3, 4, 5]],
    ['Function', jest.fn()],
  ];

  describe('it should ignore invalid messages', () => {
    test.each(cases)('case %s', (name, value: string) => {
      expect(stringFormatter(value)).toBe(value);
    });
  });

  it('should read from the DEFAULT_MESSAGES', () => {
    const key = Object.keys(TEST_MESSAGES)[0];
    expect(stringFormatter(key)).toBe(TEST_MESSAGES[key]);
  });

  it('should support parameters', () => {
    expect(stringFormatter('ojs_error_minLength', { length: '5' })).toBe(
      'The value must be at least 5 characters long.'
    );
  });

  it('should return unknown strings as-is', () => {
    const testString = 'foobar';
    expect(stringFormatter(testString)).toBe(testString);
  });

  it('should support parameters on unknown strings', () => {
    const testString = 'foo: {bar}';
    expect(stringFormatter(testString, { bar: 'baz' })).toBe('foo: baz');
  });

  describe('it should ignore invalid parameters', () => {
    const subCases = cases.splice(1);
    test.each(subCases)('case %s', (name, value: IMessageValues) => {
      const testString = 'foobar';
      expect(stringFormatter(testString, value)).toBe(testString);
    });
  });

  it('should support custom messages', () => {
    const key = 'unitMessage';
    const testString = 'hey unit!';
    addCustomMessages({ [key]: testString });
    expect(stringFormatter(key)).toBe(testString);
  });
});
