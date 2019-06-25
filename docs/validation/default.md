react-ocean-forms ships with the following validators. Those only support Fields, if you need FieldGroup validators, you have to implement your own validator.

## validators.required
Checks if a value is present.
```jsx static
import { Input, validators } from 'react-ocean-forms';

<Input name="demo" label="lbl_demo" validators={[validators.required]} />
```

## validators.alphaNumeric
Checks if the input is alpha numeric.
```jsx static
import { Input, validators } from 'react-ocean-forms';

<Input name="demo" label="lbl_demo" validators={[validators.alphaNumeric]} />
```

## validators.minLength
Checks if the input has a given minimum length.
```jsx static
import { Input, validators } from 'react-ocean-forms';

<Input name="demo" label="lbl_demo" validators={[validators.withParam(validators.minLength, 100)]} />
```

## validators.maxLength
Checks if the input has a given maximum length.
```jsx static
import { Input, validators } from 'react-ocean-forms';

<Input name="demo" label="lbl_demo" validators={[validators.withParam(validators.maxLength, 100)]} />
```
