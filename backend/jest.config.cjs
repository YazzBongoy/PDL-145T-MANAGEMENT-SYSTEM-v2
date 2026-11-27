/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\.(t|j)s$": ["@swc/jest", {
      module: {
        type: "es6",
        strict: false,
        strictMode: true,
        lazy: false,
        noInterop: false,
      },
      jsc: {
        target: "es2022",
        parser: {
          syntax: "typescript",
          decorators: true,
          dynamicImport: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
    }],
  },
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  setupFilesAfterEnv: [],
  // The integration suites are destructive (they delete shared rows), so run
  // them against a dedicated test database. globalSetup creates + migrates it;
  // setupFiles points each worker's PrismaClient at it.
  globalSetup: "<rootDir>/jest.global-setup.cjs",
  setupFiles: ["<rootDir>/jest.setup-env.cjs"],
  globalTeardown: "<rootDir>/src/tests/global-teardown.ts",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
    "!src/index.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  testTimeout: 30000,
  // Integration suites truncate shared tables; serialize them so one worker
  // cannot delete another worker's fixtures.
  maxWorkers: 1,
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    // Double-escaped so the regex matches only `.js`, not `.cjs` setup files.
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
