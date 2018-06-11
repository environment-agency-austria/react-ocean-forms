import validators from '../validators';

describe('default validators', () => {
  describe('required validator', () => {
    const ERROR_ID = 'ojs_error_required';

    it('should return undefined if a value is passed', () => {
      expect(validators.required(42)).toBeUndefined();
    });

    it('should return an error if undefined is passed', () => {
      expect(validators.required()).toBe(ERROR_ID);
    });

    it('should return an error if null is passed', () => {
      expect(validators.required(null)).toBe(ERROR_ID);
    });

    it('should return an error if an empty array is passed', () => {
      expect(validators.required([])).toBe(ERROR_ID);
    });

    it('should return an error if an empty string is passed', () => {
      expect(validators.required('')).toBe(ERROR_ID);
    });

    it('should return undefined if 0 is passed', () => {
      expect(validators.required(0)).toBeUndefined();
    });
  });

  describe('alphaNumeric validator', () => {
    const ERROR_ID = 'ojs_error_alphaNumeric';

    it('should return undefined if a alpha numeric string is passed', () => {
      expect(validators.alphaNumeric('abcd')).toBeUndefined();
    });

    it('should return an error if special charcters are passed', () => {
      expect(validators.alphaNumeric('€&§')).toBe(ERROR_ID);
    });

    it.skip('should work with öäüß', () => {
      expect(validators.alphaNumeric('öäüß')).toBeUndefined();
    });

    it.skip('should work with arabic letters', () => {
      expect(validators.alphaNumeric('الصفحة الرئيسية')).toBeUndefined();
    });
  });

  describe('minLength validator', () => {
    const TEST_STRING = 'abcd';
    const ERROR_ID = 'ojs_error_minLength';

    it('should return undefined if the length is exceeded', () => {
      expect(validators.minLength(TEST_STRING, null, [2])).toBeUndefined();
    });

    it('should return an error if the length is not exceeded', () => {
      const MIN_LENGTH = 5;
      expect(validators.minLength(TEST_STRING, null, [MIN_LENGTH])).toEqual({
        message_id: ERROR_ID,
        params: { length: String(MIN_LENGTH) },
      });
    });
  });

  describe('maxLength validator', () => {
    const TEST_STRING = 'abcd';
    const ERROR_ID = 'ojs_error_maxLength';

    it('should return undefined if the length is not exceeded', () => {
      expect(validators.maxLength(TEST_STRING, null, [5])).toBeUndefined();
    });

    it('should return an error if the length is exceeded', () => {
      const MIN_LENGTH = 2;
      expect(validators.maxLength(TEST_STRING, null, [MIN_LENGTH])).toEqual({
        message_id: ERROR_ID,
        params: { length: String(MIN_LENGTH) },
      });
    });
  });

  describe('withParam utility', () => {
    const testValidator = jest.fn();
    const param1 = '123';
    const param2 = 456;
    const value = 'abcd';
    const mockContext = { form: true };

    const func = validators.withParam(testValidator, param1, param2);

    it('should call the validator', () => {
      func(value, mockContext);
      expect(testValidator).toBeCalled();
    });

    it('should pass all parameters to the validator', () => {
      func(value, mockContext);
      expect(testValidator).toBeCalledWith(value, mockContext, [param1, param2]);
    });
  });
});
