import * as React from 'react';
import { IFormContext } from './FormContext.types';

/**
 * Context for the communication between the form
 * and its fields.
 */
export const FormContext = React.createContext<IFormContext | undefined>(undefined);
