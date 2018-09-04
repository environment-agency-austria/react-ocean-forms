import { TEST_MESSAGES, addCustomMessages, stringFormatter } from '../stringFormatter';

describe('stringFormatter', () => {
  const cases = [
    ['Object', { foo: 'bar' }],
    ['Number', 12345],
    ['Array', [1, 2, 3, 4, 5]],
    ['Function', jest.fn()],
  ];

  describe('it should ignore invalid messages', () => {
    test.each(cases)('case %s', (name, value) => {
      expect(stringFormatter(value)).toBe(value);
    });
  });

  it('should read from the DEFAULT_MESSAGES', () => {
    const key = Object.keys(TEST_MESSAGES)[0];
    expect(stringFormatter(key)).toBe(TEST_MESSAGES[key]);
  });

  it('should support parameters', () => {
    expect(stringFormatter('ojs_error_minLength', { length: 5 }))
      .toBe('The value must be at least 5 characters long.');
  });

  it('should return unknown strings as-is', () => {
    const string = 'foobar';
    expect(stringFormatter(string)).toBe(string);
  });

  it('should support parameters on unknown strings', () => {
    const string = 'foo: {bar}';
    expect(stringFormatter(string, { bar: 'baz' }))
      .toBe('foo: baz');
  });

  describe('it should ignore invalid parameters', () => {
    const subCases = cases.splice(1);
    test.each(subCases)('case %s', (name, value) => {
      const string = 'foobar';
      expect(stringFormatter(string, value)).toBe(string);
    });
  });

  it('should support custom messages', () => {
    const key = 'unitMessage';
    const string = 'hey unit!';
    addCustomMessages({ [key]: string });
    expect(stringFormatter(key)).toBe(string);
  });
});
