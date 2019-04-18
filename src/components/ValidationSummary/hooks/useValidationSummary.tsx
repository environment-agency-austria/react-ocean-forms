import React, { useRef, useCallback, useState } from 'react';

import { useFormContext, IValidationState, useFormEventListener } from '../../../hooks';
import { FieldError } from '../../FieldError';

interface IValidationEventArgs extends IValidationState {
  label: string;
}

export interface IInvalidField {
  id: string;
  name: string;
  error: JSX.Element;
  linkCallback(event: React.MouseEvent): void;
}

export interface IUseValidationSummaryResult {
  headerRef: React.MutableRefObject<HTMLHeadingElement | null>;
  errorList: [string, IInvalidField][];
}

export function useValidationSummary(id: string, disableFocusOnSubmit: boolean): IUseValidationSummaryResult {
  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const [errorList, setErrorList] = useState<[string, IInvalidField][]>([]);
  const { stringFormatter } = useFormContext();

  const handleEvent = useCallback((name: string, event: string, args?: unknown): void => {
    if (event === 'validation') {
      const validationEventArgs = args as IValidationEventArgs;

      // If the field has been reported as valid delete it from our error map
      if (validationEventArgs.valid || validationEventArgs.error === null) {
        setErrorList((oldList) => oldList.filter(([oldName]) => name !== oldName));
        return;
      }

      // Create the individual error renderers
      const renderedErrors = (
        <FieldError
          id={name}
          invalid={!validationEventArgs.valid}
          error={validationEventArgs.error}
        />
      );

      const linkCallback = (event: React.MouseEvent): void => {
        event.preventDefault();
        const input = document.getElementById(name);
        if (input !== null) {
          input.focus();
        }
      };

      // Create the meta information for the error map
      setErrorList((oldList) => {
        return [
          ...oldList.filter(([oldName]) => name !== oldName),
          [
            name,
            {
              id: name,
              name: stringFormatter(validationEventArgs.label),
              error: renderedErrors,
              linkCallback,
            },
          ]
        ];
      });
    } else if (event === 'submit-invalid' && headerRef.current !== null && !disableFocusOnSubmit) {
      headerRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [disableFocusOnSubmit, stringFormatter]);

  useFormEventListener(id, handleEvent);

  return { headerRef, errorList };
}
