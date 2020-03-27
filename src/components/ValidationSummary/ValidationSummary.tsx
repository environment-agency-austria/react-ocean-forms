/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module ValidationSummary
 * @category Components
 * @preferred
 */
import React from 'react';

import { IValidationSummaryProps } from './ValidationSummary.types';
import { useValidationSummary } from './hooks/useValidationSummary';
import { FormText } from '../FormText';

/**
 * Renders a field error
 * @param id Unique id
 * @param fieldName Name of the field
 * @param errors Field errors
 * @param linkCallback Callback for the error click
 */
function defaultRenderFieldError(
  id: string,
  fieldName: string,
  errors: React.ReactNode,
  linkCallback: React.MouseEventHandler
): React.ReactNode {
  return (
    <li key={id}>
      <a href={`#${id}`} onClick={linkCallback}>
        {fieldName}: {errors}
      </a>
    </li>
  );
}

/**
 * Displays a clickable list of errors from the current form. When an
 * error is clicked, the corresponding input field is focused.
 */
export const ValidationSummary: React.FC<IValidationSummaryProps> = (props) => {
  const {
    id,
    title = 'ojs_form_validationSummaryHeader',
    disableFocusOnSubmit = false,
    renderFieldError = defaultRenderFieldError,
    render,
  } = props;

  const { headerRef, errorList } = useValidationSummary(id, disableFocusOnSubmit);

  const renderedErrors = errorList.map(([, value]) =>
    renderFieldError(value.id, value.name, value.error, value.linkCallback)
  );

  // Don't render anything if there are no errors
  if (renderedErrors.length === 0) {
    return null;
  }

  const summary = (
    <div id={id} className="validation-summary">
      <h4 className="alert-heading" ref={headerRef}>
        <FormText text={title} />
      </h4>
      <ul>{renderedErrors}</ul>
    </div>
  );

  // Use an optional render prop if the user
  // wants to customize the look and feel of
  // the validation summary
  if (render !== undefined) {
    return render(summary);
  }

  return summary;
};
