import { useContext } from 'react';

import { useFormContext } from './FormContext.hooks';

jest.mock('react');

describe('FormContext', () => {
  describe('useFormContext', () => {
    it('should return the correct form context', () => {
      const fakeContext = { fake: true };
      (<jest.Mock>useContext).mockReturnValueOnce(fakeContext);

      expect(useFormContext()).toBe(fakeContext);
    });

    it('should throw an error if no form context could be found', () => {
      (<jest.Mock>useContext).mockReturnValueOnce(undefined);

      expect(() => { useFormContext(); }).toThrowError(
        '[useFormContext]: Could not find form context. This component must be used inside a <Form> tag.'
      );
    });
  });
});
