# ADR-002: Code-quality tooling (ESLint, Prettier, Jest)

## Status

Accepted

## Context

The PDL-145T Management System requires consistent code quality, formatting, and testing across
all components. As a multi-developer project with both frontend and backend JavaScript/TypeScript
code, we need standardized tooling that ensures:

- Consistent code style and formatting
- Early detection of potential bugs and code quality issues
- Comprehensive test coverage and reliable testing framework
- Integration with development workflow and CI/CD pipeline
- Good developer experience with IDE integration

## Decision

We will use the following code-quality tooling stack:

- **ESLint** for code linting and quality checks
- **Prettier** for code formatting
- **Jest** for testing framework

## Rationale

### ESLint

**Pros:**

- Industry standard for JavaScript/TypeScript linting
- Extensive rule set covering code quality, potential bugs, and best practices
- Excellent TypeScript support with @typescript-eslint
- Highly configurable and extensible
- Great IDE integration and autofix capabilities
- Active community and ecosystem

**Cons:**

- Can be complex to configure for large projects
- Rule conflicts possible with Prettier (mitigated by eslint-config-prettier)

### Prettier

**Pros:**

- Opinionated code formatter eliminates style debates
- Excellent IDE integration with format-on-save
- Supports multiple file types (JS, TS, JSON, HTML, CSS, etc.)
- Minimal configuration required
- Fast formatting
- Wide adoption in the JavaScript community

**Cons:**

- Opinionated formatting may not match all preferences
- Limited customization options

### Jest

**Pros:**

- Zero-configuration testing framework
- Excellent mocking capabilities
- Built-in code coverage reporting
- Snapshot testing for UI components
- Great async testing support
- Excellent TypeScript support
- Wide adoption and community support

**Cons:**

- Can be slower than some alternatives for large test suites
- Memory usage can be high for complex projects

**Alternatives considered:**

- **TSLint**: Deprecated in favor of ESLint
- **StandardJS**: Too opinionated, less flexible than ESLint + Prettier
- **Vitest**: Modern alternative to Jest, but Jest has better ecosystem support
- **Mocha/Chai**: More setup required, Jest provides better out-of-box experience

## Implementation

### ESLint Configuration

```json
{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended", "prettier"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Jest Configuration

```json
{
  "testEnvironment": "node",
  "collectCoverageFrom": ["src/**/*.{js,ts}", "!src/**/*.d.ts"],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Consequences

**Positive:**

- Consistent code style across all team members
- Early detection of potential bugs and code quality issues
- Comprehensive test coverage tracking
- Improved developer experience with IDE integration
- Automated code quality checks in CI/CD pipeline
- Reduced time spent on code review discussions about style

**Negative:**

- Initial setup and configuration overhead
- Learning curve for team members unfamiliar with these tools
- Potential build time increase due to linting and formatting steps
- May require occasional rule adjustments as project evolves

## Integration

- Pre-commit hooks using husky to run lint and format checks
- CI/CD pipeline integration for automated quality checks
- IDE extensions for real-time feedback
- Workspace-level configuration to ensure consistency across packages

## References

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/index.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)

---

**Date:** 2025-01-07  
**Author:** Development Team  
**Template:** Based on [Michael Nygard's ADR template](https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/templates/decision-record-template-by-michael-nygard/index.md)
