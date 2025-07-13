# Style Guide for PDL-145T Management System

## Overview
This style guide outlines the standards for CSS and design system usage within the PDL-145T Management System application. Adherence to these guidelines ensures consistency and maintainability across the project's styles.

## Design System
We utilize a design system defined in `theme.css` that includes color palettes, typography, and layout presets. The system is organized using CSS variables for easy theme management and responsive design adjustments.

### Colors
- **Primary Colors:** Used for main elements (e.g., `--color-primary`, `--color-primary-dark`)
- **Backgrounds:** Light and dark themes (e.g., `--color-bg`, `--color-bg-dark`)
- **Text Colors:** Ensure readability across themes (e.g., `--color-text-primary`, `--color-text-secondary`)

### Typography
- **Font Family:**
  - Base: `--font-sans`
- **Font Sizes & Weights**:
  - Utility classes and variables (e.g., `--font-size-4`, `--font-weight-bold`)

## Components
Components are styled using BEM-like naming conventions, ensuring clear and modular CSS.

### Buttons
- Style variants managed via utility classes (e.g., `.btn`, `.btn--primary`)
- Located in `utilities.css` for global reuse

### Cards, Badges, etc.
- Components have dedicated CSS files (e.g., `Card.css`, `Badge.css`)
- Variants and states are predefined (e.g., `.card--elevated`, `.badge--success`)

## Naming Conventions
Use clear, descriptive names following a BEM-like convention:
- `.component-name__element-name` for elements
- `.component-name--modifier` for modifiers

## Responsive Design
Media queries are utilized for responsive adjustments, typically inlined with components or utilities. Breakpoints are defined using variables (e.g., `--breakpoint-md`).

## Adaptability
Ensure use of CSS variables for any new styles for adaptability to theme changes and responsive design.

## Best Practices
- Avoid duplicating styles; leverage the design system
- Consistently use defined CSS variables for colors, spacing, sizes, etc.
- Use utility classes where applicable for common styles (e.g., spacing, flexbox)
- Test styles under different themes and screen resolutions
