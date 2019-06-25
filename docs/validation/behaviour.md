Validators can be triggered by three events: **change** or **blur** of a Field / FieldGroup,
or **submit** of the Form. The validation will be performed as following:

## Field or FieldGroup onChange
1. Invoke the **synchronous validators** of a Field. The validators will be called one by one,
regarding of their position in the validators Array. If a validator returns an error, the
subsequential validators will **not** be called.

2. If the prop **asyncValidateOnChange** is set to true (either on the Field or the Form), then
the Form will wait the time defined in **asyncValidationWait** to see if the user will change the
input again.
If the value didn't change and the synchronous validators are all valid, then the
**asynchronous validators** will be called. All the validators are called at the same time and the
Field will wait for the result of each of them.

3. If any of the validators return an error, the field is marked as invalid.

## Field onBlur
1. If the field value didn't change since the last validation and the prop **asyncValidateOnChange**
is true,  then the validation won't be called again. This is to prevent unnecessary async validations.
Otherwise:

2. Invoke the **synchronous validators** of a Field. The validators will be called one by one,
regarding of their position in the validators Array. If a validator returns an error,
the subsequential validators will not be called.

3. The **asynchronous validators** will be called. All the validators are called at the same time
and the Field will wait for the result of each of them.

4. If any of the validators return an error, the field is marked as invalid.

## Form onSubmit
1. The form will iterate through each field and invoke the validation. The fields will immediately call
both their sync and async validators.

2. If all fields are valid, the **Form.onValidate** function will be called. This is a form-wide synchronous
validator. If the form-wide validation returns an error, the submit will be cancelled.

3. All the errors are displayed and the viewport will be scrolled to the ValidationSummary.

## Fieldgroups
FieldGroups behave in the same way as Fields. The Fields of the Group will pass their onChange and onBlur
events to the parent group, thus triggering the group-wide validation. The FieldGroup will validate no
matter what the validation results of the Fields are.
