module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'controllers/**/*.ts',
    'routes/**/*.ts',
    'middleware/**/*.ts',
    '!**/*.d.ts'
  ]
}; 