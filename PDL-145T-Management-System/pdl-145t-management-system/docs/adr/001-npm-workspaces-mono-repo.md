# ADR-001: npm workspaces for mono-repo management

## Status

Accepted

## Context

The PDL-145T Management System is designed as a comprehensive platform with multiple components
including a web interface, API services, and potentially shared utilities. Managing these components
as separate repositories would create overhead in terms of dependency management, versioning, and
development workflow.

We need to choose a mono-repo management strategy that allows for:

- Efficient dependency management across packages
- Shared code reuse between components
- Simplified development and deployment workflows
- Good tooling support for JavaScript/TypeScript projects

## Decision

We will use **npm workspaces** for mono-repo management.

## Rationale

**Pros:**

- Native npm feature (no additional tools required)
- Excellent integration with the Node.js ecosystem
- Automatic dependency hoisting reduces installation time and disk space
- Simple configuration through package.json
- Built-in support for running scripts across workspaces
- Good IDE support and tooling integration
- Aligns with our existing npm-based workflow

**Cons:**

- Limited to npm ecosystem (not suitable for polyglot repos)
- Less powerful than dedicated mono-repo tools like Nx or Lerna
- Requires npm 7+ for full workspace support

**Alternatives considered:**

- **Lerna**: More features but adds complexity and maintenance overhead
- **Nx**: Powerful but overkill for our current needs
- **Yarn workspaces**: Similar to npm workspaces but we're standardizing on npm
- **Rush**: Microsoft's tool, more complex setup

## Implementation

The workspace structure will be:

```text
pdl-145t-management-system/
├── packages/
│   ├── web/              # React frontend
│   ├── api/              # Express.js API
│   ├── shared/           # Shared utilities and types
│   └── database/         # Database schemas and migrations
├── package.json          # Root package.json with workspaces config
└── ...
```

Root package.json configuration:

```json
{
  "workspaces": ["packages/*"]
}
```

## Consequences

**Positive:**

- Simplified dependency management across packages
- Faster development with shared code changes
- Consistent tooling and scripts across all packages
- Reduced complexity compared to separate repositories

**Negative:**

- All packages must use compatible Node.js versions
- Larger repository size
- Need to be careful with dependency versions across workspaces

## References

- [npm workspaces documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Managing projects with npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)

---

**Date:** 2025-01-07  
**Author:** Development Team  
**Template:** Based on [Michael Nygard's ADR template][adr-template]

[adr-template]: https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/templates/decision-record-template-by-michael-nygard/index.md
