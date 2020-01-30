import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';
import { mockEvent } from '../../test-utils/enzymeEventUtils';
import { createMockFormContext } from '../../test-utils/enzymeFormContext';
import { useFormContext } from '../../hooks';
import { IFormContext } from '../FormContext';
import { FormButton } from './FormButton';
import { IFormButtonProps } from './FormButton.types';

jest.mock('../../hooks');

describe('<FormButton />', () => {
  interface ISetupArgs {
    props?: Partial<IFormButtonProps>;
    contextOverrides?: Partial<IFormContext>;
  }

  interface ISetupResult {
    formContext: IFormContext;
    wrapper: ShallowWrapper;
    button: ShallowWrapper;
  }

  const setup = ({ props, contextOverrides }: Partial<ISetupArgs> = {}): ISetupResult => {
    const formContext: IFormContext = {
      ...createMockFormContext(),
      ...contextOverrides,
    };

    (useFormContext as jest.Mock).mockReturnValue(formContext);

    const wrapper = shallow(<FormButton {...props} />);
    const button = wrapper.find('button');

    return {
      wrapper,
      formContext,
      button,
    };
  };

  const simulateClick = (button: ShallowWrapper): ShallowWrapper =>
    button.simulate('click', mockEvent());

  const checkClickHandler = (args: Partial<ISetupArgs>, called: boolean): void => {
    describe('with onClick handler', () => {
      it(`should ${called ? '' : 'not '}call the onClick handler on click`, () => {
        const mockHandler = jest.fn();
        const customArgs = {
          contextOverrides: args.contextOverrides,
          props: {
            ...args.props,
            onClick: mockHandler,
          },
        };

        const { button } = setup(customArgs);
        simulateClick(button);

        if (called) {
          expect(mockHandler).toHaveBeenCalled();
        } else {
          expect(mockHandler).not.toHaveBeenCalled();
        }
      });
    });
  };

  const checkFormSubmit = (args: Partial<ISetupArgs>, called: boolean): void => {
    it(`should ${called ? '' : 'not '}call formContext.submit on click`, () => {
      const { button, formContext } = setup(args);
      simulateClick(button);

      if (called) {
        expect(formContext.submit).toHaveBeenCalled();
      } else {
        expect(formContext.submit).not.toHaveBeenCalled();
      }
    });
  };

  const check = (args: Partial<ISetupArgs>): void => {
    it('the button should be disabled', () => {
      const { button } = setup(args);
      expect(button.prop('disabled')).toBeTruthy();
    });

    checkFormSubmit(args, false);
    checkClickHandler(args, false);
  };

  describe('render', () => {
    it('should render without crashing', () => {
      const { wrapper } = setup();
      expect(wrapper).toMatchSnapshot();
    });

    describe('custom component', () => {
      it('should render the custom component', () => {
        const { wrapper } = setup({ props: { component: 'div' } });
        expect(wrapper).toMatchSnapshot();
      });
    });
  });

  describe('formContext is busy', () => {
    const checkArgs: Partial<ISetupArgs> = {
      contextOverrides: {
        busy: true,
      },
    };

    check(checkArgs);
  });

  describe('formContext is disabled', () => {
    const checkArgs: Partial<ISetupArgs> = {
      contextOverrides: {
        disabled: true,
      },
    };

    check(checkArgs);
  });

  describe('disabled prop is set', () => {
    const checkArgs: Partial<ISetupArgs> = {
      props: {
        disabled: true,
      },
    };

    check(checkArgs);
  });

  describe('button enabled', () => {
    checkFormSubmit({}, true);

    describe('with submitArgs', () => {
      it('should pass the submitArgs to formContext.submit', () => {
        const mockArgs = { foo: 'bar' };
        const setupArgs: Partial<ISetupArgs> = {
          props: {
            submitArgs: mockArgs,
          },
        };

        const { button, formContext } = setup(setupArgs);

        simulateClick(button);
        expect(formContext.submit).toHaveBeenCalledWith(mockArgs);
      });
    });

    checkClickHandler({}, true);
  });

  describe('button type button', () => {
    const setupArgs: Partial<ISetupArgs> = {
      props: {
        type: 'button',
      },
    };

    it('should correctly set the button type', () => {
      const { button } = setup(setupArgs);
      expect(button.prop('type')).toBe('button');
    });

    checkFormSubmit(setupArgs, false);
    checkClickHandler(setupArgs, true);
  });
});
