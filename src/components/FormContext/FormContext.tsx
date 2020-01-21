/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module FormContext
 * @category Components
 * @preferred
 */
import React from 'react';
import { IFormContext } from './FormContext.types';

/**
 * Context for the communication between the form
 * and its fields.
 */
export const FormContext = React.createContext<IFormContext | undefined>(undefined);
