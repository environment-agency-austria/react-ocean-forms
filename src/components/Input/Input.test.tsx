import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { IFieldComponentFieldProps, IFieldComponentMeta } from '../withField';
import { BaseInput } from './Input';
import { IInputProps } from './Input.types';

describe('<Input />', () => {
  interface ISetupArgs {
    props?: Partial<IInputProps>;
    metaOverrides?: Partial<IFieldComponentMeta>;
    fieldOverrides?: Partial<IFieldComponentFieldProps>;
  }

  interface ISetupResult {
    wrapper: ShallowWrapper;
  }

  const setup = ({
    props,
    metaOverrides,
    fieldOverrides,
  }: ISetupArgs = {}): ISetupResult => {
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

    const wrapper = shallow((
      <BaseInput
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

  describe('Unsupported value types', () => {
    it('should throw an error if the value is not a string', () => {
      expect(() => setup({ fieldOverrides: { value: 42 }})).toThrowError();
    });
  });
});
