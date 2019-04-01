/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { IFieldErrorObject, TFieldError } from '../validators';

/**
 * Parses the validation error and returns either
 * a validation object or undefined
 * @param name field name
 * @param error error message
 */
export const parseValidationError = (name: string, error: TFieldError): IFieldErrorObject | null => {
  if (typeof error === 'object') {
    if (error.message_id === undefined || error.params === undefined) {
      // Error object is invalid
      return null;
    }

    return error;
  }

  if (typeof error === 'string') {
    // Convert the strin to a validation object
    return {
      message_id: error,
      params: {},
    };
  }

  if (error !== undefined) {
    console.error(`[Form] Validation result for the field ${name} was unexpected. Result: ${error}`);
  }

  return null;
};
