import * as React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { mockEvent } from '../../test-utils/enzymeEventUtils';
import { createMockFormContext } from '../../test-utils/enzymeFormContext';
import { IFormContext, TFormEventListener } from '../FormContext';
import { BaseValidationSummary } from './ValidationSummary';
import { IValidationSummaryProps } from './ValidationSummary.types';

describe('<ValidationSummary />', () => {
  interface ISetupArgs {
    props?: Partial<IValidationSummaryProps>;
  }

  interface ISetupResult {
    wrapper: ShallowWrapper;
    formContext: IFormContext;
    summaryId: string;
    summaryMatcher: string;
    listenerCallback: TFormEventListener;
  }

  const setup = ({
    props,
  }: ISetupArgs = {}): ISetupResult => {
    let listenerCallback: TFormEventListener = jest.fn();
    const registerCallback = (name: string, state: TFormEventListener): void => { listenerCallback = state; };
    const formContext = createMockFormContext(registerCallback);
    const summaryId = 'unitSummary';

    const wrapper = shallow((
      <BaseValidationSummary
        id={summaryId}
        context={formContext}
        {...props}
      />
    ));

    return {
      wrapper,
      formContext,
      summaryId,
      listenerCallback,
      summaryMatcher: `#${summaryId}`,
    };
  };

  it('should render without crashing', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });

  describe('form context registration', () => {
    it('should register itself in the form context', () => {
      const { formContext, summaryId } = setup();

      expect(formContext.registerListener).toHaveBeenCalledWith(
        summaryId,
        expect.any(Function),
      );
    });

    it('should unregister on unmount', () => {
      const { wrapper, formContext, summaryId } = setup();

      wrapper.unmount();
      expect(formContext.unregisterListener).toHaveBeenCalledWith(summaryId);
    });
  });

  const raiseError = (callback: TFormEventListener): { fieldId: string; fieldLabel: string } => {
    const fieldId = 'unitField';
    const fieldLabel = 'Unit field';

    callback(
      fieldId,
      'validation',
      {
        label: fieldLabel,
        valid: false,
        error: {
          message_id: 'test',
          params: { },
        },
      },
    );

    return {
      fieldId, fieldLabel,
    };
  };

  describe('basic rendering', () => {
    it('should not render anything if the form is valid', () => {
      const { wrapper, summaryMatcher } = setup();
      expect(wrapper.exists(summaryMatcher)).toBeFalsy();
    });

    it('should not render anything if the validation state of a field is valid', () => {
      const { wrapper, summaryMatcher, listenerCallback } = setup();

      listenerCallback('foo', 'validation', { valid: true });
      expect(wrapper.exists(summaryMatcher)).toBeFalsy();

      listenerCallback('foo', 'validation', { valid: false, error: null });
      expect(wrapper.exists(summaryMatcher)).toBeFalsy();
    });
  });

  describe('render props', () => {
    describe('render prop', () => {
      it('should not be called if the form is valid', () => {
        const mockRender = jest.fn();
        setup({ props: { render: mockRender }});

        expect(mockRender).not.toHaveBeenCalled();
      });

      it('should be called with the basic summary render if the form is invalid', () => {
        const mockRender = jest.fn();
        const { listenerCallback } = setup({ props: { render: mockRender }});

        expect(mockRender).not.toHaveBeenCalled();

        raiseError(listenerCallback);

        const wrapper = shallow(mockRender.mock.calls[0][0]);
        expect(wrapper).toMatchSnapshot();
      });

      it('should render the result of the render prop', () => {
        const mockRender = (): JSX.Element => (<div id="mock-renderer">mock renderer</div>);
        const { listenerCallback, wrapper } = setup({ props: { render: mockRender }});

        raiseError(listenerCallback);
        expect(wrapper.exists('#mock-renderer')).toBeTruthy();
      });
    });

    describe('renderFieldError prop', () => {
      it('should not be called if the form is valid', () => {
        const mockRender = jest.fn();
        setup({ props: { renderFieldError: mockRender }});

        expect(mockRender).not.toHaveBeenCalled();
      });

      it('should be called with informations about the invalid field if the form is invalid', () => {
        const mockRender = jest.fn();
        const { listenerCallback } = setup({ props: { renderFieldError: mockRender }});

        expect(mockRender).not.toHaveBeenCalled();

        const { fieldId, fieldLabel } = raiseError(listenerCallback);
        expect(mockRender).toHaveBeenCalledWith(
          fieldId,
          fieldLabel,
          expect.any(Array),
          expect.any(Function),
        );
      });

      it('should render the result of the render prop', () => {
        const mockRender = (): JSX.Element => (<div id="mock-renderer" key="mock-render">mock renderer</div>);
        const { listenerCallback, wrapper } = setup({ props: { renderFieldError: mockRender }});

        raiseError(listenerCallback);
        expect(wrapper.exists('#mock-renderer')).toBeTruthy();
      });
    });
  });

  describe('input focus', () => {
    const { wrapper, listenerCallback } = setup();
    const { fieldId } = raiseError(listenerCallback);

    const clickErrorLink = (): void => {
      const errorLink = wrapper.find(`a[href="#${fieldId}"]`);
      errorLink.simulate('click', mockEvent());
    };

    it('should focus on the field when you click on the error message', () => {
      const inputNode = document.createElement('input');
      inputNode.type = 'text';
      inputNode.id = fieldId;

      document.body.appendChild(inputNode);
      const spy = jest.spyOn(inputNode, 'focus');

      clickErrorLink();

      expect(spy).toHaveBeenCalled();
      document.body.removeChild(inputNode);
    });

    it('should not crash if the input with the given id could not be found', () => {
      expect(clickErrorLink).not.toThrowError();
    });
  });

  describe('scrollIntoView', () => {
    it('should scroll into view when called by the context', () => {
      const { wrapper, listenerCallback } = setup();

      const mockRef = {
        current: {
          scrollIntoView: jest.fn(),
        },
      };
      // @ts-ignore headerRef is private but it's the simplest solution to test this
      (wrapper.instance() as BaseValidationSummary).headerRef = mockRef;

      listenerCallback('_form', 'submit-invalid');
      expect(mockRef.current.scrollIntoView).toHaveBeenCalled();
    });

    it('should not scroll into view when called by the context if disableFocusOnSubmit is set', () => {
      const { wrapper, listenerCallback } = setup({ props: { disableFocusOnSubmit: true }});

      const mockRef = {
        current: {
          scrollIntoView: jest.fn(),
        },
      };

      // @ts-ignore headerRef is private but it's the simplest solution to test this
      (wrapper.instance() as BaseValidationSummary).headerRef = mockRef;

      listenerCallback('_form', 'submit-invalid');
      expect(mockRef.current.scrollIntoView).not.toHaveBeenCalled();
    });

    it('should not crash if the header was not rendered', () => {
      const { listenerCallback } = setup();
      expect(() => listenerCallback('_form', 'submit-invalid')).not.toThrowError();
    });
  });

  describe('other form events', () => {
    it('should ignore other form events', () => {
      const { listenerCallback } = setup();
      expect(() => listenerCallback('_form', 'random-event')).not.toThrowError();
    });
  });
});
