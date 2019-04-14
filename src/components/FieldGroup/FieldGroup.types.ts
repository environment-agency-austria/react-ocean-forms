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
   * Gets called to render its children (see render prop pattern).
   * @param params Contains the group state consisting of fullName,
   * isValidating,valid, error which can be used to display those informations.
   */
  render(params: IFieldGroupRenderParams): JSX.Element;
}
