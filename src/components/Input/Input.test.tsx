import * as React from 'react';

// tslint:disable-next-line:no-implicit-dependencies
import { shallow, ShallowWrapper } from 'enzyme';

import { IFieldComponentMeta } from '../Field';
import { Input } from './Input';
import { IInputProps } from './Input.types';

describe('<Input />', () => {
  interface ISetupArgs {
    props?: Partial<IInputProps>;
    metaOverrides?: Partial<IFieldComponentMeta>;
  }

  interface ISetupResult {
    wrapper: ShallowWrapper;
  }

  const setup = ({
    props,
    metaOverrides,
  }: ISetupArgs = {}): ISetupResult => {
    const meta = {
      valid: true,
      error: null,
      isValidating: false,
      touched: false,
      stringFormatter: jest.fn(),
      plaintext: false,
      ...metaOverrides,
    };
    const field = {
      id: 'unitInput',
      name: 'unitInput',
      value: '',
      disabled: false,
      onChange: jest.fn(),
      onBlur: jest.fn(),
    };

    const wrapper = shallow((
      <Input
        label="unitLabel"
        meta={meta}
        field={field}
        {...props}
      />
    ));

    return {
      wrapper,
    };
  };

  it('should render without crashing', () => {
    const wrapper = setup();
    expect(wrapper).toMatchSnapshot();
  });

  it('should only display the value if plaintext is set', () => {
    const wrapper = setup({ metaOverrides: { plaintext: true }});
    expect(wrapper).toMatchSnapshot();
  });
});
