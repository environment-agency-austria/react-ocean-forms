import React from 'react';
import { shallow } from 'enzyme';

import FieldError from '../FieldError';

describe('<FieldError />', () => {
  const mockStringFormatter = jest.fn().mockReturnValue('string');
  const setup = props => shallow((
    <FieldError
      id="unitError"
      stringFormatter={mockStringFormatter}
      {...props}
    />
  ));

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
    expect(mockStringFormatter).toHaveBeenLastCalledWith(
      errorId,
      errorParams,
    );
  });
});
