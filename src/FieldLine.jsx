/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { fieldMetaShape, fieldShape } from './shapes';
import FieldError from './FieldError';
import FormText from './FormText';
import defaultValidators from './validators';

/**
 * Createa a required *
 * @param {Array} validators Validator array
 */
function createRequiredMarker(validators) {
  if (Array.isArray(validators) && validators.includes(defaultValidators.required)) {
    return <span className="field-required"> *</span>;
  }

  return null;
}

/**
 * Component for displaying bootstrap
 * form groups with any children
 */
function FieldLine(props) {
  const {
    field,
    meta,
    label,
    children,
    validators,
  } = props;

  const groupClass = meta.valid ? 'field-group' : 'field-group is-invalid';

  /* eslint-disable jsx-a11y/label-has-for */
  return (
    <div className={groupClass}>
      <label htmlFor={field.id} className="text-right">
        <FormText text={label} />
        {createRequiredMarker(validators)}
      </label>
      <div className="input-container">
        {children}
        <FieldError
          id={`${field.id}_errors`}
          invalid={!meta.valid}
          error={meta.error}
          stringFormatter={meta.stringFormatter}
        />
      </div>
    </div>
  );
  /* eslint-enable jsx-a11y/label-has-for */
}

FieldLine.displayName = 'FieldLine';

FieldLine.defaultProps = {
  validators: undefined,
};

FieldLine.propTypes = {
  label: PropTypes.string.isRequired,
  meta: fieldMetaShape.isRequired,
  field: fieldShape.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  validators: PropTypes.arrayOf(PropTypes.func),
};

export default FieldLine;
