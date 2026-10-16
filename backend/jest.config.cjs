/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  // The integration suites are destructive (they delete shared rows), so run
  // them against a dedicated test database. globalSetup creates + migrates it;
  // setupFiles points each worker's PrismaClient at it.
  globalSetup: "<rootDir>/jest.global-setup.cjs",
  setupFiles: ["<rootDir>/jest.setup-env.cjs"],
  transform: {
    "^.+\\.ts$": ["@swc/jest", {
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
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
  ],
  testTimeout: 10000,
  // The integration suites share one PostgreSQL database and each truncates
  // shared tables (User, Project, Task, Site, Territory) in beforeAll/afterAll.
  // Running suites in parallel makes them delete each other's fixtures (e.g. a
  // 403/204 assertion fails because another worker removed the user mid-test),
  // so execute suites serially.
  maxWorkers: 1,
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.\\.?/.*)\\.js$": "$1",
  },
  transformIgnorePatterns: [
    "node_modules",
  ],
};
