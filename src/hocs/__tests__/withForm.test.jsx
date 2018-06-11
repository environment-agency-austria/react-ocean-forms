import React from 'react';
import { shallow } from 'enzyme';

import { createMockFormContext } from '../../test-utils/enzymeFormContext';
import { withForm } from '../withForm';

describe('withForm', () => {
  const formContext = createMockFormContext();
  const TestComponent = () => (<div id="test-component" />);
  const WrappedComponent = withForm(TestComponent);

  const fieldName = 'unitField';

  const setup = props => shallow((
    <WrappedComponent
      name={fieldName}
      context={formContext}
      {...props}
    />
  ));
  const wrapper = setup();

  it('should render without error', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
