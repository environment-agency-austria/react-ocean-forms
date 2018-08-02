/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';

import withForm from './hocs/withForm';

/**
 * Wrapper for a button that will
 * automatically disable the button if the
 * form is busy
 */
function FormButton(props) {
  const {
    context: {
      busy,
      disabled: formDisabled,
      submit,
    },
    disabled,
    type,
    onClick,
    submitArgs,
    component: Component,
    ...rest
  } = props;

  const buttonDisabled = busy || formDisabled || disabled;

  /**
   * Calls formContext.submit if the button is not
   * disabled and the type is submit with the given
   * submitParams, otherwise just calls the onClick
   * event handler
   */
  const handleClick = (event) => {
    if (buttonDisabled) {
      event.preventDefault();
      return;
    }

    if (type === 'submit') {
      event.preventDefault();
      submit(submitArgs);
    }

    onClick(event);
  };

  /* eslint-disable react/button-has-type */
  // Type is provided by the props
  return (
    <Component
      type={type}
      disabled={buttonDisabled}
      onClick={handleClick}
      {...rest}
    />
  );
  /* eslint-enable */
}

FormButton.displayName = 'FormButton';

FormButton.defaultProps = {
  component: 'button',
  type: 'submit',
  submitArgs: undefined,
  disabled: false,
  onClick: () => {},
};

FormButton.propTypes = {
  context: PropTypes.shape({
    busy: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
  }).isRequired,
  type: PropTypes.string,
  submitArgs: PropTypes.any, // eslint-disable-line
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  component: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
};

export const BaseFormButton = FormButton;
export default withForm(FormButton);
