# react-ocean-forms
[![npm](https://img.shields.io/npm/v/react-ocean-forms.svg)](https://www.npmjs.com/package/react-ocean-forms)
[![GitHub license](https://img.shields.io/github/license/environment-agency-austria/react-ocean-forms.svg)](https://github.com/environment-agency-austria/react-ocean-forms/blob/master/LICENSE)
[![travis](https://travis-ci.com/environment-agency-austria/react-ocean-forms.svg?branch=master)](https://travis-ci.com/environment-agency-austria/react-ocean-forms)

Flexible and lightweight framework for rendering and validating forms with React.

[API Documentation and Showcase](https://environment-agency-austria.github.io/forms-showcase/#/)

## Features
* Field-wide async and sync validation
* Form-wide validation (only sync)
* Support for custom validators
* Support for custom input types

## Install

```npm install react-ocean-forms```

```yarn add react-ocean-forms```

## Usage
To use the Forms you need to import its components into the file where you want to use them.

```js
import { Form, Input } from 'react-ocean-forms';
```

Then use the form where needed.

```jsx
<Form
  onSubmit={this.handleSubmit}
  onValidate={this.handleValidate}
  defaultValues={{ name: 'test'}}
  asyncValidateOnChange
>
  <Input
    name="name"
    label="demo_name"
  />

  <button type="submit">Submit</button>
</Form>
```

## Documentation and Showcase
[API Documentation and Showcase](https://environment-agency-austria.github.io/forms-showcase/#/)
