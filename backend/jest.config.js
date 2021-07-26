/* eslint-disable no-undef */
module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest",
  },
  testPathIgnorePatterns: ["out/","build/"],
  testEnvironment: "node",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node",
  ],
  verbose: true,
  reporters: [
    'default',
    [
    'jest-junit', {
      outputDirectory: 'test_reports',
      outputName: 'test-report.xml'
    }]
  ],
  collectCoverage: true,
  coverageReporters: ['cobertura'],
  coverageDirectory: "coverage",
  runner: "groups"
};
