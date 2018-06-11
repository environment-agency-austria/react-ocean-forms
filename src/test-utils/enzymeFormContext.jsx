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
export const createMockFormContext = registerCallback => ({
  fieldPrefix: null,

  registerField: jest.fn().mockImplementation((name, state) => registerCallback(name, state)),
  unregisterField: jest.fn(),
  notifyFieldEvent: jest.fn(),

  registerListener: jest.fn().mockImplementation((name, state) => registerCallback(name, state)),
  unregisterListener: jest.fn(),

  getFieldState: jest.fn(),
  getValues: jest.fn(),

  stringFormatter: jest.fn().mockImplementation(stringFormatter),

  busy: false,
  disabled: false,

  asyncValidateOnChange: false,
  asyncValidationWait: 400,
  defaultValues: {},
});

/**
 * Creates a validation object mocking the
 * withValidation hoc
 */
export const createMockValidation = () => ({
  validate: jest.fn(),
  reset: jest.fn(),
  update: jest.fn(),

  isValidating: false,
  valid: true,
  error: null,
});
