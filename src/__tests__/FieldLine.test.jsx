import React from 'react';
import { shallow } from 'enzyme';

import validators from '../validators';
import FieldLine from '../FieldLine';

describe('<FieldLine />', () => {
  const meta = {
    valid: true,
    error: null,
    isValidating: false,
    touched: false,
    stringFormatter: jest.fn(),
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
    <FieldLine
      id="unitInput"
      label="unitLabel"
      meta={meta}
      field={field}
      {...props}
    >
      <div>children</div>
    </FieldLine>
  ));

  it('should render without crashing', () => {
    const wrapper = setup();
    expect(wrapper).toMatchSnapshot();
  });

  it('should display invalid correctly', () => {
    meta.valid = false;
    const wrapper = setup();
    expect(wrapper).toMatchSnapshot();
  });

  it('should show a required marker', () => {
    const wrapper = setup({
      validators: [validators.required],
    });
    expect(wrapper).toMatchSnapshot();
  });
});
