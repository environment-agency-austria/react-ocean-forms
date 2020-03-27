/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module FieldError
 * @category Components
 * @preferred
 */

import React from 'react';

import { useFormContext } from '../../hooks';
import { IFieldErrorProps } from './FieldError.types';

/**
 * Component for displaying bootstrap
 * form feedbacks if there are any errors
 */
export const FieldError: React.FC<IFieldErrorProps> = (props) => {
  const { id, invalid, error } = props;

  const { stringFormatter } = useFormContext();

  // If the field isn't invalid do nothing
  if (invalid !== true || error === null) {
    return null;
  }

  // Error could be either an string or an array of strings
  const errorArray = Array.isArray(error) ? error : [error];

  return (
    <>
      {errorArray.map((item) => {
        const errorString = stringFormatter(item.message_id, item.params);

        return <span key={`${id}_${item.message_id}`}>{errorString}</span>;
      })}
    </>
  );
};
FieldError.displayName = 'FieldError';
