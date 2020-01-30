import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { createMockFormContext } from '../../test-utils/enzymeFormContext';

import { useFormContext } from '../../hooks';
import { withForm } from './withForm';
import { IFormContextProps } from './withForm.types';

jest.mock('../../hooks');

describe('withForm', () => {
  const formContext = createMockFormContext();
  (useFormContext as jest.Mock).mockReturnValue(formContext);

  const TestComponent = (): JSX.Element => <div id="test-component" />;
  const WrappedComponent = withForm(TestComponent);

  const setup = (props?: Partial<IFormContextProps>): ShallowWrapper =>
    shallow(<WrappedComponent {...props} />);
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
      expect(wrapper.prop('context')).toBe(formContext);
    });
  });
});
