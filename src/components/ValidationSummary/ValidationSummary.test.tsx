import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import { ValidationSummary } from './ValidationSummary';
import { IValidationSummaryProps } from './ValidationSummary.types';
import {
  IUseValidationSummaryResult,
  useValidationSummary,
  IInvalidField,
} from './hooks/useValidationSummary';

jest.mock('./hooks/useValidationSummary');

describe('<ValidationSummary />', () => {
  const summaryId = 'unitSummary';

  interface ISetupArgs {
    props?: Partial<IValidationSummaryProps>;
    validationSummaryResult?: Partial<IUseValidationSummaryResult>;
  }

  interface ISetupResult {
    wrapper: ShallowWrapper;
  }

  const setup = ({ props, validationSummaryResult }: ISetupArgs = {}): ISetupResult => {
    const summaryResult: IUseValidationSummaryResult = {
      headerRef: { current: null },
      errorList: [],
      ...validationSummaryResult,
    };
    (useValidationSummary as jest.Mock).mockReturnValue(summaryResult);

    const wrapper = shallow(<ValidationSummary id={summaryId} {...props} />);

    return {
      wrapper,
    };
  };

  it('should render without crashing', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });

  it('should call useValidationSummary correctly', () => {
    setup();
    expect(useValidationSummary).toHaveBeenLastCalledWith(summaryId, false);

    setup({ props: { disableFocusOnSubmit: true, id: 'foobar' } });
    expect(useValidationSummary).toHaveBeenLastCalledWith('foobar', true);
  });

  const fieldId = 'mock-error';
  const fieldLabel = 'mock-label';

  function createErrorList(): [string, IInvalidField][] {
    return [
      [
        fieldId,
        {
          id: fieldId,
          name: fieldLabel,
          error: <span>Error</span>,
          linkCallback: jest.fn(),
        },
      ],
    ];
  }

  describe('basic rendering', () => {
    it('should not render anything if the form is valid', () => {
      const { wrapper } = setup();
      expect(wrapper.children().exists()).toBeFalsy();
    });

    it('should render correctly if there is an error', () => {
      const { wrapper } = setup({
        props: { title: 'mock-title' },
        validationSummaryResult: { errorList: createErrorList() },
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('render props', () => {
    describe('render prop', () => {
      it('should not be called if the form is valid', () => {
        const mockRender = jest.fn();
        setup({ props: { render: mockRender } });

        expect(mockRender).not.toHaveBeenCalled();
      });

      it('should be called with the basic summary render if the form is invalid', () => {
        const mockRender = jest.fn();
        setup({
          props: { render: mockRender },
          validationSummaryResult: { errorList: createErrorList() },
        });

        // We are using the mock calls in order to extract the parameters
        // that have been used in the last call. The first parameter of the
        // first call will contain the react element that we need.
        const typedCalls = mockRender.mock.calls as [[React.ReactElement]];

        const wrapper = shallow(typedCalls[0][0]);
        expect(wrapper).toMatchSnapshot();
      });

      it('should render the result of the render prop', () => {
        const mockRender = (): JSX.Element => <div id="mock-renderer">mock renderer</div>;
        const { wrapper } = setup({
          props: { render: mockRender },
          validationSummaryResult: { errorList: createErrorList() },
        });
        expect(wrapper).toMatchSnapshot();
      });
    });

    describe('renderFieldError prop', () => {
      it('should not be called if the form is valid', () => {
        const mockRender = jest.fn();
        setup({ props: { renderFieldError: mockRender } });

        expect(mockRender).not.toHaveBeenCalled();
      });

      it('should be called with informations about the invalid field if the form is invalid', () => {
        const mockRender = jest.fn();
        setup({
          props: { renderFieldError: mockRender },
          validationSummaryResult: { errorList: createErrorList() },
        });

        expect(mockRender).toHaveBeenCalledWith(
          fieldId,
          fieldLabel,
          expect.any(Object),
          expect.any(Function)
        );
      });

      it('should render the result of the render prop', () => {
        const mockRender = (): JSX.Element => (
          <div id="mock-renderer" key="mock-render">
            mock renderer
          </div>
        );
        const { wrapper } = setup({
          props: { renderFieldError: mockRender },
          validationSummaryResult: { errorList: createErrorList() },
        });

        expect(wrapper).toMatchSnapshot();
      });
    });
  });
});
