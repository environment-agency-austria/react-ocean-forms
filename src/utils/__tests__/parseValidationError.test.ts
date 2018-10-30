import { parseValidationError } from '../parseValidationError';

describe('parseValidationError', () => {
  const fieldName = 'fieldname';

  it('should pass an error object right through', () => {
    const error = {
      message_id: 'foobar',
      params: {},
    };
    expect(parseValidationError(fieldName, error)).toBe(error);
  });

  it('should convert a string to a valid error object', () => {
    const error = 'error_id';
    expect(parseValidationError(fieldName, error)).toEqual({
      message_id: error,
      params: {},
    });
  });

  it('should return null if an invalid error was provided', () => {
    const error = { foo: 'bar' };
    // @ts-ignore
    expect(parseValidationError(fieldName, error)).toBeNull();
  });

  it('should return null if an invalid type was provided', () => {
    // @ts-ignore
    expect(parseValidationError(fieldName, 42)).toBeNull();
  });
});
