/* eslint-disable */
export default {
  displayName: 'Example App',
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/projects/example-app',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {},
  transform: {
    '^.+\\.(ts|js|mjs|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!@angular|tslib)'],
  moduleNameMapper: {
    tslib: '<rootDir>../../node_modules/tslib/tslib.es6.js',
  },
  testRunner: 'jest-circus/runner',
};
