import * as FormComponents from './index';

describe('Index', () => {
  describe('Component exports', () => {
    const components = [
      'withField',
      'FieldError',
      'FieldGroup',
      'FieldLine',
      'Form',
      'FormButton',
      'FormContext',
      'FormText',
      'Input',
      'ValidationSummary',
      'withForm',
      'useField',
      'useFormContext',
      'useValidation',
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
