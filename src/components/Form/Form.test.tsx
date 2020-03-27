import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';
import { IFormContext } from '../FormContext';
import { Form } from './Form';
import { IFormProps } from './Form.types';
import { createMockFormContext } from '../../test-utils/enzymeFormContext';
import { useForm } from './hooks/useForm';

jest.mock('./hooks/useForm');

describe('<Form />', () => {
  interface ISetupArgs {
    props?: Partial<IFormProps>;
    formContext?: Partial<IFormContext>;
  }

  interface ISetupResult {
    wrapper: ShallowWrapper;
    formContext: IFormContext;
    form: ShallowWrapper;
  }

  const setup = ({ props, formContext }: Partial<ISetupArgs> = {}): ISetupResult => {
    const overriddenContext = {
      ...createMockFormContext(),
      ...formContext,
    };

    (useForm as jest.Mock).mockReturnValue(overriddenContext);

    const wrapper = shallow(
      <Form {...props}>
        <div>unitChild</div>
      </Form>
    );

    const form = wrapper.find('form');

    return {
      wrapper,
      formContext: overriddenContext,
      form,
    };
  };

  it('should render without error', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });

  it('should pass the props to useForm', () => {
    const props: Partial<IFormProps> = {
      disabled: true,
      busy: true,
      plaintext: false,
      asyncValidateOnChange: false,
    };
    setup({ props });

    expect(useForm).toHaveBeenCalledWith(props);
  });

  describe('css classes', () => {
    const hasClass = (wrapper: ShallowWrapper, className: string): void => {
      expect(wrapper.find('form').prop('className')).toContain(className);
    };

    it('should output any additional classNames added to the form', () => {
      const mockClass = 'mock-class';
      const { wrapper } = setup({ props: { className: mockClass } });
      hasClass(wrapper, mockClass);
    });

    describe('plaintext', () => {
      it('should have the plaintext css class if in plaintext mode', () => {
        const { wrapper } = setup({ formContext: { plaintext: true } });
        hasClass(wrapper, 'plaintext');
      });

      it('should still add the additional classNames', () => {
        const mockClass = 'mock-class';
        const { wrapper } = setup({
          props: { className: mockClass },
          formContext: { plaintext: true },
        });
        hasClass(wrapper, 'plaintext');
        hasClass(wrapper, mockClass);
      });
    });
  });

  describe('html form event handling', () => {
    describe('onSubmit', () => {
      it('should call event.preventDefault and event.stopPropagation', () => {
        const { form } = setup();
        const mockSubmitEvent = {
          preventDefault: jest.fn(),
          stopPropagation: jest.fn(),
        };

        form.simulate('submit', mockSubmitEvent);
        expect(mockSubmitEvent.preventDefault).toHaveBeenCalled();
        expect(mockSubmitEvent.stopPropagation).toHaveBeenCalled();
      });

      it('should call formContext.submit and event.stopPropagation', () => {
        const { form, formContext } = setup();
        const mockSubmitEvent = {
          preventDefault: jest.fn(),
          stopPropagation: jest.fn(),
        };

        form.simulate('submit', mockSubmitEvent);
        expect(formContext.submit).toHaveBeenCalled();
        expect(mockSubmitEvent.stopPropagation).toHaveBeenCalled();
      });
    });

    describe('onReset', () => {
      it('should call event.preventDefault and event.stopPropagation', () => {
        const { form } = setup();
        const mockSubmitEvent = {
          preventDefault: jest.fn(),
          stopPropagation: jest.fn(),
        };

        form.simulate('reset', mockSubmitEvent);
        expect(mockSubmitEvent.preventDefault).toHaveBeenCalled();
        expect(mockSubmitEvent.stopPropagation).toHaveBeenCalled();
      });

      it('should call formContext.reset', () => {
        const { form, formContext } = setup();
        const mockSubmitEvent = {
          preventDefault: jest.fn(),
          stopPropagation: jest.fn(),
        };

        form.simulate('reset', mockSubmitEvent);
        expect(formContext.reset).toHaveBeenCalled();
      });
    });
  });
});
