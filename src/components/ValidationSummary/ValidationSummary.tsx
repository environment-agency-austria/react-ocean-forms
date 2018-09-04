/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';

import { toArray } from '../../utils';
import { IFieldErrorObject } from '../../validators';
import { IFormContextProps, withForm } from '../withForm';
import { IValidationState } from '../withValidation';

interface IValidationSummaryProps extends IFormContextProps {
  id: string;
  title: string;
  disableFocusOnSubmit: boolean;
  renderFieldError?(id: string, fieldName: string, errors: React.ReactNode, linkCallback: React.MouseEventHandler): JSX.Element;
  render?(children: JSX.Element): JSX.Element;
}

interface IValidationEventArgs extends IValidationState {
  label: string;
}

interface IInvalidField {
  id: string;
  name: string;
  error: IFieldErrorObject | IFieldErrorObject[];
}

interface IFieldContainer {
  [s: string]: IValidationEventArgs;
}

interface IValidationSummaryState {
  fields: IFieldContainer;
}

/**
 * Component for displaying a summary of all
 * validation errors of the form this component
 * lives in.
 */
export class BaseValidationSummary extends React.Component<IValidationSummaryProps, IValidationSummaryState> {
  public static displayName: string = 'ValidationSummary';

  // tslint:disable-next-line:typedef
  public static defaultProps = {
    title: 'ojs_form_validationSummaryHeader',
    disableFocusOnSubmit: false,
  };

  private headerRef: React.RefObject<HTMLHeadingElement>;

  constructor(props: IValidationSummaryProps) {
    super(props);

    this.headerRef = React.createRef();

    this.notify = this.notify.bind(this);
    this.scrollIntoView = this.scrollIntoView.bind(this);

    const { context: { registerListener }, id } = props;
    registerListener(id, this.notify);

    this.state = {
      fields: {},
    };
  }

  /**
   * Renders a field error
   * @param id Unique id
   * @param fieldName Name of the field
   * @param errors Field errors
   * @param linkCallback Callback for the error click
   */
  private static renderError(id: string, fieldName: string, errors: JSX.Element[], linkCallback: React.MouseEventHandler): JSX.Element {
    return (
      <li key={id}>
        <a href={`#${id}`} onClick={linkCallback}>
          {fieldName}
          :
          {' '}
          {errors}
        </a>
      </li>
    );
  }

  /**
   * Unregisters the field from the form
   */
  public componentWillUnmount(): void {
    const { context, id } = this.props;
    context.unregisterListener(id);
  }

  /**
   * Gets called when a validation state changes
   * @param name Field name
   * @param event Event name
   * @param state Field state
   */
  private notify(name: string, event: string, state: IValidationEventArgs): void {
    if (event === 'validation') {
      this.setState(oldState => ({
        fields: {
          ...oldState.fields,
          [name]: state,
        },
      }));
    } else if (event === 'submit-invalid') {
      this.scrollIntoView();
    }
  }

  private scrollIntoView(): void {
    const { disableFocusOnSubmit } = this.props;
    if (this.headerRef.current && !disableFocusOnSubmit) {
      this.headerRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  /**
   * Renders a list of all errors
   * @param errors Error array
   */
  private renderErrors(errors: IInvalidField[]): JSX.Element[] {
    const {
      context: {
        stringFormatter,
      },
    } = this.props;

    return errors.map((error: IInvalidField) => {
      const errorArray = toArray(error.error);
      const fieldErrors = errorArray.map((item) => {
        const errorString = stringFormatter(item.message_id, item.params);

        return (
          <span key={`${error.id}_${item.message_id}`}>{errorString}</span>
        );
      });

      // Focuses the invalid field on click on the error message
      const linkCallback = (event: React.MouseEvent<Element>): void => {
        event.preventDefault();
        const input = document.getElementById(error.id);
        if (input) {
          input.focus();
        }
      };

      const fieldName = stringFormatter(error.name);

      // Use an optional render prop if the user
      // wants to customize the output of the error
      const { renderFieldError } = this.props;
      if (renderFieldError !== undefined) {
        return renderFieldError(
          error.id,
          fieldName,
          fieldErrors,
          linkCallback,
        );
      }

      return BaseValidationSummary.renderError(
        error.id,
        fieldName,
        fieldErrors,
        linkCallback,
      );
    });
  }

  // tslint:disable-next-line:member-ordering
  public render(): JSX.Element | null {
    const {
      id,
      title,
      context: {
        stringFormatter,
      },
    } = this.props;

    const { fields } = this.state;

    // Fetch the current errors out of the form context
    const fieldArray = Object.entries(fields);
    const errors: IInvalidField[] = [];

    fieldArray.forEach(([name, state]) => {
      if (state.valid === false && state.error !== null) {
        errors.push({
          id: name,
          name: state.label,
          error: state.error,
        });
      }
    });

    // Don't render anything if there are no errors
    if (errors.length === 0) { return null; }

    const renderedErrors = this.renderErrors(errors);
    const titleString = stringFormatter(title);

    const summary = (
      <div id={id} className="validation-summary">
        <h4 className="alert-heading" ref={this.headerRef}>{titleString}</h4>
        <ul>
          {renderedErrors}
        </ul>
      </div>
    );

    // Use an optional render prop if the user
    // wants to customize the look and feel of
    // the validation summary
    const { render: renderProp } = this.props;
    if (renderProp !== undefined) {
      return renderProp(summary);
    }

    return summary;
  }
}

export const ValidationSummary = withForm(BaseValidationSummary);
