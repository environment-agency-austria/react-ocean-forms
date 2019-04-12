import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { createMockValidation } from '../../test-utils/enzymeFormContext';
import { useValidation, useFullName } from '../../hooks';
import { withValidation } from './withValidation';
import { IValidationProps } from './withValidation.types';

jest.mock('../../hooks');

describe('withValidation', () => {
  interface ISetupArgs {
    props?: Partial<IValidationProps>;
  }

  interface ISetupResult {
    wrapper: ShallowWrapper;
  }

  const setup = ({
    props,
  }: Partial<ISetupArgs> = {}): ISetupResult => {
    (useFullName as jest.Mock).mockImplementation((name: string) => name);
    const validation = createMockValidation();
    (useValidation as jest.Mock).mockReturnValue({
      validationState: {
        isValidating: validation.isValidating,
        valid: validation.valid,
        error: validation.error,
        isRequired: validation.isRequired,
      },
      validate: validation.validate,
      resetValidation: validation.reset,
      updateValidationState: validation.update,
    });

    const TestComponent = (): JSX.Element => (<div id="test-component" />);
    const WrappedComponent = withValidation(TestComponent);

    const wrapper = shallow((
      <WrappedComponent
        name="mock-item"
        {...props}
      />
    ));

    return {
      wrapper,
    };
  };

  it('should render without error', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });
});
