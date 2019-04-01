import React from 'react';

import { useFullName, useValidation } from '../../hooks';
import { IValidationProp, IValidationWrapperProps } from './ValidationWrapper.types';

/**
 * Component that handles validation of the
 * wrapped component.
 */
export const ValidationWrapper: React.FC<IValidationWrapperProps> = ({ name, validators, asyncValidators, asyncValidationWait, render }): JSX.Element => {
  const fullName = useFullName(name);

  const [
    validationState,
    validate,
    reset,
    update,
  ] = useValidation(
    fullName,
    validators,
    asyncValidators,
    asyncValidationWait
  );

  const validationProp: IValidationProp = {
    ...validationState,
    reset,
    validate,
    update,
  };

  return render(
    fullName,
    validationProp,
  );
};
