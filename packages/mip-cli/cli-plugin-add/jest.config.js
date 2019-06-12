/**
 * @file jest.config.js
 * @author clark-t (clarktanglei@163.com)
 */

module.exports = {
  testRegex: 'test/.*\\.spec\\.(ts|tsx|js)$',
  testEnvironment: 'node',
  moduleFileExtensions: [
    'js',
    'ts'
  ],
  coveragePathIgnorePatterns: [
    'node_modules',
    'test',
    'lib'
  ],
  preset: 'ts-jest',
  testMatch: null
}
