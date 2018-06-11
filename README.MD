# react-ocean-forms
Flexible and lightweight framework for rendering and validating forms with React.

## Features
* Field-wide async and sync validation
* Form-wide validation (only sync)
* Support for custom validators
* Support for custom input types

## Install

```npm install react-ocean-forms```
```yarn add react-ocean-forms```

## Usage
To use the Forms you need to import its components into the file where you want to use them.

```js
import { Form, Field, Input } from 'react-ocean-forms';
```

Then use the form where needed.

```jsx
<Form
  onSubmit={this.handleSubmit}
  onValidate={this.handleValidate}
  defaultValues={{ name: 'test'}}
  asyncValidateOnChange
>
  <Field
    name="name"
    label="demo_name"
    component={Input}
  />

  <button type="submit">Submit</button>
</Form>
```

The needed properties and event handlers are described later in this document.

## Form component
Wrapper and **main** component of the Form system.

```jsx
import { Form } from 'react-ocean-forms';

<Form
  onSubmit={this.handleSubmit}
  onReset={this.handleReset}
>
  ...
</Form>
```

### Properties
***asyncValidateOnChange*** (Boolean, optional, default: false)
If set to true the form will trigger asynchronous validation on Fields whenever they change (e.g. on key press). Default behaviour is that the fields will only async validate when they loose focus. Can be overriden per field.

***asyncValidationWait*** (Integer, optional, default: 400)
Configures the wait time before the async validators will be called. Per default the form will call the async validators only 400ms after the **last** value change. Can be overriden per field.

***defaultValues*** (Object, optional)
Contains the default values of the form. Those values will be put into the according fields when the form initializes. The name prop of the field will be used to get the default value from the according proprety of the defaultValues object.

***disableFocusSummaryOnError*** (Boolean, optional, default: false)
If set to true the form will stop automatically scrolling to the validation summary when the user clicks on a submit button and the form is invalid.

***disabled*** (Boolean, optional, default: false)
If set to true the form will disable all fields and buttons.

***formatString*** (Function, optional)
If set every text output will be put through this function. Per default an internal implementation is used. The function receives the following parameters and it must return a string.
* *id* (String): Id of the message
* *params* (Object): Optional parameters that should be replaced in the message

### Events
***onSubmit*** (values)
Triggered when the form has been validated successfully and is ready to be submitted.
* *values* (Object): Contains the form values. The name of the fields are used as property names for the values object.

***onValidate*** (values)
Triggered after all field validations have been successfull. Provides the current values end expects an error object with the field names as properties and the errors inside those properties.
* *values* (Object): Contains the form values. The name of the fields are used as property names for the values object.

***onReset*** (values)
Triggered when the form has been resetted by the user.

***onFieldValueChanged*** (name, value)
Triggered when the value of a field changes.

### Children
The Form should contain at least one Field element and a submit button, otherwise it's quite useless. The form will wrap them inside a html form and a ```FormContext.Provider```

## Field Component
Defines a form line containing a label and an input. Additionally it can render an info button and info alert as well as validation messages. If the user adds the required validator then it will mark the field as required as well.

```jsx
import { Field } from 'react-ocean-forms';

<Field
  name="demo"
  label="lbl_demo"
  component={Input}
  validators={[validators.required]}
  asyncValidators={[serverSideValidator]}
  asyncValidationWait="500"
/>
```

### Properties
***name*** (String, required)
Name of this input. Will be used as the unique identifier of this value. **Must be unique inside it's context (e.g. form wide or form group wide)!**

***label*** (String, required)
Message id of the label that will be displayed along the input. If you don't want to use any i18n features you can pass a raw message instead.

***component*** (React.Component, required)
The component that should be rendered as input.

***validators*** (Array of functions, optional)
Contains an array of functions that will validate this input. Those functions are called whenever the value changes (on keypress, ...). They are called in order and whenever one fails the other ones are not called.
The validator function must return either *undefined* or a *string* containing the message id of the validation error text.

***asyncValidators*** (Array of async functions, optional)
Contains an array of functions that **must** return a *Promise*. Those functions are called by default onBlur, however this behaviour can be changed by setting *asyncValidateOnChange* on the Form.
The Form will call all async validators of a Field at the same time and will wait for the result of every one of them. If one of them returns a string the field will be marked as invalid.
Per default the form will wait for 400ms before triggering any validation. This is put in place so the validation won't get triggered on every keystroke of the user. The async validators will be called 400ms after the **last** value change.

***asyncValidateOnChange*** (Boolean, optional, default: form default)
If set to true the form will trigger asynchronous validation on this field whenever it changes (e.g. on key press). Default behaviour is that the fields will only async validate when they loose focus.

***asyncValidationWait*** (Integer, optional, default: form default)
Configures the wait time before the async validators will be called. Per default the form will call the async validators only 400ms after the **last** value change.

### Specialized properties
Depending on the input component that is used with the Field, the Field will accept a range of specialized properties to configure the behaviour of the component. Those properties are described at the according documentation of the input component.

### Default input components
`react-ocean-forms` ships with an example html input implementation. For a pre-made bootstrap option take a look at [react-ocean-forms-bootstrap](https://github.com/environment-agency-austria/react-ocean-forms-bootstrap)

### Default validators
This library ships with some sample sync validators. Those are:

* **validators.required** - Checks if any value is present
* **validators.alphaNumeric** - Checks if the input is alpha numeric
* **validators.minLength** - Checks if the value has a given minimum length
* **validators.maxLength** - Checks if the value has a given maximum length

#### Validators with parameters
If a validators needs additional parameters (like `minLength` and `maxLength` do), you can use the helper function `validators.withParam`.
Example usage to pass the parameter 5 to the minLength validator:

``` <Field validators=[validators.withParam(validators.minLength, 5)] /> ```

### Validators with message parameters
It is supported to pass values to messages with parameters. For example if you have a message like this:

``` { msg: "User with the name {name} already exists!" } ```

You can pass those parameters with your custom validator if you return an object instead of a string. The object must have the following shape:

```js
{
  message_id: 'msg',
  params: {
    name: 'Huber',
  },
}
```

If you don't need any i18n features you can simply pass a raw message and it will be displayed as-is.

## FieldGroup Component
Defines a collection of fields. It will combine its values to a sub-object and provides the possibility to attach validators to the group.

```jsx
import { FieldGroup } from 'react-ocean-forms';

<FieldGroup
  name="demo"
  label="demo group"
  validators={[validators.required]}
  asyncValidators={[serverSideValidator]}
  asyncValidationWait="500"
  render={(groupInfo) => renderGroup(groupInfo)}
/>
```

### Properties
***name*** (String, required)
Name of this input. Will be used as the unique identifier of this value. **Must be unique inside it's context (e.g. form wide or form group wide)!**

***label*** (String, required)
Message id of the label that will be displayed along the input. If you don't want to use any i18n features you can pass a raw message instead.

***validators*** (Array of functions, optional)
Contains an array of functions that will validate this input. Those functions are called whenever the value changes (on keypress, ...). They are called in order and whenever one fails the other ones are not called.
The validator function must return either *undefined* or a *string* containing the message id of the validation error text.

***asyncValidators*** (Array of async functions, optional)
Contains an array of functions that **must** return a *Promise*. Those functions are called by default onBlur, however this behaviour can be changed by setting *asyncValidateOnChange* on the Form.
The Form will call all async validators of a Field at the same time and will wait for the result of every one of them. If one of them returns a string the field will be marked as invalid.
Per default the form will wait for 400ms before triggering any validation. This is put in place so the validation won't get triggered on every keystroke of the user. The async validators will be called 400ms after the **last** value change.

***asyncValidateOnChange*** (Boolean, optional, default: form default)
If set to true the form will trigger asynchronous validation on this field whenever it changes (e.g. on key press). Default behaviour is that the fields will only async validate when they loose focus.

***asyncValidationWait*** (Integer, optional, default: form default)
Configures the wait time before the async validators will be called. Per default the form will call the async validators only 400ms after the **last** value change.

### Render prop
***render*** (groupInfo)
Gets called to render its children (see render prop pattern).
* *groupInfo* (Object): Contains the group state consisting of fullName, isValidating, valid, error which can be used to display those informations.

## ValidationSummary component
Displays a clickable list of errors from the current form. When an error is clicked, the corresponding input field is focused.

### Properties
***id*** (String, required)
Id of this input. Will be used as the unique identifier of the div. **Must be unique form wide!**
***title*** (String, optional)
Message that will be used as the title, wrapped in a `h4`.
***renderFieldError*** (Function, optional)
Optional function that can be used to customize the output of each error.
* *id* (String): Unique id
* *fieldName* (String): Name / label of the field
* *errors* (Object): Object / Array of objects with the rendered error messages
* *linkCallback* (Function): Function that should be called on click

Example:
```js
  renderError(id, fieldName, errors, linkCallback) {
    return (
      <li key={id}>
        <a href="#" onClick={linkCallback}>
          {fieldName}: {errors}
        </a>
      </li>
    );
  }
```

***render*** (Function, optional)
Optional function that can be used to customize the ValidationSummary rendering.
Note: This function will only be called when there are errors to be displayed.

* *children* (Object): Object containing the rendered ValidationSummary content.
