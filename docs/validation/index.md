There are two types of validators, synchronous and asynchronous validators. Those can be attached to either an Field / Input or a FormGroup and will get triggered automatically.

```jsx static
import { Input, validators } from 'react-ocean-forms';

<Input
  name="demo"
  label="lbl_demo"
  validators={[validators.required]}
/>
```
