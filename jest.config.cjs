module.exports = {
  transform: {
    // use babel-jest to transpile tests with the next/babel preset
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': 'babel-jest',
  },
  // Jest will use this regex to determine which files to run tests on
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  // Says to Jest where to look for test files
  roots: ['<rootDir>/src'],
  // Extensions to use when importing modules
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Simulate the browser environment
  testEnvironment: 'jsdom',
  // this file will run before any test files
  setupFilesAfterEnv: ['<rootDir>/jest-setup.cjs'],
  // Mapping for file extensions
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
};