# PDL-145T Management System - Design System

This design system provides a comprehensive, modern, and professional UI/UX foundation for the PDL-145T Management System. It's built with accessibility, scalability, and maintainability in mind.

## 📋 Overview

The design system consists of the following components:

- **Theme System** (`theme.css`) - Core color palette, typography, and foundational variables
- **Design Tokens** (`design-tokens.css`) - Comprehensive design tokens and utility classes
- **Icon System** (`icons.css`) - Professional Heroicons SVG integration
- **Forms** (`forms.css`) - Form components and styling
- **Utilities** (`utilities.css`) - Utility classes for rapid development

## 🎨 Color Palette

### Primary Colors
- **Primary (Blue)**: `#2563eb` - Trust, Innovation, Technology
- **Secondary (Emerald)**: `#059669` - Success, Growth, Reliability  
- **Accent (Violet)**: `#7c3aed` - Premium, Innovation, Creativity

### Neutral Colors
- **Gray Scale**: Slate-based neutral colors from `#f8fafc` to `#020617`
- **Status Colors**: Success, Error, Warning, Info with proper contrast ratios

### Usage Examples
```css
/* Using primary color */
.my-element {
  color: var(--color-primary-600);
  background-color: var(--color-primary-50);
}

/* Using utility classes */
<div class="text-primary bg-secondary">Content</div>
```

## ✍️ Typography

### Font Stack
- **Primary Font**: Inter (Google Fonts)
- **Monospace Font**: JetBrains Mono (Google Fonts)

### Typography Scale
Based on Material Design 3 principles:

#### Display Text (Hero sections)
- **Display Large**: 48px / 300 weight
- **Display Medium**: 36px / 300 weight  
- **Display Small**: 30px / 300 weight

#### Headlines (Page titles)
- **Headline Large**: 24px / 600 weight
- **Headline Medium**: 20px / 600 weight
- **Headline Small**: 18px / 600 weight

#### Body Text (Content)
- **Body Large**: 18px / 400 weight
- **Body Medium**: 16px / 400 weight
- **Body Small**: 14px / 400 weight

#### Labels (UI elements)
- **Label Large**: 16px / 500 weight
- **Label Medium**: 14px / 500 weight
- **Label Small**: 12px / 500 weight

### Usage Examples
```css
/* Using typography tokens */
h1 { font: var(--typography-display-large); }

/* Using utility classes */
<h1 class="text-headline-large">Page Title</h1>
<p class="text-body-medium">Body content</p>
```

## 📐 Spacing System

### Base Unit System
Built on an 8px grid system with 4px base unit (`--spacing-unit: 0.25rem`).

### Spacing Scale
- **Micro**: 0px, 1px, 2px, 4px, 6px
- **Small**: 8px, 10px, 12px, 14px, 16px
- **Medium**: 20px, 24px, 28px, 32px, 36px, 40px
- **Large**: 44px - 80px
- **Extra Large**: 96px - 384px

### Usage Examples
```css
/* Using spacing tokens */
.my-component {
  padding: var(--spacing-4) var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

/* Using utility classes */
<div class="p-4 m-6 gap-3">Content</div>
```

## 🔲 Elevation System

Six-level elevation system inspired by Material Design:

- **Level 0**: No shadow
- **Level 1**: Subtle shadow for cards
- **Level 2**: Slightly raised elements
- **Level 3**: Floating elements
- **Level 4**: Dropdowns and popovers
- **Level 5**: Modals and overlays
- **Level 6**: Maximum elevation

### Usage Examples
```css
/* Using elevation tokens */
.card { box-shadow: var(--elevation-2); }

/* Using utility classes */
<div class="elevation-3">Floating card</div>
```

## 🎯 Icons

### Heroicons Integration
Professional SVG icons from Heroicons, replacing emoji usage.

### Available Icons
- Navigation: home, cog-6-tooth
- Status: check-circle, x-circle, exclamation-triangle, information-circle
- Actions: plus, minus, trash, pencil, eye, eye-slash
- Communication: mail, bell
- Content: document-text, star, heart

### Icon Sizes
- **XS**: 12px
- **SM**: 16px  
- **MD**: 20px (default)
- **LG**: 24px
- **XL**: 32px
- **2XL**: 48px

### Usage Examples
```css
/* Using icon classes */
.success-icon {
  @extend .icon-check-circle;
  @extend .icon--md;
  @extend .icon-success;
}
```

```html
<!-- Icon with utility classes -->
<div class="icon-bg icon-check-circle icon--lg icon-success"></div>

<!-- Icon button -->
<button class="btn btn--primary btn-icon">
  <div class="icon-bg icon-plus icon--sm"></div>
  Add Item
</button>
```

## 🎭 Component Guidelines

### Buttons
- **Primary**: Main actions (blue)
- **Secondary**: Secondary actions (gray)
- **Danger**: Destructive actions (red)
- **Sizes**: Small (32px), Medium (40px), Large (48px), XL (56px)

### Forms
- Consistent padding and border radius
- Focus states with accessible outlines
- Error states with clear messaging
- Proper label association

### Cards & Surfaces
- Use elevation system for depth
- Consistent border radius (8px base)
- Proper spacing scale

## 🌗 Dark Mode Support

Full dark mode support with:
- Automatic system preference detection
- Manual theme switching capability  
- Proper contrast ratios maintained
- All components adapt automatically

## ♿ Accessibility

### Features
- WCAG 2.1 AA compliant color contrasts
- Focus management and visible focus indicators
- Screen reader friendly markup
- Reduced motion support
- Semantic color usage

### Focus Management
```css
:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

## 🔧 Implementation

### Installation
The design system is automatically loaded through `index.css`:

```css
@import './theme.css';
@import './styles/design-tokens.css';
@import './styles/icons.css';
@import './styles/utilities.css';
@import './styles/forms.css';
```

### Usage Patterns

#### CSS Custom Properties
```css
.my-component {
  background: var(--color-bg-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--elevation-2);
  font: var(--typography-body-medium);
  color: var(--color-text-primary);
  transition: var(--transition-colors);
}
```

#### Utility Classes
```html
<div class="bg-primary text-white p-4 rounded-lg elevation-2">
  <h2 class="text-headline-medium">Card Title</h2>
  <p class="text-body-small">Card description</p>
  <button class="btn btn--secondary btn-icon">
    <div class="icon-bg icon-plus icon--sm"></div>
    Action
  </button>
</div>
```

## 📱 Responsive Design

### Breakpoints
- **SM**: 640px
- **MD**: 768px  
- **LG**: 1024px
- **XL**: 1280px
- **2XL**: 1536px

### Container Widths
Corresponding container max-widths for each breakpoint.

### Mobile-First Approach
All components are designed mobile-first with progressive enhancement.

## 🚀 Performance

### Optimizations
- CSS custom properties for theming efficiency
- Minimal specificity conflicts
- Optimized Google Fonts loading
- Compressed SVG icons
- Tree-shakeable utility classes

### Bundle Size
The entire design system adds approximately ~15KB gzipped to your bundle.

## 🔄 Future Enhancements

### Planned Features
- Component library with React components
- Advanced animation system
- Additional icon sets
- Extended color palette variants
- CSS-in-JS compatibility

### Contributing
When adding new components or tokens:
1. Follow naming conventions
2. Maintain accessibility standards  
3. Test in both light and dark modes
4. Document usage examples
5. Consider responsive behavior

---

This design system provides a solid foundation for building consistent, accessible, and beautiful user interfaces. For questions or contributions, please refer to the project documentation.
