### Examples

#### Simple field group

Showcase of a simple field group

```jsx
import { Form, FieldGroup, Input } from 'react-ocean-forms';

function Example() {
  // Submit callback, here you'd make your api calls
  const handleSubmit = (values) => {
    console.log('onSubmit, values: ' + JSON.stringify(values));
  };

  // Notice how a field group creates a sub object
  const defaultValues = {
    myGroup: {
      myInput1: 'input 1',
      myInput2: 'input 2',
    },
  };

  return (
    <Form className="demo" onSubmit={handleSubmit} defaultValues={defaultValues}>
      <FieldGroup
        name="myGroup"
        label="Example group"
        render={() => {
          return (
            <React.Fragment>
              <Input name="myInput1" label="Example input" />
              <Input name="myInput2" label="Example input 2" />
            </React.Fragment>
          );
        }}
      />
      <button type="submit">Submit</button>
    </Form>
  );
}

<Example />;
```
