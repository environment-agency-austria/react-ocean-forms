import React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import {
  createMockFormContext,
  createMockValidationResult,
} from '../../test-utils/enzymeFormContext';
import { IFormContext } from '../FormContext';

import { FieldGroup } from './FieldGroup';
import { IFieldGroupProps } from './FieldGroup.types';
import { useFieldGroup } from './hooks/useFieldGroup';
import { IFieldGroupRenderParams } from './hooks/useFieldGroup.types';

jest.mock('./hooks/useFieldGroup');

describe('<FieldGroup />', () => {
  const mockName = 'unitGroup';
  const mockLabel = 'Unit group';

  interface ISetupArgs {
    props?: Partial<IFieldGroupProps<{} | undefined>>;
    contextOverrides?: Partial<IFormContext>;
    validationOverrides?: Partial<IFieldGroupRenderParams>;
  }

  interface ISetupResult {
    formContext: IFormContext;
    wrapper: ShallowWrapper;
    renderMock: jest.Mock;
    groupContext: IFormContext;
  }

  const setup = ({
    props,
    contextOverrides,
    validationOverrides,
  }: ISetupArgs = {}): ISetupResult => {
    const renderMock = jest.fn().mockReturnValue(null);

    const formContext: IFormContext = {
      ...createMockFormContext(),
      fieldPrefix: mockName,
      ...contextOverrides,
    };
    const { validationState } = createMockValidationResult();
    const validation: IFieldGroupRenderParams = {
      fullName: mockName,
      ...validationState,
      ...validationOverrides,
    };

    (useFieldGroup as jest.Mock).mockReturnValue({
      groupFormContext: formContext,
      renderParams: validation,
    });

    const wrapper = shallow(
      <FieldGroup name={mockName} label={mockLabel} render={renderMock} {...props} />
    );

    const groupContext = wrapper.first().prop('value') as IFormContext;

    return {
      formContext,
      wrapper,
      renderMock,
      groupContext,
    };
  };

  describe('Render', () => {
    it('should render without crashing', () => {
      const { wrapper } = setup();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('Context overrides', () => {
    it('should create a valid form context', () => {
      const { formContext, groupContext } = setup();
      expect(groupContext).toMatchObject({
        fieldPrefix: mockName,
        registerField: formContext.registerField,
        unregisterField: formContext.unregisterField,
        notifyFieldEvent: formContext.notifyFieldEvent,
        plaintext: formContext.plaintext,
        registerListener: formContext.registerListener,
        unregisterListener: formContext.unregisterListener,
        getFieldState: formContext.getFieldState,
        getValues: formContext.getValues,
        busy: formContext.busy,
        disabled: formContext.disabled,
        asyncValidateOnChange: formContext.asyncValidateOnChange,
        asyncValidationWait: formContext.asyncValidationWait,
        defaultValues: formContext.defaultValues,
        stringFormatter: formContext.stringFormatter,
        submit: formContext.submit,
      });
    });
  });

  describe('render prop', () => {
    it('should get called with the correct parameters', () => {
      const { renderMock } = setup();
      expect(renderMock).toHaveBeenCalledWith({
        fullName: mockName,
        isValidating: false,
        isRequired: false,
        valid: true,
        error: null,
      });
    });

    it('should correctly pass the validation state', () => {
      const mockIsValidating = true;
      const mockIsRequired = true;
      const mockIsValid = false;
      const mockError = { message_id: 'bar', params: {} };

      const { renderMock } = setup({
        validationOverrides: {
          isValidating: mockIsValidating,
          isRequired: mockIsRequired,
          valid: mockIsValid,
          error: mockError,
        },
      });
      expect(renderMock).toHaveBeenCalledWith({
        fullName: mockName,
        isValidating: mockIsValidating,
        isRequired: mockIsRequired,
        valid: mockIsValid,
        error: mockError,
      });
    });
  });
});
