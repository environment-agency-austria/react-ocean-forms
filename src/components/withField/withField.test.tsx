import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { useField } from '../../hooks';
import { withField } from './withField';
import { IFieldComponentProps } from './withField.types';

jest.mock('../../hooks');

describe('withField', () => {
  interface ISetupArgs {
    props?: Partial<IFieldComponentProps>;
  }

  interface ISetupResult {
    wrapper: ShallowWrapper;
  }

  const setup = ({ props }: Partial<ISetupArgs> = {}): ISetupResult => {
    (useField as jest.Mock).mockReturnValue({
      fieldProps: {
        disabled: false,
        id: 'mock-item',
        name: 'mock-item',
        value: '',
        onChange: jest.fn(),
        onBlur: jest.fn(),
      },
      metaProps: {
        error: null,
        isValidating: false,
        isRequired: false,
        plaintext: false,
        stringFormatter: jest.fn(),
        touched: false,
        valid: true,
      },
    });

    const TestComponent = (): JSX.Element => <div id="test-component" />;
    const WrappedComponent = withField(TestComponent);

    const wrapper = shallow(<WrappedComponent name="mock-item" label="Mock Item" {...props} />);

    return {
      wrapper,
    };
  };

  it('should render without error', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });
});
