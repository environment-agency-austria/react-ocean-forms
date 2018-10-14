import * as React from 'react';

import { getDisplayName } from '../getDisplayName';

describe('getDisplayName', () => {
  it('should return the displayName prop of the component', () => {
    class Mock extends React.Component {
      public static displayName: string = 'mock';
    }

    expect(getDisplayName(Mock)).toBe('mock');
  });

  it('should return the name prop of the component if no displayName is present', () => {
    class Mock extends React.Component { }

    expect(getDisplayName(Mock)).toBe('Mock');
  });

  it('should return "Component" if nothing else is available', () => {
    // @ts-ignore
    expect(getDisplayName({})).toBe('Component');
  });
});
