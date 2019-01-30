import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { createMockFormContext, createMockValidation } from '../../test-utils/enzymeFormContext';
import { IFormContext } from '../FormContext';
import { withValidation } from './withValidation';
import { IValidationProp, IValidationProps } from './withValidation.types';

describe('withValidation', () => {
  interface ISetupArgs {
    props?: Partial<IValidationProps>;
  }

  interface ISetupResult {
    wrapper: ShallowWrapper;
    renderProp(fullName: string, validation: IValidationProp, context: IFormContext): JSX.Element;
  }

  const setup = ({
    props,
  }: Partial<ISetupArgs> = {}): ISetupResult => {
    // tslint:disable-next-line:naming-convention
    const TestComponent = (): JSX.Element => (<div id="test-component" />);
    // tslint:disable-next-line:naming-convention
    const WrappedComponent = withValidation(TestComponent);

    const wrapper = shallow((
      <WrappedComponent
        name="mock-item"
        {...props}
      />
    ));

    const renderProp = wrapper.prop('render') as ((fullName: string, validation: IValidationProp, context: IFormContext) => JSX.Element);

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
          'fullName',
          createMockValidation(),
          createMockFormContext(),
        ),
      );
      expect(wrapper).toMatchSnapshot();
    });
  });
});
