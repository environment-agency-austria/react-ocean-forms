import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { useFormContext } from '../../hooks';
import { FieldError } from './FieldError';
import { IFieldErrorProps } from './FieldError.types';

jest.mock('../../hooks');

describe('<FieldError />', () => {
  const mockStringFormatter = jest.fn().mockReturnValue('string');
  (useFormContext as jest.Mock).mockReturnValue({ stringFormatter: mockStringFormatter });
  const setup = (props?: Partial<IFieldErrorProps>): ShallowWrapper =>
    shallow(<FieldError id="unitError" invalid={false} error={null} {...props} />);

  it('should do nothing if invalid is false', () => {
    const wrapper = setup({ invalid: false });
    expect(wrapper).toMatchSnapshot();
  });

  const errorId = 'foo';
  const errorParams = { foo: 'bar' };

  it('should render an error', () => {
    const wrapper = setup({
      invalid: true,
      error: {
        message_id: errorId,
        params: errorParams,
      },
    });

    expect(wrapper).toMatchSnapshot();
  });

  it('should correctly use the stringFormatter', () => {
    expect(mockStringFormatter).toHaveBeenLastCalledWith(errorId, errorParams);
  });

  it('should render multiple errors', () => {
    const wrapper = setup({
      invalid: true,
      error: [
        {
          message_id: errorId,
          params: errorParams,
        },
        {
          message_id: 'foo2',
          params: {},
        },
      ],
    });

    expect(wrapper).toMatchSnapshot();
  });
});
