/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module FormText
 * @category Components
 * @preferred
 */
import React from 'react';

import { useFormContext } from '../../hooks';
import { IFormTextProps } from './FormText.types';

/**
 * Wrapper for text output. It will use the Form.stringFormatter function to
 * output the message passed through the props. Best practice for custom input
 * component development is to pass every text output through the stringFormatter.
 * This enables the user of the form to add the react-ocean-forms-react-intl package
 * and get i18n support out of the box.
 */
export const FormText: React.FC<IFormTextProps> = ({ text, values }) => {
  const context = useFormContext();
  if (text === '' || text === null) {
    return null;
  }

  return <React.Fragment>{context.stringFormatter(text, values)}</React.Fragment>;
};
FormText.displayName = 'FormText';
