# Kheej - Atelier Coding Standards

## Purpose

These standards define how Kheej - Atelier should be built once Shopify theme implementation begins. They exist to keep the theme maintainable, performant, accessible, and commercially reliable.

No implementation files are created during the foundation phase.

## Naming Conventions

### General

- Use clear, descriptive names.
- Prefer full words over abbreviations.
- Keep names consistent across Liquid, CSS, JavaScript, schema settings, and translations.
- Name files by purpose, not by temporary design intent.

### Files

Use lowercase kebab-case:

```text
product-card.liquid
featured-collection.liquid
cart-drawer.js
component-button.css
```

### Liquid Handles And IDs

- Use kebab-case for section names, block types, setting IDs, and translation keys.
- Use stable setting IDs once released.
- Avoid renaming settings after merchants may have configured them.

### CSS Classes

- Use a component-based naming pattern.
- Prefer readable class names over deeply nested selectors.
- Use utility classes sparingly and consistently.

Example direction:

```text
.product-card
.product-card__media
.product-card__title
.product-card--sold-out
```

### JavaScript

- Use camelCase for variables and functions.
- Use PascalCase for custom element classes.
- Use kebab-case for custom element tag names.

## Liquid Practices

- Keep templates thin and section-driven.
- Move repeated markup into snippets only when reuse is clear.
- Avoid excessive snippet nesting.
- Use Shopify objects and filters as intended.
- Escape merchant-controlled output unless intentionally rendering rich text.
- Prefer `render` over legacy `include`.
- Keep conditionals readable and close to the markup they affect.
- Avoid assigning complex presentation logic inside templates when it belongs in section settings or CSS.

## Section And Schema Practices

- Settings should be merchant-friendly and named in plain language.
- Group settings logically.
- Provide sensible defaults.
- Avoid exposing implementation details in setting labels.
- Use limits on blocks where merchants could otherwise create poor layouts.
- Add translations for merchant-facing labels when localization begins.
- Preserve setting IDs after release whenever possible.

## CSS Architecture

### Principles

- CSS should be modular, predictable, and easy to delete.
- Component styles should live near the component purpose.
- Global styles should define tokens, base elements, layout primitives, and shared utilities.
- Avoid excessive specificity.
- Avoid `!important` except for narrowly justified utility or accessibility cases.

### Cascade Strategy

Use a clear ordering model:

```text
1. Theme tokens
2. Reset and base elements
3. Layout primitives
4. Components
5. Sections
6. Utilities
```

### Responsive Rules

- Build mobile-first.
- Use logical breakpoints based on layout needs.
- Avoid fragile pixel-perfect positioning.
- Prevent layout shift by defining media ratios and stable dimensions.

### CSS Variables

- Use CSS custom properties for theme tokens, spacing, color, typography, and motion.
- Map Shopify settings into variables where merchant customization is needed.
- Keep token names semantic.

## JavaScript Conventions

### Principles

- JavaScript should enhance the experience, not carry basic commerce functionality that Shopify can provide natively.
- Use minimal dependencies.
- Prefer custom elements for reusable interactive components.
- Keep state local unless shared state is truly needed.
- Clean up event listeners and observers.

### Interaction Rules

- All interactive components must work with keyboard input.
- Dynamic UI should update ARIA state when appropriate.
- Drawers, modals, and menus must handle focus management.
- JavaScript errors should not break core shopping flows.

### Performance

- Load scripts only where needed.
- Defer non-critical JavaScript.
- Avoid blocking rendering.
- Avoid expensive scroll listeners; use observers where appropriate.

## Accessibility Standards

- Follow WCAG 2.2 AA as the target baseline.
- Use semantic HTML before ARIA.
- Ensure headings follow a logical structure.
- Provide accessible names for buttons, links, inputs, and controls.
- Maintain visible focus indicators.
- Support keyboard operation for menus, drawers, modals, filters, variant selectors, and carousels.
- Respect reduced-motion preferences.
- Provide meaningful alt text guidance for merchant-managed imagery.

## Performance Rules

- Prioritize first meaningful content and product media rendering.
- Use responsive images and Shopify image filters correctly.
- Avoid unnecessary image preloading.
- Lazy-load below-the-fold media.
- Keep CSS and JavaScript payloads small.
- Avoid large third-party dependencies.
- Minimize layout shift by reserving media dimensions.
- Audit with Shopify theme performance tools and browser performance tooling.

## Shopify Best Practices

- Follow Online Store 2.0 architecture.
- Use JSON templates and dynamic sections where appropriate.
- Keep theme settings flexible but restrained.
- Support Shopify markets, translations, and multiple currencies where theme behavior is involved.
- Avoid hardcoding shop-specific content.
- Use Shopify routes and URL filters instead of manual URL assumptions.
- Keep app blocks compatible.
- Do not interfere with Shopify checkout.
- Preserve platform conventions for carts, products, variants, selling plans, and media.

## Internationalization

- Merchant-facing and customer-facing static text should use locale files.
- Avoid hardcoded English in templates after implementation begins.
- Design layouts to tolerate longer translated strings.
- Avoid concatenating translated fragments in a way that breaks grammar.

## SEO Standards

- Use semantic headings and landmarks.
- Support structured product information through Shopify-native data where appropriate.
- Keep canonical behavior aligned with Shopify defaults.
- Avoid hiding important content from crawlers behind JavaScript-only rendering.
- Ensure collection, product, article, and page templates expose meaningful content hierarchy.

## Quality Expectations

Before a feature is considered complete:

- It works on mobile and desktop.
- It handles empty, loading, error, sold-out, and long-content states where applicable.
- It is keyboard accessible.
- It does not introduce avoidable layout shift.
- It follows naming and structure conventions.
- It has been reviewed against Shopify theme requirements.
