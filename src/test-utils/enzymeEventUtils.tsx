/**
 * Defines some often used keycodes for
 * event testing
 */
export const KEYCODE = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  ESCAPE: 27,
  DOWN_ARROW: 40,
};

interface IMockEvent {
  preventDefault(): void;
  [key: string]: unknown;
}

/**
 * Generates a mocked event to be used with
 * enzymes simulate in situations where the
 * tested code wants to call preventDefault
 * @param props Additional event props
 */
// tslint:disable-next-line:naming-convention
export const mockEvent = (props?: object): IMockEvent => ({
  // tslint:disable-next-line:no-empty
  preventDefault: (): void => {},
  ...props,
});
