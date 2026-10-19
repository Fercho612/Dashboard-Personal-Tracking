---
name: Serene Pulse
colors:
  surface: '#111319'
  surface-dim: '#111319'
  surface-bright: '#373940'
  surface-container-lowest: '#0c0e14'
  surface-container-low: '#191b22'
  surface-container: '#1e1f26'
  surface-container-high: '#282a30'
  surface-container-highest: '#33343b'
  on-surface: '#e2e2eb'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e2e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb2b7'
  on-tertiary: '#67001b'
  tertiary-container: '#ff516a'
  on-tertiary-container: '#5b0017'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#111319'
  on-background: '#e2e2eb'
  surface-variant: '#33343b'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: 4.25rem
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: '0'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0.005em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.04em
  metric-numeral:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system is tailored for an intentional, mindful personal productivity and wellness dashboard. It bridges analytical rigor with emotional equilibrium, avoiding high-stress gamification in favor of a calm, serene sense of agency. The interface serves knowledge workers, creators, and individuals seeking balanced momentum through sustainable routine building and deep focus.

### Aesthetic Paradigm: Tactile Soft-Modernism
The visual atmosphere synthesizes warm-tinted dark surfaces, ultra-refined borders, and luminous spectral accents. It combines the quiet spatial precision of contemporary editorial dashboards with the gentle tactility of physical stationery. Key attributes include:
- **Atmospheric Neutrality:** A foundation of charcoal, slate, and warm basalt that reduces visual fatigue during sustained daily usage.
- **Intentional Chromatic Signals:** Strategic, high-chroma accents (electric violet for active state focus, emerald for grounded completion, and warm coral for urgent prompts) against deeply desaturated base layers.
- **Restraint and Quiet Elevation:** Depth achieved through translucent edge highlights, tinted ambient occlusion, and subtle background tiering rather than harsh Drop Shadows.

## Colors

The color architecture is built for dark mode as the default experience, utilizing a rich, warm basalt and carbon foundation (`#0F1117`) that prevents the sterile chill of pure cold slate.

### Functional Roles & Accents
- **Primary (`#6366F1` - Electric Indigo):** The focal anchor for intentional focus modes, active timeline spans, primary action buttons, and current day markers.
- **Secondary (`#10B981` - Emerald Growth):** Dedicated to wellness milestones, habit streaks, completed rituals, and positive trend vectors in productivity analytics.
- **Tertiary (`#F43F5E` - Rose Coral):** Denotes critical priority tasks, deadline thresholds, and alert states without producing anxiety-inducing alarm.
- **Neutral Surface Hierarchy:**
  - Base Background: `#0F1117`
  - Elevated Container / Canvas Surface: `#161922`
  - Higher Elevation / Interactive Cards: `#1E222D`
  - Floating Panels / Overlays: `#262B3A`
  - Ghost Borders & Subtle Dividers: `rgba(255, 255, 255, 0.08)`
  - Active Ring Borders: `rgba(99, 102, 241, 0.35)`
- **Typography Tone Mapping:**
  - High Contrast (Headings, Metrics): `#F8FAFC`
  - Medium Contrast (Body, Metrics labels): `#94A3B8`
  - Subtle Contrast (Meta information, Placeholders): `#64748B`

## Typography

The typographic expression centers on **Plus Jakarta Sans**, chosen for its crisp geometric construction tempered by humanist warmth in terminal curves and apertures. This eliminates the cold clinical tone typical of analytical dashboards.

### Hierarchy & Composition Rules
- **Numerical Scannability:** Numeric displays within habit matrices, focus timers, and completion velocities employ tabular figures (`tnum`) with negative tracking for compact clarity.
- **Contextual Micro-Labels:** `label-sm` utilizes uppercase transform paired with `+0.04em` tracking for category pill identifiers, section metadata, and habit schedule headings.
- **Rhythmic Densities:** Long-form journaling or reflection inputs use `body-lg` at 1.75 line-height to encourage slow, measured intake, whereas dashboard widgets utilize `body-sm` for space-efficient glanceability.

## Layout & Spacing

The system enforces a flexible 12-column structural grid for desktop dashboards, reflowing into an adaptable dual-column layout for tablets, and an uninterrupted single-column stack on mobile viewports.

### Grid & Viewport Adaptation
- **Desktop (1280px+):** 12-column grid, `margin-desktop: 3rem`, `gutter-desktop: 1.5rem`. Layout maintains a modular 3-pane architecture: Persistent Left Rail (Navigation & Quick Routines), Main Canvas (Calendar Grid, Habit Matrix), and Contextual Right Drawer (Daily Journal & Analytics Insight).
- **Tablet (768px - 1279px):** 8-column layout, `margin-tablet: 2rem`, `gutter: 1.25rem`. Navigation collapses to an icon dock; habit tracking and weekly schedule view stack vertically with horizontal card panning.
- **Mobile (Below 768px):** 4-column flow, `margin: 1rem`, `gutter-mobile: 0.75rem`. Widgets convert to swipeable segment decks; bottom persistent command dock hosts daily completion triggers.

### Component Spacing Cadence
- Use `space-xs` (4px) for micro badge padding and icon-to-label inline offsets.
- Use `space-sm` (8px) for list element separation and habit check-matrix cell gaps.
- Use `space-md` (16px) for interior card padding across compact widgets.
- Use `space-lg` (24px) for modular dashboard section padding and primary card containers.
- Use `space-xl` (36px) for major vertical canvas division and layout category milestones.

## Elevation & Depth

Visual hierarchy uses **tonal layering** and **low-contrast perimeter illumination** rather than heavy black drop shadows. Because the background is dark, depth is expressed by lightening container surfaces and applying delicate luminous borders.

### Surface Elevation Hierarchy
- **Base Canvas (Level 0):** Hex `#0F1117`. Flat foundational plane.
- **Card Tier 1 (Level 1):** Hex `#161922` combined with a continuous border: `1px solid rgba(255, 255, 255, 0.06)`. Used for daily schedule rows, standard metrics, and resting habit blocks.
- **Floating Containers & Hover States (Level 2):** Hex `#1E222D` with top-edge specular highlight: `1px solid rgba(255, 255, 255, 0.12)` on top, `1px solid rgba(255, 255, 255, 0.04)` on sides and bottom. Ambient shadow: `0 8px 24px -4px rgba(0, 0, 0, 0.45)`.
- **Modals, Overlays & Drawers (Level 3):** Hex `#262B3A` featuring `0 20px 40px -8px rgba(0, 0, 0, 0.65)` and active ambient bleed tinted to the accent color (`rgba(99, 102, 241, 0.08)`).
- **Interactive Habit Completion Glow:** When a habit or task transition to completed occurs, an ambient emerald bloom is applied: `0 0 20px 0 rgba(16, 185, 129, 0.25)`.

## Shapes

The design system employs a **Rounded (Level 2)** shape language, balancing structural modernity with organic comfort. Sharp rectangular edges are prohibited to ensure the dashboard feels approachable and wellness-oriented.

### Geometry Specifications
- **Base Element Radius (0.5rem / 8px):** Applied to form inputs, habit grid check-nodes, list items, and segment control pills.
- **Card & Module Radius (1rem / 16px):** Applied to standard dashboard cards, calendar view tiles, weekly agenda clusters, and data chart containers.
- **Overlay & Modal Radius (1.5rem / 24px):** Reserved for sheet dialogs, reflection drawers, and elevated interactive summaries.
- **Pill Exceptions (`9999px`):** Status indicator tags, priority badges, circular progress counters, and primary action FABs.

## Components

### Buttons
- **Primary:** Filled with `#6366F1` (Indigo), white text (`#FFFFFF`), `font-weight: 600`, radius `0.5rem`. Subtle interior top highlight: `inset 0 1px 0 rgba(255, 255, 255, 0.2)`. Hover triggers slight luminance increase and subtle lift.
- **Secondary (Ghost-Tinted):** Background `rgba(255, 255, 255, 0.05)`, border `1px solid rgba(255, 255, 255, 0.08)`, text `#F8FAFC`. On hover, background shifts to `rgba(255, 255, 255, 0.09)`.
- **Urgent Action:** Deep coral base `rgba(244, 63, 94, 0.15)` with text `#F43F5E` and border `1px solid rgba(244, 63, 94, 0.3)`.

### Habit Tracking Grid & Nodes
- **Habit Matrix Node:** A square `36x36px` cell with `rounded-sm` (6px).
- **Incomplete State:** Background `rgba(255, 255, 255, 0.03)`, border `1px dashed rgba(255, 255, 255, 0.1)`.
- **Complete State:** Background `#10B981` (Emerald), smooth scalar scale bounce (`scale(1.05)` to `scale(1.0)` over 200ms), displaying a miniature white check icon and localized glow `0 0 12px rgba(16, 185, 129, 0.3)`.
- **Streak Continuity:** A connecting micro-line (`2px` height) runs between consecutive completed nodes, tinted `#10B981` at `40%` opacity.

### Weekly Calendar Views
- **Day Columns:** Vertical segmented tracks, separated by hairline dividers (`rgba(255, 255, 255, 0.04)`).
- **Current Day Header:** Emphasized with an indigo indicator pill above the date numeral, with the active column bathed in a linear gradient fading from `rgba(99, 102, 241, 0.04)` at the top to transparent at the bottom.
- **Event / Time Block Cards:** Rounded blocks (`8px`) with high-translucency surfaces (`rgba(30, 34, 45, 0.85)`), featuring a solid 3px left edge colored by category (Indigo for Deep Work, Emerald for Vitality/Exercise, Coral for Urgent Client Commitments).

### Inputs & Reflection Fields
- **Text Inputs:** Background `#161922`, border `1px solid rgba(255, 255, 255, 0.08)`, text `#F8FAFC`, placeholder text `#64748B`.
- **Focus State:** Border transitions to `#6366F1` with an outer ring `0 0 0 3px rgba(99, 102, 241, 0.2)`.
- **Mindful Text Area (Journaling):** Borderless aesthetic with a faint baseline border and subtle background contrast to provide a distraction-free writing experience.

### Checkboxes & Segmented Controls
- **Checkboxes:** 20px custom rounded squares (`radius: 6px`). Unchecked: border `1.5px solid rgba(255, 255, 255, 0.2)`. Checked: `#10B981` fill with an animated checkmark path.
- **Segmented Time Range Switches:** Pill container (`#161922`) enclosing active items with `#1E222D` background, subtle white rim border, and white label.

### Cards & Analytical Widgets
- **Standard Card:** Background `#161922`, border `1px solid rgba(255, 255, 255, 0.06)`, padding `space-lg`, corner radius `1rem`.
- **Trend Charts:** Clean vector line charts without heavy grid backgrounds; zero-axis marked with low-opacity dashes. Lines use smooth cubic bezier curves accompanied by a vertical gradient area fill trailing down to zero opacity.