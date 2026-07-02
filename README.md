# Kheej - Atelier

Kheej - Atelier is a new Shopify Online Store 2.0 theme for premium fashion, craft, lifestyle, and design-led retail brands. The project is currently in its foundation phase.

No Shopify theme code has been generated yet. This repository currently contains planning, design, coding, and delivery documentation only.

## Current Status

Foundation documentation is in place:

- `PROJECT.md`: vision, goals, milestones, structure, and versioning.
- `DESIGN_SYSTEM.md`: visual language, typography, spacing, color, motion, and accessibility principles.
- `CODING_STANDARDS.md`: implementation standards for future Shopify theme work.
- `ROADMAP.md`: phased path from foundation to version 1.0.
- `.gitignore`: ignore rules suitable for Shopify theme development.

## Project Intent

The theme should provide a refined, editorial storefront experience while remaining fast, accessible, maintainable, and commercially useful. It will be built around Shopify Online Store 2.0 conventions once implementation begins.

## Developer Workflow

Before writing theme code:

1. Read `PROJECT.md` to understand the product direction.
2. Read `DESIGN_SYSTEM.md` to understand the design language.
3. Read `CODING_STANDARDS.md` before creating any Liquid, CSS, JavaScript, schema, or locale files.
4. Check `ROADMAP.md` to confirm the current implementation phase.

## Implementation Rules

- Do not add Shopify theme code until the skeleton phase begins.
- Follow Shopify Online Store 2.0 conventions.
- Keep merchant settings clear and stable.
- Build mobile-first and accessibility-first.
- Prefer maintainable theme-native patterns over unnecessary dependencies.
- Update documentation when architecture, settings, or design decisions change.

## Planned Structure

The future Shopify theme will use the standard Online Store 2.0 structure:

```text
assets/
config/
layout/
locales/
sections/
snippets/
templates/
```

These folders should be created only when implementation begins.

## Versioning

The project will use Semantic Versioning:

- Major: breaking changes.
- Minor: backwards-compatible features.
- Patch: fixes and small improvements.

The first production-ready release will be `1.0.0`.
