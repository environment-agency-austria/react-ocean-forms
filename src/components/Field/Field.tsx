/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';

import { getDeepValue } from '../../utils';
import { IFormContext, TFieldValues } from '../FormContext';
import { IValidationArgs, IValidationState, withValidation } from '../withValidation';
import { IFieldComponentFieldProps, IFieldComponentMeta, IFieldProps, IValueMeta, TFieldValue } from './Field.types';

interface IContextMeta extends IValueMeta {
  defaultValue?: TFieldValue;
  externalValue?: TFieldValue;
}

interface IFieldState {
  touched: boolean;
  dirty: boolean;
  value: TFieldValue;
  contextMeta: IContextMeta;
}

interface IMetaChanges {
  defaultValue: boolean;
  externalValue: boolean;
  meta: boolean;
}

/**
 * Wrapper for input fields managed by
 * the form component
 */
export class BaseField extends React.Component<IFieldProps, IFieldState> {
  public static displayName: string = 'Field';

  // tslint:disable-next-line:typedef
  public static defaultProps = {
    onChange: (): void => undefined,
    onBlur: (): void => undefined,
    getDisplayValue: (value: TFieldValue): TFieldValue => value,
    getSubmitValue: (value: TFieldValue): TFieldValue => value,
  };

  constructor(props: IFieldProps) {
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

    context.registerField(
      fullName,
      {
        label,

        updateValidation,
        validate: this.validate,
        reset: this.reset,
        getValue: this.getValue,
      },
    );

    this.state = {
      touched: false,
      dirty: false,
      value: BaseField.callGetDisplayValue(props, ''),
      contextMeta: {
        disabled: false,
        plaintext: false,
      },
    };
  }

  /**
   * Changes the field value based on changes in Form.defaultValues,
   * Form.values, Field.defaultValue or Field.value. The Field props
   * always override the Form props. Changes in defaultValue will only
   * update the field value, if there is no values or value prop present
   * and if the field hasn't been touched.
   */
  public static getDerivedStateFromProps(nextProps: IFieldProps, prevState: IFieldState): IFieldState | null {
    const {
      context: {
        disabled: newDisabled,
        plaintext: newPlaintext,
      },
    } = nextProps;

    // Get the default value from Field.defaultValue or Form.defaultValues
    const defaultValue = BaseField.getDefaultValue(nextProps);
    // Get the "external" value from Field.value or Form.values
    const externalValue = BaseField.getExternalValue(nextProps);

    // Get changes in default or external value and meta information (plaintext, disabled)
    // Meta information must trigger a state change as well, because they are passed to
    // Field.getDisplayValue and could result in a different return value of that function
    const changes = BaseField.getPropChanges(nextProps, prevState, defaultValue, externalValue);
    // Get the new value based on the information above, or undefined if we don't need any
    // value changes.
    const propValue = BaseField.getPropValue(defaultValue, externalValue, changes);

    // Update the Field state if needed, also remember the current prop values so we can
    // detect changes in the next call of getDerivedStateFromProps.
    if (propValue !== undefined) {
      return ({
        value: BaseField.callGetDisplayValue(nextProps, propValue),
        touched: false,
        dirty: false,
        contextMeta: {
          defaultValue,
          externalValue,
          disabled: newDisabled,
          plaintext: newPlaintext,
        },
      });
    }

    return null;
  }

  /**
   * Correctly calls the getDisplayValue callback
   * @param props Field props
   * @param value Field value
   */
  private static callGetDisplayValue(props: IFieldProps, value: TFieldValue | undefined): TFieldValue {
    const { getDisplayValue, context } = props;

    return getDisplayValue(
      value || '',
      BaseField.getValueMeta(context),
    );
  }

  /**
   * Calculates the new state value based on the parameters - it will return
   * the externalValue if it exists and has changes, or the default value
   * otherwise. If no state update is needed it will return undefined. Meta
   * changes will trigger a state change as well.
   * @param defaultValue Default value
   * @param externalValue External value
   * @param changes Changes object
   */
  private static getPropValue(
    defaultValue: TFieldValue | undefined, externalValue: TFieldValue | undefined, changes: IMetaChanges,
  ): TFieldValue | undefined {
    const hasExternalValue = externalValue !== undefined;

    if (hasExternalValue && (changes.externalValue || changes.meta)) {
      return externalValue;
    }

    if (!hasExternalValue && (changes.defaultValue || changes.meta)) {
      return defaultValue;
    }

    return undefined;
  }

  /**
   * Detects changes in the defaultValue, the externalValue and in
   * context.disabled or context.plaintext (merged as meta prop)
   * @param props Field props
   * @param state Field state
   * @param defaultValue Default value
   * @param externalValue External value
   */
  private static getPropChanges(
    props: IFieldProps, state: IFieldState, defaultValue: TFieldValue | undefined, externalValue: TFieldValue | undefined,
  ): IMetaChanges {
    const {
      context: {
        disabled: newDisabled,
        plaintext: newPlaintext,
      },
    } = props;

    const {
      contextMeta: {
        defaultValue: oldDefaultValue,
        externalValue: oldExternalValue,
        disabled: oldDisabled,
        plaintext: oldPlaintext,
      },
      touched,
    } = state;

    return {
      defaultValue: !touched && defaultValue !== oldDefaultValue,
      externalValue: externalValue !== oldExternalValue,
      meta: newDisabled !== oldDisabled || newPlaintext !== oldPlaintext,
    };
  }

  /**
   * Returns the local value if existing, otherwise tries to
   * extract the correct context value based on the fullName.
   * @param localValue Local value
   * @param contextValue Context value
   * @param fullName Field.fullName
   */
  private static getLocalOverridenValue(
    localValue: TFieldValue | undefined, contextValue: TFieldValues | undefined, fullName: string,
  ): TFieldValue | undefined {
    return localValue || getDeepValue(fullName, contextValue);
  }

  /**
   * Returns either the Field.value or the correct value from
   * Form.values
   * @param props Field props
   */
  private static getExternalValue(props: IFieldProps): TFieldValue | undefined {
    const { fullName, context: { values }, value } = props;

    return BaseField.getLocalOverridenValue(value, values, fullName);
  }

  /**
   * Returns either the Field.defaultValue or the correct default value
   * from Form.defaultValues
   * @param props Field props
   */
  private static getDefaultValue(props: IFieldProps): TFieldValue | undefined {
    const { fullName, context: { defaultValues }, defaultValue } = props;

    return BaseField.getLocalOverridenValue(defaultValue, defaultValues, fullName);
  }

  /**
   * Returns a meta object for the value lifecycle hooks
   * @param context Form context
   */
  private static getValueMeta(context: IFormContext): IValueMeta {
    return {
      disabled: context.disabled,
      plaintext: context.plaintext,
    };
  }

  /**
   * Unregisters the field from the form
   */
  public componentWillUnmount(): void {
    const { context, fullName } = this.props;
    context.unregisterField(fullName);
  }

  /**
   * Returns the current field value
   */
  private getValue = (): TFieldValue => {
    const { value } = this.state;
    const { getSubmitValue, context } = this.props;

    return getSubmitValue(
      value,
      BaseField.getValueMeta(context),
    );
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
   * Checks if the Field is inside a valid form context
   * and throws an user friendly error if not
   */
  private checkFormContext(): void {
    const { context, fullName } = this.props;
    if (!context || typeof context.registerField !== 'function') {
      throw new Error(
        `Could not find a form context for field "${fullName}". `
        + 'Fields can only be used inside a Form tag.',
      );
    }
  }

  /**
   * Resets the field to its default state
   */
  private reset = (): void => {
    const { contextMeta: { externalValue, defaultValue } } = this.state;
    const { validation, onChange } = this.props;

    const value = BaseField.callGetDisplayValue(
      this.props,
      externalValue || defaultValue,
    );

    this.setState({
      value,
      touched: false,
      dirty: false,
    });

    validation.reset();
    onChange(value);
  }

  /**
   * Validates the field
   * @param args Validation arguments
   */
  private validate = async (args?: Partial<IValidationArgs>): Promise<IValidationState> => {
    const { value } = this.state;
    const { validation: { validate }, getSubmitValue, context } = this.props;

    return validate(
      getSubmitValue(
        value,
        BaseField.getValueMeta(context),
      ),
      args,
    );
  }

  /**
   * Handles the change event of an input field -
   * triggers any validation if needed and updates
   * the field state accordingly.
   * @param event Event object
   */
  private handleFieldChanged = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    const {
      fullName,
      context,
      validation: { validate },
      getSubmitValue,
      onChange,
    } = this.props;

    this.setState({
      value,
      dirty: true,
      touched: true,
    });

    const asyncValidateOnChange = this.getAsyncValidateOnChangeSetting();
    const submitValue = getSubmitValue(
      value,
      BaseField.getValueMeta(context),
    );

    validate(
      submitValue,
      { checkAsync: asyncValidateOnChange },
    );

    context.notifyFieldEvent(fullName, 'change', submitValue);
    onChange(submitValue);
  }

  /**
   * Handles the blur event of an input field -
   * triggers any validation if needed and updates
   * the field state accordingly.
   */
  private handleFieldBlurred = (): void => {
    const {
      fullName,
      validation: { validate },
      context,
      onBlur,
      getSubmitValue,
    } = this.props;
    const { value, dirty } = this.state;

    const asyncValidateOnChange = this.getAsyncValidateOnChangeSetting();
    const submitValue = getSubmitValue(
      value,
      BaseField.getValueMeta(context),
    );

    if (dirty && !asyncValidateOnChange) { validate(submitValue); }
    context.notifyFieldEvent(fullName, 'blur');
    onBlur();
  }

  /**
   * Creates the properties that can be directly
   * mapped to the input component (e.g. html input)
   */
  private createFieldProps(): IFieldComponentFieldProps {
    const { context: { disabled }, fullName } = this.props;
    const { value } = this.state;

    return {
      value,
      disabled,
      id: fullName,
      name: fullName,
      onChange: this.handleFieldChanged,
      onBlur: this.handleFieldBlurred,
    };
  }

  /**
   * Creates the meta properties with meta information
   * used by the input component
   */
  private createMetaProps(): IFieldComponentMeta {
    const {
      context: {
        stringFormatter,
        plaintext,
      },
      validation: {
        valid,
        error,
        isValidating,
      },
    } = this.props;

    const { touched } = this.state;

    return {
      valid,
      error,
      isValidating,
      touched,
      stringFormatter,
      plaintext,
    };
  }

  // tslint:disable-next-line:member-ordering
  public render(): JSX.Element {
    const {
      // tslint:disable-next-line:naming-convention
      component: InputComponent,
      context,
      fullName,
      validation,
      onChange,
      onBlur,
      defaultValue,
      value,
      name,
      asyncValidateOnChange,
      getDisplayValue,
      getSubmitValue,
      ...attributes
    } = this.props;

    const field = this.createFieldProps();
    const meta = this.createMetaProps();

    return (
      <InputComponent
        {...attributes}
        field={field}
        meta={meta}
      />
    );
  }
}

export const Field = withValidation(BaseField);
