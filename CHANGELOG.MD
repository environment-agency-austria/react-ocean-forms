# Changelog
All notable changes to this project will be documented in this file.

## Unreleased
- Removed deprecated Form.onFieldValueChanged callback

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
