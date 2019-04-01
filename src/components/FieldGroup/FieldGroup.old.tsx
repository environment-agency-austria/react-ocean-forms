/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { FormContext, IFieldValues, IFormContext } from '../FormContext';
import { TBasicFieldValue } from '../withField';
import { withValidation } from '../withValidation';
import { IFieldGroupProps } from './FieldGroup.types.old';
import { IValidationArgs, IValidationState } from '../../hooks';

interface IFieldGroupState {
  fieldPrefix: string;
  notifyFieldEvent(name: string, event: string, args?: unknown): void;
}

/**
 * Wrapper for groups of input fields
 * managed by the form component
 */
export class BaseFieldGroup<TFieldValues extends object = IFieldValues> extends React.Component<IFieldGroupProps<TFieldValues>, IFieldGroupState> {
  public static displayName: string = 'FieldGroup';

  constructor(props: IFieldGroupProps<TFieldValues>) {
    super(props);

    const {
      fullName,
      label,
      context,
      validation: {
        update: updateValidation,
      },
    } = props;

    this.checkFormContext();

    // Our state will overwrite the parts of the formContext
    this.state = {
      fieldPrefix: fullName,
      notifyFieldEvent: this.notifyFieldEvent,
    };

    // Register the group in the formContext, so the group
    // validation can be called on form submit.
    context.registerField(
      fullName,
      {
        label,

        updateValidation,
        validate: this.validate,
        reset: this.reset,
        getValue: (): TBasicFieldValue => ({}),

        isGroup: true,
      },
    );
  }

  /**
   * Unregisters the field from the form
   */
  public componentWillUnmount(): void {
    const { context, fullName } = this.props;
    context.unregisterField(fullName);
  }

  /**
   * Helper function to get the correct value
   * of the group (including all values of the nested fields)
   */
  private getGroupValue(): TFieldValues | undefined {
    const { context, fullName } = this.props;
    const formValues = context.getValues();

    const formValue = formValues[fullName];
    if (formValue === '' || formValue === undefined) {
      return undefined;
    }

    return formValue as TFieldValues;
  }

  /**
   * Returns the correct asyncValidateOnChange setting,
   * where the field setting takes priorty over the
   * form setting
   */
  private getAsyncValidateOnChangeSetting(): boolean {
    const {
      asyncValidateOnChange: propChange,
      context: { asyncValidateOnChange: contextChange },
    } = this.props;

    return propChange === undefined ? contextChange : propChange;
  }

  /**
   * Generates the form context for the FieldGroup children
   * Overrides fieldPrefix and notifyFieldEvent from the
   * parent context, and overrides defaultValues and values
   * for the group items if needed
   */
  private getSubContext(): IFormContext {
    const { context, disabled, plaintext } = this.props;

    return {
      ...context,
      ...this.state,
      disabled: disabled === undefined ? context.disabled : disabled,
      plaintext: plaintext === undefined ? context.plaintext : plaintext,
      defaultValues: this.overrideContextValues<IFieldValues>('defaultValues'),
      values: this.overrideContextValues<IFieldValues | undefined>('values'),
    };
  }

  /**
   * Checks if the FieldGroup is inside a valid form context
   * and throws an user friendly error if not
   */
  private checkFormContext(): void {
    const { context, fullName } = this.props;
    if (context === undefined || typeof context.registerField !== 'function') {
      throw new Error(
        `Could not find a form context for field group "${fullName}". `
        + 'Fields can only be used inside a Form tag.',
      );
    }
  }

  /**
   * Checks if the FieldGroup has a prop with the given name
   * and overrides the according value in the parent form context.
   * @param name Property name
   */
  private overrideContextValues<T extends IFieldValues | undefined>(name: 'defaultValues' | 'values'): T {
    let contextValue: Partial<IFieldValues> | undefined;
    let propValue: Partial<TFieldValues> | undefined;

    const { fullName } = this.props;

    if (name === 'defaultValues') {
      contextValue = this.props.context.defaultValues;
      propValue = this.props.defaultValues;
    } else if (name === 'values') {
      contextValue = this.props.context.values;
      propValue = this.props.values;
    }

    if (propValue === undefined) {
      return contextValue as T;
    }

    const returnValue = {
      ...contextValue,
      ...{
        [fullName]: propValue,
      },
    };

    return returnValue as T;
  }

  /**
   * Resets the validation state
   */
  private reset = (): void => {
    const { validation: { reset } } = this.props;
    reset();
  }

  /**
   * Listens to child field events, triggers validation if
   * needed and passes them to the higher context
   * @param name Field name
   * @param event Event name
   * @param args Event args
   */
  private notifyFieldEvent = (name: string, event: string, args?: unknown): void => {
    const { fullName, context, validation: { validate } } = this.props;
    context.notifyFieldEvent(name, event, args);

    if (event !== 'change' && event !== 'blur') { return; }

    const asyncValidateOnChange = this.getAsyncValidateOnChangeSetting();
    if (event === 'change') {
      const localName = name.substring(fullName.length + 1);

      const currentGroupValue = this.getGroupValue();
      const intermediateGroupValue = {
        ...(currentGroupValue === undefined ? { } : currentGroupValue),
        ...{
          // Override the value of the event sender, because
          // the Field didn't update its state yet, making the
          // Form.getValues() returning an old Field value.
          [localName]: args,
        },
      };

      void validate(
        intermediateGroupValue as TFieldValues,
        { checkAsync: asyncValidateOnChange },
      );
    } else if (!asyncValidateOnChange) {
      void validate(this.getGroupValue());
    }
  }

  /**
   * Triggers the validation of the group
   * @param args Options for the validate call
   */
  private validate = async (args?: Partial<IValidationArgs>): Promise<IValidationState> => {
    const { validation: { validate } } = this.props;

    // Overwrite the value of the group state with
    // the parsed one.
    const value = this.getGroupValue();

    return validate(value, args);
  }

  public render(): JSX.Element {
    const {
      fullName,
      validation: {
        isValidating,
        isRequired,
        valid,
        error,
      },
      render: renderProp,
    } = this.props;

    const groupState = {
      fullName,
      isValidating,
      isRequired,
      valid,
      error,
    };

    const subContext = this.getSubContext();

    return (
      <FormContext.Provider value={subContext}>
        {renderProp(groupState)}
      </FormContext.Provider>
    );
  }
}

export const FieldGroup = withValidation(BaseFieldGroup);
