You can very easily add your own validation logic by writing custom validation functions.

## Custom synchronous validator
The validator function will receive the current field value and the form context, and
must return undefined if the value is valid or an error with the error message.

### Simple example validator
Example implementation of an validator that checks if the input is the value 'OK'.

```jsx static
import { Input } from 'react-ocean-forms';

const myValidator = (value) => {
  return value === 'OK' ? undefined : 'Value is not OK!';
};

<Input
  name="demo"
  label="lbl_demo"
  validators={[myValidator]}
/>
```

### Arguments
| Parameter   | Type       | Description |
| ----------- | ---------- | - |
| **value**   | *(any)*    | Contains the current field value. |
| **context** | *(Object)* | Contains the current form context that can be used for advanced validation. See Form for further information about the form context. |

### Expected return value
The validator must return one of the following values:

**undefined**<br />
The field is valid.

**String**<br />
The field is invalid. The string should contain either a message id,
or a raw error message if you don't need i18n features.

**Object**<br />
The field is invalid. An error object can be used instead of a String
to be able to use message templates. This is useful if you use i18n and
message-ids. The error object must have the following shape:

```js static
const errorObj = {
  message_id: 'error-id',
  params: {
    customParam: 'Foobar',
  },
}
```

This allows you to write your error message as following:
```js static
// Error message
"Field is invalid {customParam}"
// Renders to
"Field is invalid Foobar"
```

## Custom asynchronous validator
The validator function will receive the current field value and the form context, and must return a Promise.
The promise must then resolve to undefined if the value is valid, otherwise an error with the error message.
The parameters and expected return (resolved) values are the same as for Custom synchronous validators.

### Simple example validator
Example implementation of an asynchronous validator that checks the value against an api.

```jsx static
import { Input } from 'react-ocean-forms';
import { CustomApi } from './myCustomApi';

const myValidator = async (value) => {
  const result = await CustomApi.validateAtBackend(value);
  if (result.valid === true) {
    return undefined;
  }

  return 'Invalid value';
};

<Input
  name="demo"
  label="lbl_demo"
  asyncValidators={[myValidator]}
/>
```

## Custom required validator
You can write your own required validator. This will make the form mark the validated
field as required (by default with a *). To mark your validator function as a required validator,
simply flag it with **isDefaultValidator = true**. Currently this is only supported for synchronous
validators. See Custom synchronous validators for further details.

## Custom form-wide validator
The form wide validator is attached to the **Form.onSubmit** and is triggered when the form is submitted and all
the Fields are valid. While form-wide validation is supported, it should be avoided. Try to attach your
validation to Fields or FieldGroups if possible.

### Simple example validator
Example implementation of an validator that does a validation form-wide.

```jsx static
import { Form, Input } from 'react-ocean-forms';

const myValidator = (values) => {
  if (values.first === 'John' && values.last === 'Doe') {
    return {
      // This will mark both fields as invalid with
      // the given error messages.
      first: 'Invalid name!',
      last: 'Invalid name!',
    };
  }

  return null;
};

<Form onValidate={myValidator}>
  <Input name="first" label="First name" />
  <Input name="last" label="Last name" />
</Form>
```

### Arguments
| Parameter    | Type       | Description                                |
| ------------ | ---------- | ------------------------------------------ |
| **values**   | *(Object)* | Contains all the field values of the form. |

### Expected return value
The validator must return one of the following values:

**null**<br />
The form is valid.

**Object**<br />
The form is invalid. The object must contain the error messages / objects of each invalid field.
