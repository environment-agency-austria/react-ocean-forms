/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TFieldValue } from '../components/Field';
import { IFormContext } from '../components/FormContext';
import { IMessageValues } from '../utils/stringFormatter';

export interface IFieldErrorObject {
  message_id: string;
  params: IMessageValues;
}

export type TFieldError = undefined | string | IFieldErrorObject;

export type TFieldErrors = TFieldError | TFieldError[] | null;

export type TValidator = ((value: TFieldValue, context: IFormContext, ...args: any[]) => TFieldError);

export type TAsyncValidator = ((value: TFieldValue, context: IFormContext, ...args: any[]) => Promise<TFieldError>);
