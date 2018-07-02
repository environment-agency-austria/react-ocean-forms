/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { toArray } from './utils';
import { errorsShape } from './shapes';


/**
 * Component for displaying bootstrap
 * form feedbacks if there are any errors
 */
function FieldError(props) {
  const {
    id,
    invalid,
    error,
    stringFormatter,
  } = props;

  // If the field isn't invalid do nothing
  if (invalid !== true || error === null) return null;

  // Error could be either an string or an array of strings
  const errorArray = toArray(error);
  const errors = errorArray.map((item) => {
    const errorString = stringFormatter(item.message_id, item.params);
    return <span key={`${id}_${item.message_id}`}>{errorString}</span>;
  });

  return errors;
}

FieldError.defaultProps = {
  error: null,
};

FieldError.propTypes = {
  id: PropTypes.string.isRequired,
  invalid: PropTypes.bool.isRequired,
  error: errorsShape,
  stringFormatter: PropTypes.func.isRequired,
};

export default FieldError;
