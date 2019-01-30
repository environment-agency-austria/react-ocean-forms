import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { IFieldComponentFieldProps, IFieldComponentMeta, IFieldComponentProps } from './Field/Field.types';
import { withField } from './withField';

describe('withField', () => {
  interface ISetupArgs {
    props?: Partial<IFieldComponentProps>;
  }

  interface ISetupResult {
    wrapper: ShallowWrapper;
    renderProp(field: IFieldComponentFieldProps, meta: IFieldComponentMeta): JSX.Element;
  }

  const setup = ({
    props,
  }: Partial<ISetupArgs> = {}): ISetupResult => {
    // tslint:disable-next-line:naming-convention
    const TestComponent = (): JSX.Element => (<div id="test-component" />);
    // tslint:disable-next-line:naming-convention
    const WrappedComponent = withField(TestComponent);

    const wrapper = shallow((
      <WrappedComponent
        name="mock-item"
        label="Mock Item"
        {...props}
      />
    ));

    const renderProp = wrapper.prop('render') as ((field: IFieldComponentFieldProps, meta: IFieldComponentMeta) => JSX.Element);

    return {
      wrapper,
      renderProp,
    };
  };

  it('should render without error', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });

  describe('render prop', () => {
    it('should render without error', () => {
      const { renderProp } = setup();
      const wrapper = shallow(
        renderProp(
          {
            disabled: false,
            id: 'mock-item',
            name: 'mock-item',
            value: '',
            onChange: jest.fn(),
            onBlur: jest.fn(),
          },
          {
            error: null,
            isValidating: false,
            isRequired: false,
            plaintext: false,
            stringFormatter: jest.fn(),
            touched: false,
            valid: true,
          },
        ),
      );
      expect(wrapper).toMatchSnapshot();
    });
  });
});
