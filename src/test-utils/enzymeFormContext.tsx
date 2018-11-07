import { IFieldState, IFormContext, TFormEventListener } from '../components/FormContext';
import { IValidationProp } from '../components/withValidation';
import { stringFormatter } from '../utils';

/**
 * Components inside the form module require access to the form context.
 * This is not available when mounting single components in Enzyme.
 * These helper functions aim to address that and wrap a valid,
 * user definable form context around them.
 */

/**
 * Creates a form context
 */
// tslint:disable-next-line:naming-convention
export const createMockFormContext = (registerCallback?: Function): IFormContext => ({
  fieldPrefix: null,

  registerField: jest.fn().mockImplementation((name: string, state: IFieldState): void => {
    if (registerCallback) {
      registerCallback(name, state);
    }
  }),
  unregisterField: jest.fn(),
  notifyFieldEvent: jest.fn(),

  registerListener: jest.fn().mockImplementation((name: string, callback: TFormEventListener): void => {
    if (registerCallback) {
      registerCallback(name, callback);
    }
  }),
  unregisterListener: jest.fn(),

  getFieldState: jest.fn(),
  getValues: jest.fn(),

  stringFormatter: jest.fn().mockImplementation(stringFormatter),
  submit: jest.fn(),

  busy: false,
  disabled: false,
  plaintext: false,

  asyncValidateOnChange: false,
  asyncValidationWait: 400,
  defaultValues: {},
});

/**
 * Creates a validation object mocking the
 * withValidation hoc
 */
// tslint:disable-next-line:naming-convention
export const createMockValidation = (): IValidationProp => ({
  validate: jest.fn(),
  reset: jest.fn(),
  update: jest.fn(),

  isValidating: false,
  isRequired: false,
  valid: true,
  error: null,
});
