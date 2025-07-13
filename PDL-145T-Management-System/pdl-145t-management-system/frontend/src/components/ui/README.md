# UI Components

This directory contains reusable presentational UI components for the PDL-145T Management System.

## Components

### Container
Centers content and sets max-width for responsive layout.

```tsx
import { Container } from './components/ui';

<Container maxWidth="lg">
  <p>Your content here</p>
</Container>
```

**Props:**
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' (default: 'xl')
- `className`: Additional CSS classes

### Card
White surface with padding, subtle shadow, and rounded corners.

```tsx
import { Card } from './components/ui';

<Card variant="elevated" padding="lg">
  <p>Card content</p>
</Card>
```

**Props:**
- `variant`: 'default' | 'outlined' | 'elevated' (default: 'default')
- `padding`: 'sm' | 'md' | 'lg' (default: 'md')
- `className`: Additional CSS classes

### SectionHeader
Consistent h2 style with optional subtitle.

```tsx
import { SectionHeader } from './components/ui';

<SectionHeader 
  title="Projects"
  subtitle="Manage your active projects"
  size="lg"
  align="center"
/>
```

**Props:**
- `title`: Header title text (required)
- `subtitle`: Optional subtitle text
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `align`: 'left' | 'center' | 'right' (default: 'left')
- `className`: Additional CSS classes

## Usage Example

```tsx
import { Container, Card, SectionHeader } from './components/ui';

function ProjectsPage() {
  return (
    <Container maxWidth="lg">
      <SectionHeader 
        title="Projects"
        subtitle="Manage your active projects"
      />
      
      <Card variant="elevated">
        <h3>Project Alpha</h3>
        <p>Project description...</p>
      </Card>
      
      <Card variant="outlined" padding="sm">
        <h3>Project Beta</h3>
        <p>Project description...</p>
      </Card>
    </Container>
  );
}
```

## Design System Integration

All components use the existing design system CSS variables from `theme.css`:
- Colors: `--color-*` variables
- Spacing: `--space-*` variables
- Typography: `--font-*` variables
- Shadows: `--shadow-*` variables
- Border radius: `--radius-*` variables
- Container widths: `--container-*` variables

## Responsive Design

Components are built with responsive design in mind:
- Container adjusts padding on mobile devices
- Typography scales appropriately
- Components support dark/light theme switching
