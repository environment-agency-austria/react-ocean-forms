import React from 'react';
import { shallow } from 'enzyme';

import mockEvent from '../test-utils/enzymeEventUtils';
import { createMockFormContext } from '../test-utils/enzymeFormContext';
import { BaseValidationSummary } from '../ValidationSummary';

describe('<ValidationSummary />', () => {
  let listenerState = null;
  const registerCallback = (name, state) => { listenerState = state; };
  const formContext = createMockFormContext(registerCallback);

  const summaryId = 'unitSummary';
  const setup = props => shallow((
    <BaseValidationSummary
      id={summaryId}
      context={formContext}
      {...props}
    />
  ));
  const wrapper = setup();

  it('should render without crashing', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should register itself in the form context', () => {
    expect(formContext.registerListener).toHaveBeenCalledWith(
      summaryId,
      {
        notify: expect.any(Function),
        scrollIntoView: expect.any(Function),
      },
    );
  });

  const errorFieldName = 'unitField';
  const errorFieldLabel = 'Unit field';
  const mockError = {
    message_id: 'test',
    params: {},
  };

  it('should call the render props correctly', () => {
    listenerState.notify(
      errorFieldName,
      {
        label: errorFieldLabel,
        valid: false,
        error: mockError,
      },
    );
    wrapper.update();

    const mockRender = jest.fn().mockReturnValue(null);
    const mockErrorRender = jest.fn().mockReturnValue(null);
    wrapper.setProps({ render: mockRender, renderFieldError: mockErrorRender });

    expect(mockRender).toHaveBeenCalled();
    expect(mockRender).toMatchSnapshot();

    expect(mockErrorRender).toHaveBeenCalledWith(
      errorFieldName,
      errorFieldLabel,
      expect.any(Array),
      expect.any(Function),
    );
  });

  it('should render when it receives new validation states', () => {
    wrapper.setProps({ render: undefined, renderFieldError: undefined });
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('should ignore valid fields', () => {
    listenerState.notify(
      'validField',
      {
        label: errorFieldLabel,
        valid: true,
        error: null,
      },
    );
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('should focus on the field when you click on the error message', () => {
    const inputNode = document.createElement('input');
    inputNode.type = 'text';
    inputNode.id = errorFieldName;

    document.body.appendChild(inputNode);
    const spy = jest.spyOn(inputNode, 'focus');

    const errorLink = wrapper.find('ul li a');
    errorLink.simulate('click', mockEvent());

    expect(spy).toHaveBeenCalled();
    document.body.removeChild(inputNode);

    errorLink.simulate('click', mockEvent());
  });

  it('should scroll into view when called by the context', () => {
    // TODO: Can someone test this?
    listenerState.scrollIntoView();
  });

  it('should unregister on unmount', () => {
    wrapper.unmount();
    expect(formContext.unregisterListener).toHaveBeenCalledWith(summaryId);
  });
});
