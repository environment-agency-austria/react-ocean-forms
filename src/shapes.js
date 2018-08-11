/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';

/**
 * Shape for error messages
 */
export const errorShape = PropTypes.shape({
  message_id: PropTypes.string.isRequired,
  params: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ])),
});

/**
 * Shape for (possible) collection of errors
 */
export const errorsShape = PropTypes.oneOfType([
  errorShape,
  PropTypes.arrayOf(errorShape),
]);

/**
 * Shape for the allowed field values
 */
export const fieldValueShape = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.objectOf(PropTypes.string),
  PropTypes.bool,
  PropTypes.number,
]);

/**
 * Shape of the complete form context
 */
export const formContextShape = PropTypes.shape({
  fieldPrefix: PropTypes.string,

  registerField: PropTypes.func.isRequired,
  unregisterField: PropTypes.func.isRequired,
  notifyFieldEvent: PropTypes.func.isRequired,

  registerListener: PropTypes.func.isRequired,
  unregisterListener: PropTypes.func.isRequired,

  getFieldState: PropTypes.func.isRequired,
  getValues: PropTypes.func.isRequired,

  submit: PropTypes.func.isRequired,

  busy: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,

  defaultValues: PropTypes.objectOf(fieldValueShape),
  asyncValidateOnChange: PropTypes.bool.isRequired,
  asyncValidationWait: PropTypes.number.isRequired,
  stringFormatter: PropTypes.func.isRequired,
  plaintext: PropTypes.bool.isRequired,
});

/**
 * Shape of the field meta data
 */
export const fieldMetaShape = PropTypes.shape({
  valid: PropTypes.bool,
  error: errorsShape,
  isValidating: PropTypes.bool,
  touched: PropTypes.bool,
  stringFormatter: PropTypes.func.isRequired,
  plaintext: PropTypes.bool.isRequired,
});

/**
 * Shape of the field parameters
 */
export const fieldShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: fieldValueShape.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
});

/**
 * Shape of the withValidation paramaters
 */
export const validationShape = PropTypes.shape({
  validate: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  isValidating: PropTypes.bool.isRequired,
  valid: PropTypes.bool.isRequired,
  error: errorsShape,
});
