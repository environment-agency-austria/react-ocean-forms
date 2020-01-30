import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { createMockFormContext } from '../../test-utils/enzymeFormContext';
import { IMessageValues } from '../../utils';
import { useFormContext } from '../../hooks';
import { IFormContext } from '../FormContext';
import { FormText } from './FormText';

jest.mock('../../hooks');

describe('<FormText />', () => {
  const mockContext: IFormContext = createMockFormContext();
  mockContext.stringFormatter = jest.fn().mockImplementation((value: string): string => value);

  (useFormContext as jest.Mock).mockReturnValue(mockContext);

  const setup = (text: string | null, values?: IMessageValues): ShallowWrapper =>
    shallow(<FormText text={text} values={values} />);

  it('should render nothing if text is null', () => {
    const wrapper = setup(null);
    expect(wrapper.text()).toBe('');
  });

  describe('text existing', () => {
    const mockText = 'mock-text';
    const mockValues = { foo: 'bar' };

    const wrapper = setup(mockText, mockValues);

    it('should call context.stringFormatter', () => {
      expect(mockContext.stringFormatter).toHaveBeenCalledWith(mockText, mockValues);
    });

    it('should render the text', () => {
      expect(wrapper.text()).toBe(mockText);
    });
  });
});
