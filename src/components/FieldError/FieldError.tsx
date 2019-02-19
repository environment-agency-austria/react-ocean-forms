/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { toArray } from '../../utils';
import { IFieldErrorProps } from './FieldError.types';

/**
 * Component for displaying bootstrap
 * form feedbacks if there are any errors
 */
export const FieldError: React.SFC<IFieldErrorProps> = (props: IFieldErrorProps): JSX.Element | null => {
  const {
    id,
    invalid,
    error,
    stringFormatter,
  } = props;

  // If the field isn't invalid do nothing
  if (invalid !== true || error === null) { return null; }

  // Error could be either an string or an array of strings
  const errorArray = toArray(error);

  return (
    <React.Fragment>
      {errorArray.map((item) => {
        const errorString = stringFormatter(item.message_id, item.params);

        return <span key={`${id}_${item.message_id}`}>{errorString}</span>;
      })}
    </React.Fragment>
  );
};
FieldError.displayName = 'FieldError';
