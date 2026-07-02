# Kheej - Atelier Design System

## Design Direction

Kheej - Atelier should feel quiet, refined, tactile, and editorial. The visual language should support premium product presentation with generous spacing, precise typography, subtle motion, and restrained interface styling.

The theme should avoid decorative excess. Visual interest should come from product photography, material texture, typography, layout rhythm, and carefully chosen interactions.

## Design Principles

- Clarity before ornament.
- Editorial composition with commercial discipline.
- Mobile-first layouts that preserve product confidence.
- Calm interfaces for repeated shopping tasks.
- Consistent spacing, alignment, and hierarchy.
- Accessible contrast and focus states by default.
- Motion that explains state, not motion that competes for attention.

## Typography

### Type Roles

- Display: brand-led headings, editorial titles, and hero copy.
- Heading: section titles, product titles, collection titles, and page headings.
- Body: descriptions, long-form content, policy text, and general interface copy.
- Utility: labels, badges, prices, buttons, navigation, and form help text.

### Recommended Direction

Use a refined serif or high-contrast display face for editorial moments, paired with a clean sans-serif for interface and commerce clarity. Final font selections should be configurable and loaded responsibly.

### Scale

Use a fluid but controlled scale:

```text
Display XL: 48-72px
Display:    36-56px
Heading 1:  32-48px
Heading 2:  28-40px
Heading 3:  22-32px
Heading 4:  18-24px
Body:       16px
Body Small: 14px
Caption:    12px
```

### Typography Rules

- Body text should default to a comfortable `line-height` between 1.45 and 1.7.
- Headings should use tighter line-height without clipping descenders.
- Avoid negative letter spacing.
- Uppercase text should be reserved for short labels and badges.
- Text must remain readable over media and never depend on image darkness alone.

## Color System

The palette should be restrained, warm, and adaptable. Avoid building the entire interface from one hue family.

### Core Tokens

```text
Background:       #F8F6F1
Surface:          #FFFFFF
Surface Muted:    #EFEBE3
Text Primary:     #1E1B18
Text Secondary:   #5D5650
Text Muted:       #8A8178
Border:           #D8D0C5
Accent:           #7A3E2D
Accent Dark:      #4C241B
Success:          #2F6B4F
Warning:          #A66A1F
Error:            #A33A32
Focus:            #1F5EFF
```

### Usage Rules

- Primary text must meet WCAG AA contrast against its background.
- Accent colors should be used for calls to action, sale states, and meaningful highlights.
- Error, warning, and success colors must not rely on color alone.
- Theme settings should allow merchants to adapt the palette without breaking contrast expectations.

## Spacing

Use an 8px spacing foundation with smaller increments where needed for fine interface alignment.

```text
2px
4px
8px
12px
16px
24px
32px
40px
48px
64px
80px
96px
128px
```

### Layout Rules

- Mobile sections should use compact but breathable vertical rhythm.
- Desktop sections may use larger vertical spacing for editorial pacing.
- Form controls, buttons, and tappable elements should meet comfortable touch target sizing.
- Product grids should use predictable gutters and stable image ratios.

## Grid And Layout

- Mobile: single-column by default with selective two-column product grids.
- Tablet: two to three columns depending on content density.
- Desktop: twelve-column mental model, implemented through simple responsive CSS.
- Content width should be constrained for long-form reading.
- Media-heavy sections may extend full width when the composition benefits from immersion.

## Border Radius

The theme should use modest radii:

```text
None:      0
Small:     2px
Default:   4px
Medium:    8px
Pill:      999px
```

Usage:

- Product cards and content cards should generally use `0-8px`.
- Buttons may use default or pill radius depending on merchant brand settings.
- Avoid overly rounded decorative containers in premium editorial layouts.

## Shadows

Shadows should be subtle and rare.

```text
Low:    0 1px 2px rgba(30, 27, 24, 0.08)
Medium: 0 8px 24px rgba(30, 27, 24, 0.10)
High:   0 18px 48px rgba(30, 27, 24, 0.14)
```

Usage:

- Prefer borders, spacing, and background contrast before shadows.
- Use shadows for overlays, drawers, modals, and elevated interactive surfaces.
- Do not use heavy shadows on every card or grid item.

## Animation And Motion

### Motion Principles

- Motion should be fast, understated, and purposeful.
- Use motion to clarify focus, reveal state, or guide attention.
- Respect `prefers-reduced-motion`.
- Avoid scroll-jacking and excessive parallax.

### Timing

```text
Fast:     120ms
Default:  180ms
Slow:     280ms
Panel:    360ms
```

### Easing

Use natural easing:

```text
Standard: cubic-bezier(0.2, 0, 0, 1)
Enter:    cubic-bezier(0, 0, 0.2, 1)
Exit:     cubic-bezier(0.4, 0, 1, 1)
```

## Components Direction

### Buttons

- Clear hierarchy: primary, secondary, tertiary, destructive.
- Loading and disabled states must be visually distinct.
- Buttons must not shift size when state changes.

### Forms

- Labels should remain visible.
- Error text should be specific and connected to the field.
- Inputs should have clear focus states.
- Form layout should work cleanly on mobile.

### Product Cards

- Product imagery should be stable and consistent.
- Title, price, badges, and quick actions should be scannable.
- Sale and sold-out states must be accessible.

### Navigation

- Navigation should be direct, calm, and easy to scan.
- Mobile navigation must support nested menus without trapping users.
- Search and cart entry points should remain discoverable.

## Imagery

- Use consistent image ratios within product grids.
- Avoid heavy overlays that obscure product detail.
- Support lifestyle and studio photography.
- Preserve image quality while serving responsive sizes.

## Accessibility Requirements

- Visible keyboard focus for all interactive elements.
- Minimum AA color contrast for text and essential interface elements.
- No information conveyed by color alone.
- Reduced motion support.
- Controls must have accessible names.
- Overlays and drawers must manage focus predictably.
