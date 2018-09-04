import React from 'react';
import { shallow } from 'enzyme';

import mockEvent from '../../test-utils/enzymeEventUtils';
import { createMockFormContext } from '../../test-utils/enzymeFormContext';
import { BaseFormButton } from './FormButton';

describe('<FormButton />', () => {
  const formContext = createMockFormContext();
  const wrapper = shallow((
    <BaseFormButton
      context={formContext}
    />
  ));

  const getButton = () => wrapper.find('button');
  const simulateClick = () => getButton().simulate('click', mockEvent());
  const updateFormContext = (values) => {
    Object.entries(values).forEach(([key, value]) => {
      formContext[key] = value;
    });
    wrapper.setProps({ context: formContext });
  };

  const checkClickHandler = (called) => {
    describe('with onClick handler', () => {
      const MOCK_HANDLER = jest.fn();
      beforeAll(() => wrapper.setProps({ onClick: MOCK_HANDLER }));

      it(`should ${called ? '' : 'not '}call the onClick handler on click`, () => {
        simulateClick();

        if (called) {
          expect(MOCK_HANDLER).toHaveBeenCalled();
        } else {
          expect(MOCK_HANDLER).not.toHaveBeenCalled();
        }
      });

      afterAll(() => wrapper.setProps({ onClick: undefined }));
    });
  };

  const checkFormSubmit = (called) => {
    it(`should ${called ? '' : 'not '}call formContext.submit on click`, () => {
      simulateClick();

      if (called) {
        expect(formContext.submit).toHaveBeenCalled();
      } else {
        expect(formContext.submit).not.toHaveBeenCalled();
      }
    });
  };

  const check = () => {
    it('the button should be disabled', () => {
      expect(getButton().prop('disabled')).toBeTruthy();
    });

    checkFormSubmit(false);
    checkClickHandler(false);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('render', () => {
    it('should render without crashing', () => {
      expect(wrapper).toMatchSnapshot();
    });

    describe('custom component', () => {
      beforeAll(() => wrapper.setProps({ component: 'div' }));

      it('should render the custom component', () => {
        expect(wrapper).toMatchSnapshot();
      });

      afterAll(() => wrapper.setProps({ component: undefined }));
    });
  });

  describe('formContext is busy', () => {
    beforeAll(() => updateFormContext({ busy: true }));
    check();
    afterAll(() => updateFormContext({ busy: false }));
  });

  describe('formContext is disabled', () => {
    beforeAll(() => updateFormContext({ disabled: true }));
    check();
    afterAll(() => updateFormContext({ disabled: false }));
  });

  describe('disabled prop is set', () => {
    beforeAll(() => wrapper.setProps({ disabled: true }));
    check();
    afterAll(() => wrapper.setProps({ disabled: false }));
  });

  describe('button enabled', () => {
    checkFormSubmit(true);

    describe('with submitArgs', () => {
      const MOCK_ARGS = { foo: 'bar' };
      beforeAll(() => wrapper.setProps({ submitArgs: MOCK_ARGS }));

      it('should pass the submitArgs to formContext.submit', () => {
        simulateClick();
        expect(formContext.submit).toHaveBeenCalledWith(MOCK_ARGS);
      });

      afterAll(() => wrapper.setProps({ submitArgs: undefined }));
    });

    checkClickHandler(true);
  });

  describe('button type button', () => {
    beforeAll(() => wrapper.setProps({ type: 'button' }));

    it('should correctly set the button type', () => {
      expect(getButton().prop('type')).toBe('button');
    });

    checkFormSubmit(false);
    checkClickHandler(true);

    afterAll(() => wrapper.setProps({ type: undefined }));
  });
});
