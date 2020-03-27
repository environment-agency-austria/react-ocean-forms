import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { shallow } from 'enzyme';

import { useFormContext, useFormEventListener } from '../../../hooks';
import { TFormEventListener } from '../../../hooks/internal';

import {
  useValidationSummary,
  IUseValidationSummaryResult,
  IInvalidField,
} from './useValidationSummary';
import { mockEvent } from '../../../test-utils/enzymeEventUtils';

jest.mock('../../../hooks');

describe('useValidationSummary', () => {
  const mockId = 'test-vs';

  interface ISetupArgs {
    disableFocusOnSubmit?: boolean;
  }

  interface ISetupResult {
    handleEvent: TFormEventListener;

    unmount(): boolean;
    rerender(): void;
    waitForNextUpdate(): Promise<void>;
    result: { current: IUseValidationSummaryResult };
  }

  const setup = ({ disableFocusOnSubmit = false }: Partial<ISetupArgs> = {}): ISetupResult => {
    (useFormContext as jest.Mock).mockReturnValue({
      stringFormatter: jest.fn().mockImplementation((str) => str),
    });

    let handleEvent: TFormEventListener;
    (useFormEventListener as jest.Mock).mockImplementation((name, callback) => {
      handleEvent = callback;
    });

    const { result, unmount, rerender, waitForNextUpdate } = renderHook(() =>
      useValidationSummary(mockId, disableFocusOnSubmit)
    );

    return {
      // @ts-ignore
      handleEvent,

      unmount,
      rerender,
      waitForNextUpdate,
      result,
    };
  };

  it('should return an empty headerRef and empty errors on initial load', () => {
    const { result } = setup();
    expect(result.current).toMatchObject({
      headerRef: expect.any(Object),
      errorList: [],
    });
  });

  it('should register an event listener to the form context', () => {
    (useFormEventListener as jest.Mock).mockClear();

    setup();
    expect(useFormEventListener).toHaveBeenCalledWith(mockId, expect.any(Function));
  });

  describe('Form submit handling (submit-invalid event)', () => {
    it('should not crash if there is no header ref', () => {
      const { handleEvent } = setup();

      act(() => {
        expect(() => handleEvent('_form', 'submit-invalid')).not.toThrowError();
      });
    });

    it('should call header scrollIntoView by default', () => {
      const scrollIntoViewMock = jest.fn();
      const { handleEvent, result } = setup();

      act(() => {
        result.current.headerRef.current = { scrollIntoView: scrollIntoViewMock } as any;
        handleEvent('_form', 'submit-invalid');
      });

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
    });

    it('should not call header scrollIntoView if disableFocusOnSubmit is set', () => {
      const scrollIntoViewMock = jest.fn();
      const { handleEvent, result } = setup({ disableFocusOnSubmit: true });

      act(() => {
        result.current.headerRef.current = { scrollIntoView: scrollIntoViewMock } as any;
        handleEvent('_form', 'submit-invalid');
      });

      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });
  });

  describe('Validation event handling', () => {
    function triggerValidationEvent(
      handleEvent: TFormEventListener,
      fieldId: string,
      label: string,
      error: string | null,
      valid: boolean = false
    ): void {
      act(() => {
        handleEvent(fieldId, 'validation', { valid, label, error });
      });
    }

    function checkErrorItem(item: [string, IInvalidField], fieldId: string, label: string): void {
      expect(item).toHaveLength(2);
      expect(item[0]).toEqual(fieldId);
      expect(item[1]).toMatchObject({
        id: fieldId,
        name: label,
        error: expect.any(Object),
        linkCallback: expect.any(Function),
      });
    }

    it('should add the error to the errorList', () => {
      const mockFieldId = 'mock-field';
      const mockFieldLabel = 'mock-label';
      const mockError = 'oh no';
      const { handleEvent, result } = setup();

      triggerValidationEvent(handleEvent, mockFieldId, mockFieldLabel, mockError);

      expect(result.current.errorList).toHaveLength(1);
      checkErrorItem(result.current.errorList[0], mockFieldId, mockFieldLabel);
    });

    it('should not add valid fields to the errorList', () => {
      const { handleEvent, result } = setup();
      act(() => {
        handleEvent('valid-field', 'validation', {
          valid: true,
          label: 'valid-field',
          error: null,
        });
      });

      expect(result.current.errorList).toHaveLength(0);
    });

    it('should handle multiple errors', () => {
      const mockFields = [
        { fieldId: 'mock-field-1', label: 'mock-field-1', error: 'mock-error-1' },
        { fieldId: 'mock-field-2', label: 'mock-field-2', error: 'mock-error-2' },
      ];
      const { handleEvent, result } = setup();

      mockFields.forEach((field) =>
        triggerValidationEvent(handleEvent, field.fieldId, field.label, field.error)
      );

      expect(result.current.errorList).toHaveLength(2);
      result.current.errorList.forEach((error, index) =>
        checkErrorItem(error, mockFields[index].fieldId, mockFields[index].label)
      );
    });

    it('should remove fields that are valid again from the error list', () => {
      const mockFields = [
        { fieldId: 'mock-field-1', label: 'mock-field-1', error: 'mock-error-1' },
        { fieldId: 'mock-field-2', label: 'mock-field-2', error: 'mock-error-2' },
      ];
      const { handleEvent, result } = setup();

      mockFields.forEach((field) =>
        triggerValidationEvent(handleEvent, field.fieldId, field.label, field.error)
      );

      expect(result.current.errorList).toHaveLength(2);

      triggerValidationEvent(handleEvent, mockFields[0].fieldId, mockFields[0].label, null, true);

      expect(result.current.errorList).toHaveLength(1);
    });

    describe('error details', () => {
      const mockFieldId = 'mock-field';
      const mockFieldLabel = 'mock-label';
      const mockError = 'oh no';
      const { handleEvent, result } = setup();

      triggerValidationEvent(handleEvent, mockFieldId, mockFieldLabel, mockError);

      it('should render a <FieldError /> into the error property', () => {
        const fieldError = result.current.errorList[0][1].error;
        const wrapper = shallow(<div>{fieldError}</div>);

        const renderedFieldError = wrapper.find('FieldError');
        expect(renderedFieldError.prop('id')).toEqual(mockFieldId);
        expect(renderedFieldError.prop('invalid')).toEqual(true);
        expect(renderedFieldError.prop('error')).toEqual(mockError);
      });

      describe('link callback', () => {
        const linkCallback = result.current.errorList[0][1].linkCallback;
        it('should not crash if no element with the given id could be found', () => {
          expect(() => {
            linkCallback(mockEvent() as any);
          }).not.toThrowError();
        });

        it('should prevent the default action of the event', () => {
          const preventDefault = jest.fn();
          const event = mockEvent({ preventDefault });
          linkCallback(event as any);
          expect(preventDefault).toHaveBeenCalled();
        });

        it('the linkCallback should focus the field', () => {
          const mockInput = { focus: jest.fn() };
          const mockedGetElementById = jest
            .spyOn(document, 'getElementById')
            .mockReturnValue(mockInput as any);

          linkCallback(mockEvent() as any);
          expect(mockedGetElementById).toHaveBeenCalledWith(mockFieldId);
          expect(mockInput.focus).toHaveBeenCalled();

          mockedGetElementById.mockRestore();
        });
      });
    });
  });
});
