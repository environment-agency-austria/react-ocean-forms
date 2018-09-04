import React from 'react';
import { shallow } from 'enzyme';

import { Input } from './Input';

describe('<Input />', () => {
  const meta = {
    valid: true,
    error: null,
    isValidating: false,
    touched: false,
    stringFormatter: jest.fn(),
    plaintext: false,
  };
  const field = {
    id: 'unitInput',
    name: 'unitInput',
    value: '',
    disabled: false,
    onChange: jest.fn(),
    onBlur: jest.fn(),
  };

  const setup = props => shallow((
    <Input
      id="unitInput"
      label="unitLabel"
      meta={meta}
      field={field}
      {...props}
    />
  ));

  it('should render without crashing', () => {
    const wrapper = setup();
    expect(wrapper).toMatchSnapshot();
  });

  it('should only display the value if plaintext is set', () => {
    meta.plaintext = true;
    const wrapper = setup();
    expect(wrapper).toMatchSnapshot();
  });
});
