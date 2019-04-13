import { parseValidationError } from '../parseValidationError';

describe('parseValidationError', () => {
  it('should pass an error object right through', () => {
    const error = {
      message_id: 'foobar',
      params: {},
    };
    expect(parseValidationError(error)).toBe(error);
  });

  it('should convert a string to a valid error object', () => {
    const error = 'error_id';
    expect(parseValidationError(error)).toEqual({
      message_id: error,
      params: {},
    });
  });

  it('should return null if an invalid error was provided', () => {
    const error = { foo: 'bar' };
    // @ts-ignore
    expect(parseValidationError(error)).toBeNull();
  });

  it('should return null if an invalid type was provided', () => {
    // @ts-ignore
    expect(parseValidationError(42)).toBeNull();
  });
});
