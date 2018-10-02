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
});
