import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { IFieldComponentMeta, IFieldComponentFieldProps, useField } from '../../hooks';
import { Input } from './Input';
import { IInputProps } from './Input.types';

jest.mock('../../hooks');

describe('<Input />', () => {
  interface ISetupArgs {
    props?: Partial<IInputProps<unknown>>;
    metaOverrides?: Partial<IFieldComponentMeta>;
    fieldOverrides?: Partial<IFieldComponentFieldProps<unknown>>;
  }

  interface ISetupResult {
    wrapper: ShallowWrapper;
  }

  const setup = ({ props, metaOverrides, fieldOverrides }: ISetupArgs = {}): ISetupResult => {
    const meta = {
      valid: true,
      error: null,
      isValidating: false,
      isRequired: false,
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
      ...fieldOverrides,
    };

    (useField as jest.Mock).mockReturnValue({
      fieldProps: field,
      metaProps: meta,
    });

    const wrapper = shallow(<Input name="unitInput" label="unitLabel" {...props} />);

    return {
      wrapper,
    };
  };

  it('should render without crashing', () => {
    const wrapper = setup();
    expect(wrapper).toMatchSnapshot();
  });

  it('should only display the value if plaintext is set', () => {
    const wrapper = setup({ metaOverrides: { plaintext: true } });
    expect(wrapper).toMatchSnapshot();
  });

  it('should properly pass the type prop', () => {
    const wrapper = setup({ props: { type: 'number' } });
    expect(wrapper).toMatchSnapshot();
  });
});
