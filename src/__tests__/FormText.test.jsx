import React from 'react';
import { shallow } from 'enzyme';

import { BaseFormText } from '../FormText';

describe('<FormText />', () => {
  const MOCK_CONTEXT = {
    stringFormatter: jest.fn().mockImplementation(value => value),
  };

  const setup = (text, values) => shallow((
    <BaseFormText
      context={MOCK_CONTEXT}
      text={text}
      values={values}
    />
  ));

  it('should render nothing if text is null', () => {
    const wrapper = setup(null);
    expect(wrapper.text()).toBe('');
  });

  describe('text existing', () => {
    const MOCK_TEXT = 'mock-text';
    const MOCK_VALUES = { foo: 'bar' };

    const wrapper = setup(MOCK_TEXT, MOCK_VALUES);

    it('should call context.stringFormatter', () => {
      expect(MOCK_CONTEXT.stringFormatter).toHaveBeenCalledWith(MOCK_TEXT, MOCK_VALUES);
    });

    it('should render the text', () => {
      expect(wrapper.text()).toBe(MOCK_TEXT);
    });
  });
});
