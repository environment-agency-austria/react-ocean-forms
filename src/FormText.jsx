/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import PropTypes from 'prop-types';
import withForm from './hocs/withForm';

function FormText({ context, text, values }) {
  if (!text) return null;

  return context.stringFormatter(text, values);
}

FormText.displayName = 'FormText';

FormText.propTypes = {
  context: PropTypes.shape({
    stringFormatter: PropTypes.func.isRequired,
  }).isRequired,
  text: PropTypes.string,
  values: PropTypes.object, // eslint-disable-line
};

export const BaseFormText = FormText;
export default withForm(FormText);
