import * as React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { createMockFormContext } from '../../test-utils/enzymeFormContext';
import { Subtract } from '../../utils';
import { IFormContext } from '../FormContext';
import { IFormContextProps } from './withForm.types';

type TWithFormMock<T extends IFormContextProps> = ((Component: React.ComponentType<T>) => React.SFC<Subtract<T, IFormContextProps>>);

const prepareMock = <T extends IFormContextProps>(formContext: IFormContext): TWithFormMock<T> => {
  interface IMockConsumer {
    children: React.ComponentType<T>;
  }

  jest.doMock('../FormContext', () => ({
    // @ts-ignore This works, don't ask me why, but it works
    FormContext: { Consumer: ({ children }: IMockConsumer): void => children(formContext) },
  }));

  // tslint:disable-next-line:no-require-imports
  return require('./withForm').withForm;
};

describe('withForm', () => {
  const formContext = createMockFormContext();
  const withForm = prepareMock(formContext);

  // tslint:disable-next-line:naming-convention
  const TestComponent = (): JSX.Element => (<div id="test-component" />);
  // tslint:disable-next-line:naming-convention
  const WrappedComponent = withForm(TestComponent);

  const setup = (props?: Partial<IFormContextProps>): ShallowWrapper => shallow((
    <WrappedComponent
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
