import { renderHook, cleanup } from 'react-hooks-testing-library';
import { useFullName } from './useFullName';
import { useFormContext } from '../useFormContext';

jest.mock('../useFormContext');
afterEach(cleanup);

describe('useFullName', () => {
  it('should return the raw name if formContext.fieldPrefix is null', () => {
    (useFormContext as jest.Mock).mockReturnValueOnce({
      fieldPrefix: null,
    });

    const mockName = 'mock-name';
    const { result } = renderHook(() => useFullName(mockName));

    expect(result.current).toBe(mockName);
  });

  it('should prefix the raw name with formContext.fieldPrefix if existing', () => {
    const mockPrefix = 'mockPrefix';
    (useFormContext as jest.Mock).mockReturnValueOnce({
      fieldPrefix: mockPrefix,
    });

    const mockName = 'mock-name';
    const { result } = renderHook(() => useFullName(mockName));

    expect(result.current).toBe(`${mockPrefix}.${mockName}`);
  });
});
