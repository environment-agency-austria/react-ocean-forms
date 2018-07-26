/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { toArray } from './utils';
import withForm from './hocs/withForm';
import { formContextShape } from './shapes';

/**
 * Component for displaying a summary of all
 * validation errors of the form this component
 * lives in.
 */
class ValidationSummary extends React.Component {
  constructor(props) {
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
   * Unregisters the field from the form
   */
  componentWillUnmount() {
    const { context, id } = this.props;
    context.unregisterListener(id);
  }

  /**
   * Gets called when a validation state changes
   * @param {string} name Field name
   * @param {string} event Event name
   * @param {object} state Field state
   */
  notify(name, event, state) {
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

  scrollIntoView() {
    const { disableFocusOnSubmit } = this.props;
    if (this.headerRef.current && !disableFocusOnSubmit) {
      this.headerRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  /**
   * Renders a list of all errors
   * @param {Array} errors Error array
   */
  renderErrors(errors) {
    const {
      context: {
        stringFormatter,
      },
    } = this.props;

    return errors.map((error) => {
      const errorArray = toArray(error.error);
      const fieldErrors = errorArray.map((item) => {
        const errorString = stringFormatter(item.message_id, item.params);
        return (
          <span key={`${error.id}_${item.message_id}`}>{errorString}</span>
        );
      });

      // Focuses the invalid field on click on the error message
      const linkCallback = (event) => {
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
      if (renderFieldError !== null) {
        return renderFieldError(
          error.id,
          fieldName,
          fieldErrors,
          linkCallback,
        );
      }

      return ValidationSummary.renderError(
        error.id,
        fieldName,
        fieldErrors,
        linkCallback,
      );
    });
  }

  /**
   * Renders a field error
   * @param {string} id Unique id
   * @param {string} fieldName Name of the field
   * @param {object} errors Field errors
   * @param {function} linkCallback Callback for the error click
   */
  static renderError(id, fieldName, errors, linkCallback) {
    return (
      <li key={id}>
        <a href="#" onClick={linkCallback}>
          {fieldName}: {errors}
        </a>
      </li>
    );
  }

  render() {
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
    const errors = [];

    fieldArray.forEach(([name, state]) => {
      if (state.valid === false) {
        errors.push({
          id: name,
          name: state.label,
          error: state.error,
        });
      }
    });

    // Don't render anything if there are no errors
    if (errors.length === 0) return null;

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
    if (renderProp !== null) {
      return renderProp(summary);
    }

    return summary;
  }
}

ValidationSummary.displayName = 'ValidationSummary';

ValidationSummary.defaultProps = {
  title: 'ojs_form_validationSummaryHeader',
  renderFieldError: null,
  render: null,
  disableFocusOnSubmit: false,
};

ValidationSummary.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  renderFieldError: PropTypes.func,
  render: PropTypes.func,
  context: formContextShape.isRequired,
  disableFocusOnSubmit: PropTypes.bool,
};

export const BaseValidationSummary = ValidationSummary;
export default withForm(ValidationSummary);
