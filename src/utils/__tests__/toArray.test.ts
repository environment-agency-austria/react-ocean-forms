import { toArray } from '../toArray';

describe('toArray', () => {
  it('should wrap anything into an array', () => {
    expect(toArray('foo')).toEqual(['foo']);
  });

  it('should leave arrays alone', () => {
    const mockArray = [1, 2, 3, 4, 5];
    expect(toArray(mockArray)).toBe(mockArray);
  });
});
