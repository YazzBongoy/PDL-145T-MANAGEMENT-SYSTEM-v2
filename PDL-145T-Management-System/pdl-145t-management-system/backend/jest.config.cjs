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
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
  ],
  testTimeout: 10000,
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\.{1,2}/.*)\.js$": "$1",
  },
};
