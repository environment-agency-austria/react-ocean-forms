import { useCallback, useMemo } from 'react';

import { useFormContext, useFullName, useValidation, IValidationArgs, IBasicValidationState, useFieldRegistration } from '../../../hooks';
import { IFieldValues, IFormContext } from '../../FormContext';
import { TValidator, TAsyncValidator } from '../../../validators';
import { IFieldGroupRenderParams } from '../FieldGroup.types';

/**
 * Helper function to get the correct value
 * of the group (including all values of the nested fields)
 * @param formContext Form context
 * @param fullName Full name of the field group
 */
function getGroupValue(formContext: IFormContext, fullName: string): IFieldValues | undefined {
  const formValues = formContext.getValues();

  const formValue = formValues[fullName];
  if (formValue === '' || formValue === undefined) {
    return undefined;
  }

  return formValue as IFieldValues;
}

export function useFieldGroup(
  name: string,
  label: string,
  validators: TValidator[] | undefined,
  asyncValidators: TAsyncValidator[] | undefined,
  asyncValidationWait: number | undefined,
  disabled: boolean | undefined,
  plaintext: boolean | undefined,
  asyncValidateOnChange: boolean | undefined,
  defaultValues: IFieldValues | undefined,
  values: IFieldValues | undefined,
): [ IFormContext, IFieldGroupRenderParams ] {
  const formContext = useFormContext();
  const fullName = useFullName(name);
  const [
    validationState,
    validate,
    resetValidation,
    updateValidation,
  ] = useValidation(
    fullName,
    validators,
    asyncValidators,
    asyncValidationWait
  );

  /**
   * Triggers the validation of the group
   */
  const validateGroup = useCallback(
    (args?: Partial<IValidationArgs>): Promise<IBasicValidationState> => {
      const groupValue = getGroupValue(formContext, fullName);
      return validate(groupValue, args);
    },
    [formContext, fullName, validate],
  );

  // Register the group in the formContext, so the group
  // validation can be called on form submit.
  useFieldRegistration(
    fullName,
    label,
    true,
    updateValidation,
    validateGroup,
    resetValidation,
    useCallback(() => ({}), []),
  );

  /**
   * Listens to child field events, triggers validation if
   * needed and passes them to the higher context
   * @param name Field name
   * @param event Event name
   * @param args Event args
   */
  const notifyFieldEvent = useCallback(
    (name: string, event: string, args?: unknown): void => {
      formContext.notifyFieldEvent(name, event, args);

      if (event !== 'change' && event !== 'blur') { return; }

      const localValidateOnChange = asyncValidateOnChange === undefined ? formContext.asyncValidateOnChange : asyncValidateOnChange;
      if (event === 'change') {
        const localName = name.substring(fullName.length + 1);

        const currentGroupValue = getGroupValue(formContext, fullName);
        const intermediateGroupValue = {
          ...(currentGroupValue === undefined ? { } : currentGroupValue),
          ...{
            // Override the value of the event sender, because
            // the Field didn't update its state yet, making the
            // Form.getValues() returning an old Field value.
            [localName]: args,
          },
        };

        void validate(
          intermediateGroupValue as IFieldValues,
          { checkAsync: localValidateOnChange },
        );
      } else if (!localValidateOnChange) {
        void validate(getGroupValue(formContext, fullName));
      }
    },
    [asyncValidateOnChange, formContext, fullName, validate],
  );

  const subContext: IFormContext = useMemo(() => ({
    ...formContext,
    fieldPrefix: fullName,
    notifyFieldEvent,
    disabled: disabled === undefined ? formContext.disabled : disabled,
    plaintext: plaintext === undefined ? formContext.plaintext : plaintext,
    defaultValues: defaultValues === undefined ? formContext.defaultValues : { ...formContext.defaultValues, ... { [fullName]: defaultValues }},
    values: values === undefined ? formContext.values : { ...formContext.values, ... { [fullName]: values }},
  }), [defaultValues, disabled, formContext, fullName, notifyFieldEvent, plaintext, values]);

  const groupState = useMemo(
    () => ({
      fullName,
      isValidating: validationState.isValidating,
      isRequired: validationState.isRequired,
      valid: validationState.valid,
      error: validationState.error,
    }),
    [
      fullName,
      validationState,
    ],
  );

  return [ subContext, groupState ];
}
