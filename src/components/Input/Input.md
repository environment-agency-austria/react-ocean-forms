### Examples

#### Input types

Showcase of the input type support

```jsx
import { Form, Input } from 'react-ocean-forms';

function Example() {
  // onChange callback
  const handleChange = (value) => {
    console.log('onChange, value: ' + JSON.stringify(value));
  };

  // onBlur callback
  const handleBlur = () => {
    console.log('onBlur');
  };

  return (
    <Form className="demo">
      <Input
        name="myInput"
        label="Number input"
        onChange={handleChange}
        onBlur={handleBlur}
        type="number"
      />

      <Input
        name="myInput2"
        label="Date input"
        onChange={handleChange}
        onBlur={handleBlur}
        type="date"
      />
    </Form>
  );
}

<Example />;
```

#### Custom input

Creating your own input components is quite simple. Note that if you want to use the flexible Intl support, you should put all your text outputs through meta.stringFormatter.

```jsx
import { Form, withField } from 'react-ocean-forms';

/**
 * Simple implementation of a custom input
 */
function BaseCustomInput(props) {
  const { field, label, type, meta, customProp } = props;

  return (
    <div>
      <div>
        <label htmlFor={field.id}>
          <strong>{meta.stringFormatter(label)}</strong>
        </label>
      </div>
      <input type={type} {...field} />
      {customProp}
    </div>
  );
}
const CustomInput = withField(BaseCustomInput);

function Example() {
  // Submit callback, here you'd make your api calls
  const handleSubmit = (values) => {
    console.log('onSubmit, values: ' + JSON.stringify(values));
  };

  // onChange callback
  const handleChange = (value) => {
    console.log('onChange, value: ' + JSON.stringify(value));
  };

  // onBlur callback
  const handleBlur = () => {
    console.log('onBlur');
  };

  return (
    <Form className="demo" onSubmit={handleSubmit}>
      <CustomInput
        name="myCustomInput"
        label="Input with info text"
        onChange={handleChange}
        onBlur={handleBlur}
        customProp="custom text"
      />

      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </Form>
  );
}

<Example />;
```
