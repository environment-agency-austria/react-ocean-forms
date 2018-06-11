import parseValidationError from '../parseValidationError';

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

  it('should return undefined when called without parameters', () => {
    expect(parseValidationError(fieldName)).toBeUndefined();
  });

  it('should return undefined and log an error when an unexpected input is provided', () => {
    console.error = jest.fn();
    expect(parseValidationError(fieldName, 42)).toBeUndefined();
    expect(console.error).toBeCalled();
  });

  it('should return undefined if the error object is invalid', () => {
    expect(parseValidationError(fieldName, { foo: 'bar' })).toBeUndefined();
  });
});
