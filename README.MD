# react-ocean-forms
[![npm](https://img.shields.io/npm/v/react-ocean-forms.svg)](https://www.npmjs.com/package/react-ocean-forms)
[![GitHub license](https://img.shields.io/github/license/environment-agency-austria/react-ocean-forms.svg)](https://github.com/environment-agency-austria/react-ocean-forms/blob/master/LICENSE)
[![travis](https://travis-ci.com/environment-agency-austria/react-ocean-forms.svg?branch=master)](https://travis-ci.com/environment-agency-austria/react-ocean-forms) [![Greenkeeper badge](https://badges.greenkeeper.io/environment-agency-austria/react-ocean-forms.svg)](https://greenkeeper.io/)
[![Coverage Status](https://coveralls.io/repos/github/environment-agency-austria/react-ocean-forms/badge.svg?branch=master)](https://coveralls.io/github/environment-agency-austria/react-ocean-forms?branch=master)

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

## Upgrading from react-ocean-forms 1.x.x to 2.0.0
From version 2.0.0 onwards the syntax for `Field` has changed. Previously a field would be written like this:

**Before**:
```jsx
<Field
  name="demo"
  label="My demo field"
  component={Input}
  />
```

**After**:
```jsx
<Input
  name="demo"
  label="My demo field"
  />
```

The input component is now used directly without using it in the component prop of the field.

### Changes for writing custom field components
Custom field components must use the new `withField` higher order component. See [Input.tsx](./src/components/Input/Input.tsx) for an implementation example.
