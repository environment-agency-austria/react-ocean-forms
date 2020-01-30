The `useFormEventListener` hook registers the given callback to form events
and automatically unregisters it on cleanup.

### Parameters

- **id**: unique event listener id
- **callback**: function to call on each event

### Callback method

The callback method will be called with the parameters:

- **name**: Name of the event emitter
- **event**: Event name
- **args**: (Optional) event args

### Usage

```jsx static
import { useFormEventListener } from 'react-ocean-forms';

function ListenerComponent() {
  useFormEventListener('eventLogger', (name, event, args) => {
    console.log(`Field ${name} triggered event ${event} with args ${args}`);
  });

  // ...
}
```
