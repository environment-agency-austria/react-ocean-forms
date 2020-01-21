/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module useFormText
 * @category Hooks
 * @preferred
 */
import { IMessageValues } from '../../utils';
import { useFormContext } from '../useFormContext';

export function useFormText(id: string, values?: IMessageValues): string {
  const { stringFormatter } = useFormContext();
  return stringFormatter(id, values);
}
