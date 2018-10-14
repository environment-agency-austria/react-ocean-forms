import { getDeepValue } from '../getDeepValue';

describe('getDeepValue', () => {
  it('should return the correct member of the object', () => {
    const mockObject = {
      mockProp: 'mock',
    };
    expect(getDeepValue('mockProp', mockObject)).toBe('mock');
  });

  it('should work with deep nesting as well', () => {
    const mockObject = {
      nested: {
        nested: {
          nested: {
            mockProp: 'mock',
          },
        },
      },
    };
    expect(getDeepValue('nested.nested.nested.mockProp', mockObject)).toBe('mock');
  });

  it('should return undefined if the property does not exist', () => {
    const mockObject = {
      foo: 'bar',
    };
    expect(getDeepValue('baz', mockObject)).toBeUndefined();
  });

  it('should return undefined if the property is null', () => {
    const mockObject = {
      mockProp: null,
    };
    expect(getDeepValue('mockProp', mockObject)).toBeUndefined();
  });

  it('should return undefined if a member in the path is undefined', () => {
    const mockObject = {
      nested: {
        nested: {
          foo: 'bar',
        },
      },
    };
    expect(getDeepValue('nested.mockProp.foo', mockObject)).toBeUndefined();
  });

  it('should return undefined if the passed object is undefined', () => {
    expect(getDeepValue('foo', undefined)).toBeUndefined();
  });
});
