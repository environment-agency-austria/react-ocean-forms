import * as FormComponents from './index';

describe('Index', () => {
  describe('Component exports', () => {
    const components = [
      'Field', 'FieldError', 'FieldGroup', 'FieldLine',
      'Form', 'FormButton', 'FormContext', 'FormText',
      'Input', 'ValidationSummary', 'withForm', 'withValidation',
    ];

    components.forEach((component) => {
      it(`Should export ${component}`, () => {
        // @ts-ignore
        expect(FormComponents[component]).toBeTruthy();
      });
    });
  });

  describe('Validators', () => {
    it('Should export validators', () => {
      expect(FormComponents.validators).toBeTruthy();
    });
  });
});
