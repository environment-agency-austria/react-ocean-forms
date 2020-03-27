/**
 * Copyright (c) 2018-present, Umweltbundesamt GmbH
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @packageDocumentation
 * @module ValidationSummary
 */
import React, { useRef, useCallback, useState } from 'react';

import { useFormContext, IValidationState, useFormEventListener } from '../../../hooks';
import { FieldError } from '../../FieldError';

interface IValidationEventArgs extends IValidationState {
  label: string;
}

/**
 * @hidden
 */
export interface IInvalidField {
  id: string;
  name: string;
  error: React.ReactNode;
  linkCallback(event: React.MouseEvent): void;
}

/**
 * @hidden
 */
export interface IUseValidationSummaryResult {
  headerRef: React.MutableRefObject<HTMLHeadingElement | null>;
  errorList: [string, IInvalidField][];
}

/**
 * Custom hook for the validation summary logic
 * @param id Id of the validation summary
 * @param disableFocusOnSubmit If set to true the validation summary will stop automatically scrolling to itself when the user clicks on a submit button and the form is invalid.
 * @hidden
 */
export function useValidationSummary(
  id: string,
  disableFocusOnSubmit: boolean
): IUseValidationSummaryResult {
  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const [errorList, setErrorList] = useState<[string, IInvalidField][]>([]);
  const { stringFormatter } = useFormContext();

  const handleEvent = useCallback(
    (name: string, event: string, args?: unknown): void => {
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
            ],
          ];
        });
      } else if (
        event === 'submit-invalid' &&
        headerRef.current !== null &&
        !disableFocusOnSubmit
      ) {
        headerRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    },
    [disableFocusOnSubmit, stringFormatter]
  );

  useFormEventListener(id, handleEvent);

  return { headerRef, errorList };
}
