# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]
### Breaking changes
- `withValidation` has been removed, use the new hook `useValiation` instead
- `withField` has been deprecated, use the new hook `useField` instead
- removed some utils that were not intended for public use
- default *empty* value of a field is now undefined instead of an empty string

### New features
- Added `useValidation` hook as replacement for `withValidation`
- Added `useField` hook as replacement for `withField`
- Added `useFormEventListener` hook for easy access to form events
- Added `useFormText` hook for easy access to form formatted texts
- Added `reset` to `FormContext`

### Other
- The `Form` will now throw an error if a duplicate field name is used.

## [2.2.1] # 2020-01-31
- Bugfix: stop event propagation of `submit` and `reset` form events

## [2.2.0] # 2019-02-19
### New features
- Added `useFormContext` hook for easy access to the form context
- Added `validators.withAsyncParam` wrapper function to call async validators with parameters
- Added `disabled` and `plaintext` props to `Field` to override global form state locally
- Added `disabled` and `plaintext` props to `FieldGroup` to override global form state locally

### Other
- Migrated to react 16.8 to enable hooks functionality
- Deprecated `withForm` - `useFormContext`

## [2.1.6] # 2018-12-19
- Bugfix: Added `null` as allowed return type for `Form.onValidate` callback

## [2.1.5] # 2018-12-16
- Re-relase due to npm publish issue

## [2.1.4] # 2018-12-16
- Migrated to rollup to improve package size and tree shaking
- Fixed typing issue with `validators` in typescript 3.2+

## [2.1.3] # 2018-12-01
- Made production package size smaller
- Enabled tree shaking
- Fixed a bug where a valid result in `Form.onValidate` (for example result `{ testField: undefined }`) would be treated as invalid
- Fixed a bug where the `ValidationWrapper` would always ignore `asyncValidationWait`

## [2.1.0] # 2018-11-30
### New features
- Added prop `resetOnSubmit` to `Form`. When set to true, the form will trigger a form reset after a successful submit. Default setting: false
- Added option for custom **required validators**. The form will now recognize a custom required validator if a synchronous validator is tagged with `isDefaultValidator = true`
- Added prop `busy` to `Form`. This allows to force the form into a busy state. Useful for example to disable the form buttons during data loading.

## [2.0.0] # 2018-11-19
### Breaking changes
**Changed default usage of form fields**
In order to provide the best typescript experience we had to ditch the conect of `<Field component={Input}>`. From version 2.0.0 onwards the field component is used directly, e.g.: `<Input name="demo" label="Demo Input" />`. The field component will still accept the field props. Developers who want to make their own field components now need to wrap those with the new `withField` higher order component. A full migration guide will be available soon.

### Other
- Removed deprecated `Form.onFieldValueChanged` callback
- Fixed a bug where a form field would revert its value to '' if its current value evaulated to value == false.
- Added `isRequired` to field meta. It is true if the field / input component contains a required validator.

## [1.4.0] # 2018-08-20
### Breaking Changes
- Changed behaviour of `defaultValues` - the Field value will only be overwritten if the Field isn't touched
- Added `values` to `Form` - basically they behave like the old defaultValues, but will override any defaultValues if present

### Other changes
- Added `FormText` component, a wrapper for `formContext.stringFormatter`
- Added `defaultValue` to `Field` - it will override the `defaultValues` of the Form
- Added `value` to `Field` - it will override the `values` of the Form
- Added `defaultValues` to `FieldGroup` - it will override the `defaultValues` of the Form
- Added `values` to `FieldGroup` - it will override the `values` of the Form
- Fixed missing id field to `fieldShape`
- Improved error message when trying to use Fields or FieldGroups outside of a form

## [1.3.0] # 2018-08-02
- Support for async onSubmit callback, will keep the form busy until the Promise resolves
- Added submit callback to form context, which will trigger the form submit handler
- Added `FormButton`

## [1.2.0] # 2018-07-25
- Fixed a bug where the state of an unmounted Field has been set
- Added displayName props
- Removed unsupported info prop on Input (only supported in `react-ocean-forms-bootstrap` input)

## [1.1.1] # 2018-07-02
- Fixed a bug where getDisplayValue wasn't called when the form plaintext or disabled state changed

## [1.1.0] # 2018-06-27
- Changed listener logic of the form context to make it usable in more use cases:
  - context.registerListener now needs a callback function as second parameter
  - the listener callback will be called with fieldName, eventName and eventArgs (added eventName)
- Added onChange and onBlur callback to Field
- Added className to Form, which will be mapped to the html form
- Added plaintext mode to Form, which only displays the plaintext value
- Added getDisplayValue and getSubmitValue lifecycle hooks to Field

## [1.0.3] # 2018-06-11
- Initial release of the current code base
