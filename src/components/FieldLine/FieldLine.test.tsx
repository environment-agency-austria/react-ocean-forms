import * as React from 'react';

// tslint:disable-next-line:no-implicit-dependencies
import { shallow, ShallowWrapper } from 'enzyme';

import { validators } from '../../validators';
import { FieldLine, IFieldLineProps } from './FieldLine';

describe('<FieldLine />', () => {
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

  const setup = (props?: Partial<IFieldLineProps>): ShallowWrapper => shallow((
    <FieldLine
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
