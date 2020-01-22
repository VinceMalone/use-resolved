/* eslint-env node */

module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  coverageDirectory: 'coverage',
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],
};
