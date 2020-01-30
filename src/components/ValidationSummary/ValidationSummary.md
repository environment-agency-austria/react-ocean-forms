### Examples

#### Showcase

Showcase of the validation summary. Click on submit to display the summary.

```jsx
import { Form, Input, ValidationSummary, validators } from 'react-ocean-forms';

function Example({ logMessage }) {
  return (
    <Form className="demo">
      <ValidationSummary id="summary" />

      <Input name="input1" label="Example input 1" validators={[validators.required]} />

      <Input name="input2" label="Example input 2" validators={[validators.required]} />

      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </Form>
  );
}

<Example />;
```
