export default {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
  moduleNameMapper: {
    '^@gopass/shared$': '<rootDir>/../../libs/shared/src/index.ts',
    '^@gopass/contracts$': '<rootDir>/../../libs/contracts/src/index.ts',
    '^@gopass/domain$': '<rootDir>/../../libs/domain/src/index.ts',
    '^@gopass/application$': '<rootDir>/../../libs/application/src/index.ts',
  },
};
