### Examples

#### FormButton

Showcase of the form button

```jsx
import { Form, Input, FormButton } from 'react-ocean-forms';

function asyncValidator(value) {
  return new Promise(function (resolve) {
    setTimeout(() => {
      if (value === '') {
        resolve('Invalid input');
      } else {
        resolve();
      }
    }, 1000);
  });
}

function Example() {
  return (
    <Form className="demo">
      <Input name="input" label="Sample input" asyncValidators={[asyncValidator]} />

      <FormButton type="submit">Submit</FormButton>
      <FormButton type="reset">Reset</FormButton>
    </Form>
  );
}

<Example />;
```

#### Submit args

Arguments to the form.onSubmit handler can be passed this way

```jsx
import { Form, Input, FormButton } from 'react-ocean-forms';

function Example() {
  const handleSubmit = (values, submitArgs) => {
    console.log(
      'onSubmit, values: ' + JSON.stringify(values) + ', submitArgs: ' + JSON.stringify(submitArgs)
    );
  };

  return (
    <Form className="demo" onSubmit={handleSubmit}>
      <Input name="input" label="Sample input" />

      <FormButton type="submit" submitArgs={{ foo: 'bar' }}>
        Submit
      </FormButton>
      <FormButton type="reset">Reset</FormButton>
    </Form>
  );
}

<Example />;
```

#### Disabled form

FormButtons are disabled if the form is disabled too

```jsx
import { Form, Input, FormButton } from 'react-ocean-forms';

function Example() {
  return (
    <Form className="demo" disabled>
      <Input name="input" label="Sample input" />

      <FormButton type="submit">Submit</FormButton>
      <FormButton type="reset">Reset</FormButton>
    </Form>
  );
}

<Example />;
```
