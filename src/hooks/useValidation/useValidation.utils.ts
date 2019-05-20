import { TValidator, isDefaultValidator, isIFieldErrorObject, TAsyncValidator } from '../../validators';
import { IBasicValidationState } from './useValidation.types';
import { IFormContext } from '../../components';
import { parseValidationError } from '../../utils';

/**
 * Checks if the given validators contain at least one default
 * validator
 * @param validators Sync validators provided through props
 */
export function isRequired<TFieldValue = unknown>(validators?: TValidator<TFieldValue>[]): boolean {
  return Array.isArray(validators) && validators.some(isDefaultValidator);
}

/**
 * Creates the initial / default validation state of a
 * validated component
 * @param validators Sync validators provied through props
 */
export function createInitialValidationState(): IBasicValidationState {
  return {
    valid: true,
    error: null,
    isValidating: false,
  }
}

/**
 * Executes the sync validators and returns updates
 * to the validation state
 * @param validators Array of validator functions
 * @param value Value to be validated
 * @param formContext Form context
 */
export function runSyncValidators<TFieldValue = unknown>(
  validators: TValidator<TFieldValue>[] | undefined,
  value: TFieldValue | undefined,
  formContext: IFormContext,
): Partial<IBasicValidationState> {
  // No sync validators given - do nothing
  if (!Array.isArray(validators)) return { };

  for (let i = 0; i < validators.length; i++) {
    const validator = validators[i];

    const result = validator(value, formContext);
    const parsedResult = parseValidationError(result);
    if (isIFieldErrorObject(parsedResult)) {
      return {
        valid: false,
        error: parsedResult,
      };
    }
  }

  return { };
}

/**
 * Executes the async validators and returns the validation
 * state based on the results
 * @param validators Array of async validator functions
 * @param value Value to be validated
 * @param formContext Form context
 */
export async function runAsyncValidators<TFieldValue = unknown>(
  validators: TAsyncValidator<TFieldValue>[],
  value: TFieldValue | undefined,
  formContext: IFormContext,
): Promise<IBasicValidationState> {
  const validationResults = await Promise.all(validators.map(
    async validator => validator(value, formContext),
  ))
  const parsedErrors = validationResults.map(result => parseValidationError(result)).filter(isIFieldErrorObject);

  if (parsedErrors.length === 0) {
    return createInitialValidationState();
  }

  return {
    valid: false,
    isValidating: false,
    error: parsedErrors,
  };
}
