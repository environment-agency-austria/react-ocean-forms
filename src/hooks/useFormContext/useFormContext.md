The `useFormContext` hook provides an easy way to get the current form context.
Please refer to the [FormContext API](bar) for further details.

### Usage

```jsx static
import { useFormContext } from 'react-ocean-forms';

function FancyComponent() {
  const formContext = useFormContext();

  function handleClick() {
    formContext.submit();
  }

  return <button onClick={handleClick}>Click me!</button>;
}
```
