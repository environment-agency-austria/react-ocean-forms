module.exports = {
  setupFiles: [
    '<rootDir>/config/jest/enzyme.ts',
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/test-utils/**',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
};
