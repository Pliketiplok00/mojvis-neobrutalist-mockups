/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        moduleResolution: 'node',
        target: 'ES2020',
        module: 'CommonJS',
        strict: false,
        skipLibCheck: true,
      },
    }],
  },
  moduleNameMapper: {
    '^react-native$': '<rootDir>/node_modules/react-native',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo)/)',
  ],
  setupFilesAfterEnv: [],
  testPathIgnorePatterns: ['/node_modules/'],
};
