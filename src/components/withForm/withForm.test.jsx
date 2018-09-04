import React from 'react';
import { shallow } from 'enzyme';

import { createMockFormContext } from '../../test-utils/enzymeFormContext';

const prepareMock = (formContext) => {
  jest.doMock('../FormContext', () => ({
    FormContext: { Consumer: ({ children }) => children(formContext) },
  }));

  /* eslint-disable global-require */
  return require('./withForm').withForm;
};

describe('withForm', () => {
  const formContext = createMockFormContext();
  const withForm = prepareMock(formContext);

  const TestComponent = () => (<div id="test-component" />);
  const WrappedComponent = withForm(TestComponent);

  const fieldName = 'unitField';

  const setup = props => shallow((
    <WrappedComponent
      name={fieldName}
      {...props}
    />
  ));
  const wrapper = setup();

  it('should render without error', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('FormContext.Provider', () => {
    const childWrapper = wrapper.dive();

    it('should render the children without error', () => {
      expect(childWrapper).toMatchSnapshot();
    });

    it('should have the formContext supplied as a prop', () => {
      expect(childWrapper.prop('context')).toBe(formContext);
    });
  });
});
