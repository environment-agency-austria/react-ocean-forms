react-ocean-forms is a flexible and lightweight framework for rendering and validating forms with React.

[![npm](https://img.shields.io/npm/v/react-ocean-forms.svg)](https://www.npmjs.com/package/react-ocean-forms)
[![GitHub license](https://img.shields.io/github/license/environment-agency-austria/react-ocean-forms.svg)](https://github.com/environment-agency-austria/react-ocean-forms/blob/master/LICENSE)
[![travis](https://travis-ci.com/environment-agency-austria/react-ocean-forms.svg?branch=master)](https://travis-ci.com/environment-agency-austria/react-ocean-forms) [![Greenkeeper badge](https://badges.greenkeeper.io/environment-agency-austria/react-ocean-forms.svg)](https://greenkeeper.io/)
[![Coverage Status](https://coveralls.io/repos/github/environment-agency-austria/react-ocean-forms/badge.svg?branch=master)](https://coveralls.io/github/environment-agency-austria/react-ocean-forms?branch=master)

## Installation
with npm:

```bash
npm install --save-dev react-ocean-forms
```
or with yarn:

```bash
yarn add --dev react-ocean-forms
```

### Optional packages
The react-ocean-forms package is the core package. While you can use it on it's own, we
highly recommend adding the [react-ocean-forms-bootstrap](https://github.com/environment-agency-austria/react-ocean-forms-bootstrap)
package as well. It offers you easy bootstrap (reactstrap) integration.

If you're using react-intl in your project, add the
[react-ocean-forms-react-intl](https://github.com/environment-agency-austria/react-ocean-forms-react-intl)
package for react-intl support.

## Getting started
Assuming that you already have an up and running React app, otherwise please follow the
[create-react-app](https://github.com/facebook/create-react-app#creating-an-app) guideline.

After adding the react-ocean-forms package(s) to your project, you can simply import the components you need.

```jsx static
import React from 'react';
import { Form, Input } from 'react-ocean-forms';

function handleSubmit(values) {
  console.log('form submitted with', values);
}

function GettingStarted() {
  return (
    <Form onSubmit={handleSubmit}>
      <Input name="myInput" label="Example input" />
      <button type="submit">Submit</button>
    </Form>
  );
}

export default GettingStarted;
```

For further documentation head to the components section.
