/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { IUseFieldGroupArgs, IFieldGroupRenderParams } from './hooks/useFieldGroup.types';

/**
 * Props for the field group component
 */
export interface IFieldGroupProps extends IUseFieldGroupArgs {
  /**
   * Render prop
   * @param params Meta information about the group
   */
  render(params: IFieldGroupRenderParams): JSX.Element;
}
