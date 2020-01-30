import { useContext } from 'react';

import { useFormContext } from './useFormContext';

jest.mock('react');

describe('useFormContext', () => {
  it('should return the correct form context', () => {
    const fakeContext = { fake: true };
    (useContext as jest.Mock).mockReturnValueOnce(fakeContext);

    expect(useFormContext()).toBe(fakeContext);
  });

  it('should throw an error if no form context could be found', () => {
    (useContext as jest.Mock).mockReturnValueOnce(undefined);

    expect(() => {
      useFormContext();
    }).toThrowError(
      '[useFormContext]: Could not find form context. This component must be used inside a <Form> tag.'
    );
  });
});
