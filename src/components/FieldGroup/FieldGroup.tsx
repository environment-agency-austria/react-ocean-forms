/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';

import { TFieldErrors } from '../../validators';
import { TFieldValue } from '../Field';
import { FormContext, IFormContext, TFieldValues } from '../FormContext';
import { IValidationArgs, IValidationProps, IValidationState, withValidation } from '../withValidation';

interface IRenderParams {
  fullName: string;
  isValidating: boolean;
  valid: boolean;
  error: TFieldErrors;
}

interface IFieldGroupProps extends IValidationProps {
  label: string;
  asyncValidateOnChange?: boolean;
  defaultValues?: TFieldValues;
  values?: TFieldValues;
  render(params: IRenderParams): JSX.Element;
}

interface IFieldGroupState {
  fieldPrefix: string;
  notifyFieldEvent(name: string, event: string, args?: any): void;
}

/**
 * Wrapper for groups of input fields
 * managed by the form component
 */
export class BaseFieldGroup extends React.Component<IFieldGroupProps, IFieldGroupState> {
  public static displayName: string = 'FieldGroup';

  constructor(props: IFieldGroupProps) {
    super(props);

    this.validate = this.validate.bind(this);
    this.reset = this.reset.bind(this);

    this.notifyFieldEvent = this.notifyFieldEvent.bind(this);

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

        validate: this.validate,
        updateValidation,
        reset: this.reset,
        getValue: (): TFieldValue => ({}),

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
  private getGroupValue(): object | string {
    const { context, fullName } = this.props;
    const formValues = context.getValues();

    return formValues[fullName] || '';
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
    const { context } = this.props;

    return {
      ...context,
      ...this.state,
      ...this.overrideContextValues('defaultValues'),
      ...this.overrideContextValues('values'),
    };
  }

  /**
   * Checks if the FieldGroup is inside a valid form context
   * and throws an user friendly error if not
   */
  private checkFormContext(): void {
    const { context, fullName } = this.props;
    if (!context || typeof context.registerField !== 'function') {
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
  private overrideContextValues(name: string): TFieldValues {
    const {
      fullName,
      context: { [name]: contextValue },
      [name]: propValue,
    } = this.props;

    if (propValue === undefined) {
      return {
        [name]: contextValue,
      };
    }

    return {
      [name]: {
        ...contextValue,
        ...{
          [fullName]: propValue,
        },
      },
    };
  }

  /**
   * Resets the validation state
   */
  private reset(): void {
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
  private notifyFieldEvent(name: string, event: string, args?: any): void {
    const { fullName, context, validation: { validate } } = this.props;
    context.notifyFieldEvent(name, event, args);

    if (event === 'change' || event === 'blur') {
      const asyncValidateOnChange = this.getAsyncValidateOnChangeSetting();
      if (event === 'change') {
        const localName = name.substring(fullName.length + 1);

        validate(
          {
            ...this.getGroupValue(),
            ...{
              // Override the value of the event sender, because
              // the Field didn't update its state yet, making the
              // Form.getValues() returning an old Field value.
              [localName]: args,
            },
          },
          { checkAsync: asyncValidateOnChange },
        );
      } else if (!asyncValidateOnChange) {
        validate(this.getGroupValue());
      }
    }
  }

  /**
   * Triggers the validation of the group
   * @param args Options for the validate call
   */
  private validate(args?: IValidationArgs): Promise<IValidationState> {
    const { validation: { validate } } = this.props;

    // Overwrite the value of the group state with
    // the parsed one.
    const value = this.getGroupValue();

    return validate(value, args);
  }

  // tslint:disable-next-line:member-ordering
  public render(): JSX.Element {
    const {
      fullName,
      validation: {
        isValidating,
        valid,
        error,
      },
      render: renderProp,
    } = this.props;

    const groupState = {
      fullName,
      isValidating,
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
