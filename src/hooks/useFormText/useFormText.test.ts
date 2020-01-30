import { renderHook } from '@testing-library/react-hooks';

import { IMessageValues } from '../../utils';
import { useFormContext } from '../useFormContext';
import { useFormText } from './useFormText';

jest.mock('../useFormContext');

interface ISetupResult {
  stringFormatter: jest.Mock;
  messageId: string;
  values: IMessageValues;
  rerender(): void;
  unmount(): boolean;
}

function setup(): ISetupResult {
  const stringFormatter = jest.fn();

  (useFormContext as jest.Mock).mockReturnValue({
    stringFormatter,
  });

  const messageId = 'mock-message-id';
  const values = { foo: 'bar' };

  const { rerender, unmount } = renderHook(() => useFormText(messageId, values));

  return {
    stringFormatter,
    messageId,
    values,
    rerender,
    unmount,
  };
}

describe('useFormText', () => {
  it('should call formContext.stringFormatter with the correct values', () => {
    const { stringFormatter, messageId, values } = setup();

    expect(stringFormatter).toHaveBeenCalledTimes(1);
    expect(stringFormatter).toHaveBeenCalledWith(messageId, values);
  });
});
