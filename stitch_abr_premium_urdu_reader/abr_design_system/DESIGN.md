---
name: ABR Design System
colors:
  surface: '#08122d'
  surface-dim: '#08122d'
  surface-bright: '#2f3856'
  surface-container-lowest: '#040c28'
  surface-container-low: '#111a36'
  surface-container: '#151e3a'
  surface-container-high: '#202945'
  surface-container-highest: '#2b3451'
  on-surface: '#dce1ff'
  on-surface-variant: '#c6c6ce'
  inverse-surface: '#dce1ff'
  inverse-on-surface: '#272f4c'
  outline: '#909098'
  outline-variant: '#46464d'
  surface-tint: '#bfc5e4'
  primary: '#bfc5e4'
  on-primary: '#292f48'
  primary-container: '#0a1128'
  on-primary-container: '#767c99'
  inverse-primary: '#575d78'
  secondary: '#e9c176'
  on-secondary: '#412d00'
  secondary-container: '#604403'
  on-secondary-container: '#dab36a'
  tertiary: '#b9c6eb'
  on-tertiary: '#23304d'
  tertiary-container: '#03112d'
  on-tertiary-container: '#707d9f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#bfc5e4'
  on-primary-fixed: '#141a32'
  on-primary-fixed-variant: '#3f465f'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#d9e2ff'
  tertiary-fixed-dim: '#b9c6eb'
  on-tertiary-fixed: '#0d1b37'
  on-tertiary-fixed-variant: '#3a4665'
  background: '#08122d'
  on-background: '#dce1ff'
  surface-variant: '#2b3451'
typography:
  headline-xl:
    fontFamily: Noto Nastaliq Urdu
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 80px
  headline-lg:
    fontFamily: Noto Nastaliq Urdu
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 64px
  headline-md:
    fontFamily: Noto Nastaliq Urdu
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 48px
  body-lg:
    fontFamily: Noto Nastaliq Urdu
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 40px
  body-md:
    fontFamily: Noto Nastaliq Urdu
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 36px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Noto Nastaliq Urdu
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 56px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 40px
---

## Brand & Style

This design system centers on a premium, literary aesthetic tailored for serialized Urdu novels. The personality is intellectual, refined, and quiet, evoking the feeling of a high-end physical book collection. 

The visual style is a hybrid of **Modern Minimalism** and **Editorial Traditionalism**. It rejects contemporary trends like glassmorphism and heavy shadows in favor of structural integrity, thin borders, and layered surfaces. The interface prioritizes high-contrast legibility for Nastaliq script, utilizing a rich, dark-mode primary experience to reduce eye strain during long reading sessions, balanced by a warm, paper-inspired light mode for daytime consumption.

## Colors

The palette is divided into two distinct modes:

**Dark (Primary):** A tiered deep navy system. The background is never flat; depth is achieved by stepping through `#0A1128` for the base layer to `#1B2845` for interactive surfaces.
**Light:** A "Book-Paper" aesthetic using warm creams. This avoids the harshness of pure white, providing a comfortable reading surface that mimics aged vellum.

**Accent:** Antique Gold (`#C5A059`) is the sole metallic highlight. Use it exclusively for primary actions, current chapter indicators, or premium status markers. It should be used with restraint to maintain its "precious" quality.

## Typography

The typographic system is optimized for the vertical height of Nastaliq script. 

1. **Line Height:** A strict 1.8x to 2.0x line-height ratio must be maintained for all Urdu text to prevent the overlapping of diacritics and ensure a premium editorial flow.
2. **Alignment:** The Reader App uses RTL (Right-to-Left) orientation. The Admin Panel uses LTR (Left-to-Right) for technical metadata.
3. **Hierarchy:** Noto Nastaliq Urdu is used for all narrative content and headlines. Inter is reserved for utility labels, administrative data, and timestamps to provide a clear functional distinction from the creative content.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for the reading experience to mimic the proportions of a book page, while utilizing a **Fluid Grid** for discovery screens.

- **Reader View:** Content width is capped at 720px for optimal line length. Margins are generous to allow for a "breathing" editorial feel.
- **Admin Panel:** A 12-column fluid grid with 24px gutters.
- **Navigation:** All persistent navigation elements are separated from content by a 1px border.
- **RTL Logic:** In the reader app, the flow starts from the right. Sidebars, icons, and text alignment must flip globally.

## Elevation & Depth

This design system explicitly forbids shadows and blurs. Depth is communicated through **Tonal Layering** and **Structural Outlines**:

- **Layer 0 (Background):** The lowest base color.
- **Layer 1 (Cards/Containers):** One step lighter (Dark mode) or darker (Light mode) than the base.
- **Separation:** 1px solid borders are the primary tool for defining boundaries. Use `border_muted` for inactive elements and the primary accent color for active or focused states.
- **Interactions:** Hover states and active taps are indicated by shifting the background color to the next tier of the palette, never by increasing "height" or shadow.

## Shapes

The shape language is "Soft-Geometric." 

- **Corner Radius:** All components (Buttons, Inputs, Cards) use a tight 4px to 6px radius. 
- **Pill Shapes:** Strictly prohibited. Even tags and badges must maintain a rectangular form with slight corner softening to align with the architectural feel of the brand.
- **Icons:** Use thin (1px to 1.5px) line icons. Avoid filled icons unless used as a toggle state.

## Components

- **Novel Cards:** Features a subtle 1px border. The cover art is the hero, with title and author text placed below in a dedicated container layer. No "floating" text over imagery.
- **Buttons:** Rectangular with 4px corners. Primary buttons use the Antique Gold background with Dark Navy text. Secondary buttons use 1px Antique Gold borders with transparent backgrounds.
- **Status Badges:** Small, rectangular containers with 1px borders. Use muted secondary colors (e.g., a desaturated green border for "Completed") rather than bold solid blocks.
- **Input Fields:** High-contrast containers with 1px borders that thicken to 2px on focus. Labels must remain in Inter (label-sm) while the Urdu input text uses Noto Nastaliq (body-md).
- **Navigation Bar:** Fixed position with a 1px border separating it from the viewport. Icons are centered with labels positioned underneath in a 10px Inter font.
- **Editorial Headers:** Used at the start of chapters. These use `headline-xl` with an ornamental 1px divider line below to signify the transition into the story.