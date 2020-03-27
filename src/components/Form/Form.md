### Examples

#### Simple form

Showcase of a simple form

```jsx
import { Form, Input } from 'react-ocean-forms';

function Example() {
  // Submit callback, here you'd make your api calls
  const handleSubmit = (values) => {
    console.log('onSubmit, values: ' + JSON.stringify(values));
  };

  // Reset callback, can be useful in some cases for cleanup
  const handleReset = () => {
    console.log('onReset');
  };

  return (
    <Form className="demo" onSubmit={handleSubmit} onReset={handleReset}>
      <Input name="myInput" label="Example input" />
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </Form>
  );
}

<Example />;
```

#### Default values

Provide the form with default values that should be displayed on load. Note how the default value won't update the Field, if the user changed the input. However, on form reset the default value will be used again.

```jsx
import React, { useState } from 'react';
import { Form, Input } from 'react-ocean-forms';

function Example() {
  const [defaultValues, setDefaultValues] = useState({ myInput: 'default value' });

  // Submit callback, here you'd make your api calls
  const handleSubmit = (values) => {
    console.log('onSubmit, values: ' + JSON.stringify(values));
  };

  const randomizeDefaultValues = () => {
    setDefaultValues({
      myInput: `default ${Math.floor(Math.random() * 100)}`,
    });
  };

  return (
    <Form className="demo" onSubmit={handleSubmit} defaultValues={defaultValues}>
      <Input name="myInput" label="Example input" />

      <p className="mt-4">Current default value: {defaultValues.myInput}</p>

      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
      <button type="button" onClick={randomizeDefaultValues} className="ml-1">
        Update default values
      </button>
    </Form>
  );
}

<Example />;
```

#### Values

Override the values of the form fields. Changing those values will override the Field value, even if the user changed it.

```jsx
import React, { useState } from 'react';
import { Form, Input } from 'react-ocean-forms';

function Example() {
  const [values, setValues] = useState({ myInput: 'demo value' });

  // Submit callback, here you'd make your api calls
  const handleSubmit = (values) => {
    console.log('onSubmit, values: ' + JSON.stringify(values));
  };

  const randomizeValues = () => {
    setValues({
      myInput: `demo ${Math.floor(Math.random() * 100)}`,
    });
  };

  return (
    <Form className="demo" onSubmit={handleSubmit} values={values}>
      <Input name="myInput" label="Example input" />

      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
      <button type="button" onClick={randomizeValues} className="ml-1">
        Update values
      </button>
    </Form>
  );
}

<Example />;
```

#### Disabled form

Setting the disabled prop will disable all form fields.

```jsx
import { Form, Input } from 'react-ocean-forms';

function Example() {
  // Submit callback, here you'd make your api calls
  const handleSubmit = (values) => {
    console.log('onSubmit, values: ' + JSON.stringify(values));
  };

  return (
    <Form className="demo" onSubmit={handleSubmit} disabled>
      <Input name="myInput" label="Example input 1" />
      <Input name="myInput2" label="Example input 2" />
      <button type="submit">Submit</button>
    </Form>
  );
}

<Example />;
```

#### Plaintext form

Setting the plaintext prop will show all form fields in a text-only mode.

```jsx
import { Form, Input } from 'react-ocean-forms';

function Example({ logMessage }) {
  const defaultValues = {
    myInput: 'default value 1',
    myInput2: 'default value 2',
  };

  return (
    <Form className="demo" defaultValues={defaultValues} plaintext>
      <Input name="myInput" label="Example input 1" />
      <Input name="myInput2" label="Example input 2" />
    </Form>
  );
}

<Example />;
```

#### Form-wide validation

Use a form-wide validation function before submit. Notice that the onSubmit callback is not invoked if you type 'bad' into the input.

```jsx
import { Form, Input, ValidationSummary } from 'react-ocean-forms';

function Example() {
  // Submit callback, here you'd make your api calls
  const handleSubmit = (values) => {
    console.log('onSubmit, values: ' + JSON.stringify(values));
  };

  // Reset callback, can be useful in some cases for cleanup
  const handleReset = () => {
    console.log('onReset');
  };

  // Form wide validation function
  const handleValidate = (values) => {
    if (values.demoInput === 'bad') {
      return {
        demoInput: 'Invalid input!',
      };
    }

    return null;
  };

  return (
    <Form
      className="demo"
      onSubmit={handleSubmit}
      onReset={handleReset}
      onValidate={handleValidate}
    >
      <ValidationSummary id="summary" />

      <Input name="demoInput" label="Example input" />

      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </Form>
  );
}

<Example />;
```
