/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { getDeepValue, parseValidationError } from '../../utils';
import { stringFormatter as defaultStringFormatter } from '../../utils/stringFormatter';
import { FormContext, IBaseFormContext, IFieldState, IFieldValues, IFormContext, TFormEventListener } from '../FormContext';
import { IValidationState } from '../withValidation';
import { IFormProps } from './Form.types';

interface IFormState<TFieldValues = IFieldValues> {
  context: IBaseFormContext<TFieldValues>;
}

/**
 * Wrapper for managed forms
 */
export class Form<TFieldValues = IFieldValues, TSubmitArgs = unknown>
extends React.Component<IFormProps<TFieldValues, TSubmitArgs>, IFormState<TFieldValues>> {
  public static displayName: string = 'Form';

  // tslint:disable-next-line:typedef
  public static defaultProps = {
    defaultValues: {},
    asyncValidationWait: 400,
    asyncValidateOnChange: false,
    formatString: defaultStringFormatter,
    disabled: false,
    plaintext: false,
  };

  private readonly fields: Map<string, IFieldState> = new Map();
  private readonly eventListeners: Map<string, TFormEventListener> = new Map();

  constructor(props: IFormProps<TFieldValues>) {
    super(props);

    this.state = {
      context: {
        fieldPrefix: null,

        registerField: this.registerField,
        unregisterField: this.unregisterField,
        notifyFieldEvent: this.notifyFieldEvent,

        registerListener: (name: string, callback: TFormEventListener): void => { this.eventListeners.set(name, callback); },
        unregisterListener: (name: string): void => { this.eventListeners.delete(name); },

        getFieldState: this.getFieldState,
        getValues: this.getValues,

        submit: this.submit,

        busy: false,
      },
    };
  }

  /**
   * Returns the current state of the given field
   * @param name Field name
   * @returns Current field state or default field state
   */
  private getFieldState = (name: string): IFieldState => {
    const fieldState = this.fields.get(name);
    if (fieldState === undefined) {
      throw new Error(`[Form] getFieldState: Could not find state of field '${name}'`);
    }

    return fieldState;
  }

  /**
   * Generates and returns an object that contains
   * all values from all the fields.
   * @returns Current values in form of { name: value, name2: value2, ... }
   */
  private getValues = (): TFieldValues => {
    const values: IFieldValues = {};

    this.fields.forEach((state, name) => {
      if (state.isGroup === true) { return; }

      const nameParts = name.split('.');
      let valueRef = values;

      nameParts.forEach((key, index) => {
        if (nameParts.length === 1 || index === nameParts.length - 1) {
          valueRef[key] = state.getValue();
        } else {
          if (valueRef[key] === undefined) { valueRef[key] = {}; }
          valueRef = valueRef[key] as IFieldValues;
        }
      });
    });

    return (values as unknown) as TFieldValues;
  }

  /**
   * Gets called when a field triggers an event
   * @param name Field name
   * @param event Event name
   * @param args Event args
   */
  private notifyFieldEvent = (name: string, event: string, args?: unknown): void => {
    if (event === 'validation') {
      const { label } = this.getFieldState(name);
      this.notifyListeners(name, event, { ...args, label });
    } else {
      this.notifyListeners(name, event, args);
    }
  }

  /**
   * Notifies the event listeners about an event
   * @param name Field name
   * @param event Event name
   * @param args Event args
   */
  private notifyListeners(name: string, event: string, args?: unknown): void {
    this.eventListeners.forEach((callback) => {
      callback(name, event, args);
    });
  }

  /**
   * Handles the submit event of the form - prevents
   * the default and runs the submit logic
   * @param event Event object
   */
  private handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    void this.submit();
  }

  /**
   * Submits the form - triggers any validations if needed
   * and raises the onFormSubmit prop callback if the
   * form is currently valid.
   * @param submitArgs Arguments that will be passed
   * to the onSubmit callback
   */
  private submit = async (submitArgs?: TSubmitArgs): Promise<void> => {
    this.updateBusyState(true);

    // Iterate through all fields and validate them
    // if needed.
    const validations: Promise<IValidationState>[] = [];
    this.fields.forEach(field => {
      validations.push(field.validate({
        checkAsync: true,
        immediateAsync: true,
      }));
    });

    const validationStates = await Promise.all(validations);

    // Check if all fields are valid
    const allValid = validationStates.every(state => state.valid === true);
    if (allValid === false) {
      this.notifyFieldEvent('_form', 'submit-invalid');
      this.updateBusyState(false);

      return;
    }

    // Call the form wide validation
    const formValid = this.triggerFormValidation();
    if (formValid === false) {
      this.notifyFieldEvent('_form', 'submit-invalid');
      this.updateBusyState(false);

      return;
    }

    // Await the result from callOnSubmit
    const callOnSubmitResult = this.callOnSubmit(submitArgs);
    const { resetOnSubmit } = this.props;

    // Make sure the state is cleaned up before
    const cleanup = (resetForm: boolean | undefined): void => {
      this.updateBusyState(false);
      if (resetForm) { this.reset(); }
    };
    if (callOnSubmitResult instanceof Promise) {
      void callOnSubmitResult.then(
        () => { cleanup(resetOnSubmit); },
      );
    } else {
      cleanup(resetOnSubmit);
    }
  }

  /**
   * Updates the busy state in the form context
   * @param busy Busy state
   */
  private updateBusyState(busy: boolean): void {
    this.setState(prevState => ({
      context: {
        ...prevState.context,
        busy,
      },
    }));
  }

  /**
   * Triggers the form wide validation callback if given
   * @returns Validation state of the form
   */
  private triggerFormValidation(): boolean {
    const { onValidate } = this.props;
    if (onValidate === undefined) { return true; }

    const values = this.getValues();
    const result = onValidate(values);

    // If the callback returned null then the form is valid
    if (result === null) { return true; }

    // Otherwise parse the result object and update the
    // field states.
    let allFieldsValid = true;
    this.fields.forEach((state, name) => {
      const fieldError = parseValidationError(name, getDeepValue(name, result));
      const isValid = fieldError === null || typeof fieldError !== 'object';

      if (isValid) { return; }

      state.updateValidation({
        valid: false,
        error: fieldError,
      });
      allFieldsValid = false;
    });

    return allFieldsValid;
  }

  /**
   * Gathers all the data and calls the onSubmit callback
   * if provided.
   * @param submitArgs Arguments that will be passed
   * to the onSubmit callback
   */
  private callOnSubmit(submitArgs?: TSubmitArgs): void | Promise<void> {
    const { onSubmit } = this.props;
    if (onSubmit === undefined) { return; }

    const values = this.getValues();

    return onSubmit(values, submitArgs);
  }

  /**
   * Handles the reset event of the form - prevents
   * the default and sets the state of all fields back
   * to the default state.
   * @param event Event object
   */
  private handleReset = (event: React.FormEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    this.reset();
  }

  /**
   * Sets the state of all fields back
   * to the default state.
   */
  private reset = (): void => {
    this.fields.forEach((state) => {
      state.reset();
    });

    const { onReset } = this.props;
    if (onReset !== undefined) {
      onReset();
    }
  }

  /**
   * Registers a new field to the form.
   * @param name Field name
   * @param fieldState Field state
   */
  private registerField = (name: string, fieldState: IFieldState): void => {
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('[Form] registerField: name is required');
    }

    if (typeof fieldState !== 'object') {
      throw new Error('[Form] registerField: field state is required');
    }

    if (
      typeof fieldState.label !== 'string'
      || typeof fieldState.validate !== 'function'
      || typeof fieldState.updateValidation !== 'function'
      || typeof fieldState.reset !== 'function'
      || typeof fieldState.getValue !== 'function'
    ) {
      throw new Error('[Form] registerField: invalid field state given');
    }

    this.fields.set(name, fieldState);
  }

  /**
   * Unregisters a field from the form.
   * @param name Field name
   */
  private unregisterField = (name: string): void => {
    const { label } = this.getFieldState(name);
    this.notifyListeners(name, 'validation', {
      label,
      valid: true,
    });
    this.fields.delete(name);
  }

  /**
   * Combines the local form context with
   * the values from the props to form the
   * full form context passed to the form
   * components.
   */
  private prepareFormContext(): IFormContext<TFieldValues> {
    const { context } = this.state;
    const {
      defaultValues,
      values,
      asyncValidateOnChange,
      asyncValidationWait,
      formatString: stringFormatter,
      disabled,
      plaintext,
      busy: busyProp,
    } = this.props;

    // Override the busy state with the busy prop if it is set to true
    const busy = busyProp === true ? busyProp : context.busy;

    return {
      ...context,
      defaultValues,
      values,
      asyncValidationWait,
      stringFormatter,
      disabled,
      plaintext,
      busy,
      asyncValidateOnChange: asyncValidateOnChange,
    };
  }

  /**
   * Renders the form and wraps all its children
   * in a FormContext provider and a html form.
   */
  // tslint:disable-next-line:member-ordering
  public render(): JSX.Element {
    const {
      children,
      className,
      plaintext,
    } = this.props;

    const context = this.prepareFormContext();

    let formClass = className === undefined ? '' : className;
    if (plaintext) { formClass = `${formClass} plaintext`; }

    // tslint:disable-next-line:naming-convention
    const TypedFormContext = (FormContext as unknown) as React.Context<IFormContext<TFieldValues | undefined>>;

    return (
      <TypedFormContext.Provider value={context}>
        <form className={formClass} onSubmit={this.handleSubmit} onReset={this.handleReset}>
          {children}
        </form>
      </TypedFormContext.Provider>
    );
  }
}
