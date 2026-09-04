---
name: Northstar
description: A compact dark order-ticket ledger for evidence-led trading decisions.
colors:
  frame: "#07080a"
  rail: "#090b0e"
  panel: "#0e1116"
  control: "#0a0d12"
  line: "#242933"
  line-strong: "#363d49"
  text: "#f4f6f8"
  muted: "#9aa2ad"
  dim: "#858e9a"
  cobalt: "#5b8cff"
  cobalt-strong: "#79a2ff"
  cobalt-soft: "#17233c"
  action-cobalt: "#416fda"
  outcome-green: "#62c990"
  outcome-red: "#f07178"
  pending-amber: "#d9ad5b"
typography:
  headline:
    fontFamily: "Geist, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 670
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, Segoe UI, sans-serif"
    fontSize: "10px"
    fontWeight: 670
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  micro:
    fontFamily: "Geist, Segoe UI, sans-serif"
    fontSize: "9px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Geist, Segoe UI, sans-serif"
    fontSize: "8px"
    fontWeight: 720
    letterSpacing: "0.05em"
  numeric:
    fontFamily: "Geist Mono, monospace"
    fontSize: "9px"
    fontWeight: 620
    fontFeature: "tabular-nums"
rounded:
  compact: "3px"
  control: "4px"
  panel: "5px"
  brand: "6px"
  switch: "8px"
  round: "50%"
spacing:
  tight: "4px"
  compact: "6px"
  standard: "8px"
  panel: "10px"
  roomy: "14px"
components:
  button-primary:
    backgroundColor: "{colors.action-cobalt}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "28px"
  button-primary-hover:
    backgroundColor: "#4e7de5"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
  button-primary-active:
    backgroundColor: "#365fc0"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
  button-quiet:
    backgroundColor: "#11151b"
    textColor: "#c6ccd5"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "28px"
  input:
    backgroundColor: "{colors.control}"
    textColor: "{colors.text}"
    typography: "{typography.micro}"
    rounded: "{rounded.control}"
    padding: "0 8px"
    height: "29px"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "10px"
  navigation-active:
    backgroundColor: "{colors.cobalt-soft}"
    textColor: "#b9ceff"
    rounded: "{rounded.panel}"
    width: "34px"
    height: "34px"
  status-pill:
    backgroundColor: "#151d2e"
    textColor: "#a9c0f7"
    typography: "{typography.label}"
    rounded: "{rounded.compact}"
    padding: "0 7px"
    height: "19px"
---

# Design System: Northstar

## Overview

**Creative North Star: "The Order-Ticket Ledger"**

Northstar should feel like a trusted trading instrument: ink-black, compact, exact, and built around evidence rather than presentation. Graphite panes, cool type, cobalt interaction states, and hairline rules create the calm density of an order ticket crossed with an auditable ledger.

The system is deliberately code-led and operational. Brand appears through proportion, restraint, tabular figures, a keyed module swap, and the three-stroke Northstar mark—not through gradients, decorative illustration, or a generic field of floating dashboard cards.

**Key Characteristics:**

- Ink-black frame with tightly stepped graphite work surfaces.
- Cobalt owns selection, focus, enabled states, and the primary next action.
- Semantic colors stay sparse and carry evidence, risk, outcome, or connectivity meaning.
- One-pixel separators and compact 3–6px corners establish ledger structure.
- Geist Mono and tabular figures make numerical evidence scan as one aligned system.
- Dense desktop chrome remains usable at 110% browser zoom and adapts without losing hierarchy.

## Colors

The palette is a cool near-black neutral stack with one interaction accent and three tightly governed semantic signals.

### Primary

- **Action Cobalt** (#416fda): the filled primary action and selected binary state; use once per local decision cluster.
- **Selection Cobalt** (#5b8cff): focus borders, active indicators, and interactive emphasis.
- **Luminous Cobalt** (#79a2ff): keyboard focus, caret, icons, and readable accent text on dark surfaces.
- **Cobalt Wash** (#17233c): active navigation, selected modules, and low-emphasis enabled containers.

### Secondary

- **Verified Green** (#62c990): favorable evidence and confirmed online or active connectivity.
- **Risk Red** (#f07178): adverse evidence and short-side or risk-bearing state.
- **Pending Amber** (#d9ad5b): unresolved connection or account status that needs attention but is not an error.

### Neutral

- **Ink Frame** (#07080a): the outermost page field.
- **Rail Black** (#090b0e): persistent navigation chrome.
- **Panel Graphite** (#0e1116): the standard ledger pane.
- **Control Black** (#0a0d12): inset fields and nested controls.
- **Hairline Graphite** (#242933): default one-pixel structure.
- **Strong Hairline** (#363d49): emphasized one-pixel structure and control boundaries.
- **Cool White** (#f4f6f8): primary information and values.
- **Muted Steel** (#9aa2ad): secondary information and labels.
- **Dim Steel** (#858e9a): tertiary context and disabled-adjacent copy.

**The Outcome Color Rule.** Cobalt owns interaction. Green, red, and amber are semantic signals only; never use them as general decoration or to make ordinary chrome feel lively.

## Typography

**Display Font:** Geist (with Segoe UI and sans-serif fallbacks)  
**Body Font:** Geist (with Segoe UI and sans-serif fallbacks)  
**Label/Mono Font:** Geist Mono (with monospace fallback)

**Character:** Geist keeps the interface crisp and neutral at high density. Geist Mono is the evidentiary voice: prices, P&L, ratios, counts, time keys, and account identifiers use tabular figures so values compare without visual jitter.

### Hierarchy

- **Headline** (670, 16px, -0.02em): primary workspace or form heading.
- **Title** (670, 10px, -0.02em): compact pane and module heading.
- **Body** (400, 12px): inherited application baseline; most operational copy steps down to the micro role.
- **Micro** (400, 9px, 1.45): supporting copy, field values, and compact controls.
- **Label** (720, 8px, 0.05em, uppercase): terse metadata, field labels, status labels, and measurement keys.
- **Numeric** (620, 9px, tabular): default ledger figures; larger summary figures may scale to 14px or 19px while retaining the same mono treatment.

**The Ledger Figure Rule.** Any value meant to be compared across rows, time, or state uses Geist Mono with tabular figures; prose and pending-state language stay in Geist Sans.

## Layout

Northstar uses an 8px working rhythm, compact 4–6px internal gaps, and 10–14px panel insets. Desktop application chrome reserves a fixed 52px tool rail and a 40px command bar; flexible regions use `minmax(0, 1fr)` so dense content can contract without forcing the shell wider.

At 980px, matrices and supporting columns compress or redistribute. At 760px, the vertical rail becomes a sticky 46px top rail, the command bar remains 40px high beneath it, and the document returns to natural vertical scrolling. At 540px, field groups, metrics, modules, and supporting panes reduce to one or two columns. On desktop viewports at or below 620px tall, padding and fixed vertical allowances tighten while the primary action strip remains available.

**The First-Viewport Rule.** At desktop width, protect one compact operating viewport—including at 110% browser zoom—before adding vertical space; optional detail should swap, collapse, or flow responsively instead of permanently extending the desk.

## Elevation & Depth

The operating workspace is flat by default. Depth comes from near-black tonal steps, inset control fills, and one-pixel separators; adjacent panes do not cast ambient card shadows. Shadows are reserved for active signals, the primary action, and isolated authentication surfaces.

### Shadow Vocabulary

- **Signal glow** (`box-shadow: 0 2px 8px rgba(98, 201, 144, .24)`): tiny live indicators; pending indicators use the same geometry with amber at 26% opacity.
- **Action lift** (`box-shadow: 0 3px 10px rgba(39, 78, 165, .22)`): only beneath the filled cobalt action.
- **Isolated surface** (`box-shadow: 0 18px 50px rgba(0, 0, 0, .32)`): reserved for centered authentication or similarly detached modal surfaces.

**The Flat-by-Default Rule.** If a one-pixel line and tonal step can express hierarchy, do not add a shadow.

## Shapes

The form language is square, shallow, and mechanical. Status chips and checkbox interiors use 3px corners; fields and buttons use 4px; panes and navigation targets use 5px; the brand tile and isolated cards top out at 6px. Only switches, dots, and avatars become pill-shaped or circular. Borders are one pixel and remain visible against neighboring dark tones.

**The Shallow-Corner Rule.** Do not introduce soft 12–24px product-card radii; Northstar's authority depends on compact 3–6px geometry.

## Components

### Buttons

- **Shape:** compact rectangular controls with a 4px radius and 28px height.
- **Primary:** one cobalt-filled next action per decision cluster, with a crisp lighter border and shallow action shadow.
- **Hover / Focus:** hover lightens the cobalt fill; active deepens it; keyboard focus is a 2px luminous-cobalt outline with 2px offset.
- **Quiet / Text:** quiet buttons use graphite fill and a strong hairline; text actions remove the container and use luminous cobalt.

### Chips

- **Style:** status pills are 19px high, use 3px corners, uppercase micro-labels, and a small current-color dot.
- **State:** selected or locked states use cobalt wash and a cobalt hairline; outcome and connectivity states may substitute their semantic signal.

### Cards / Containers

- **Corner Style:** shallow panel corners (5px), never floating-card softness.
- **Background:** panel graphite over the ink frame; nested rows return to control black.
- **Shadow Strategy:** none in the operating workspace; rely on hairline structure.
- **Border / Padding:** one-pixel hairline with a compact 8–10px working inset.

### Inputs / Fields

- **Style:** control-black fill, strong graphite stroke, 4px radius, 29px single-line height, and 8px horizontal inset.
- **Focus:** shift the stroke to selection cobalt and slightly lift the control tone; preserve the global visible focus outline for keyboard navigation.
- **Error / Disabled:** disabled controls retain their structure at 54% opacity; errors use semantic color only when an actual error exists.

### Navigation

The desktop tool target is a 34px square inside the 52px rail. Default icons are dim steel; hover introduces panel graphite and a hairline; active state uses cobalt wash, pale cobalt type, and a 2px edge marker. Below 760px the same targets form a horizontal top rail and the active marker moves to the bottom edge.

### Segmented Controls & Checks

Binary controls sit inside a 29px inset frame. The selected segment uses the action fill, while checks use a 12px square indicator and the same cobalt selected state. Directional or risk semantics may use red only when the value itself is adverse or short-side, never for visual variety.

### Module Selector & Editor

Module tabs are 28px ledger cells with a label and an 18×11px switch. Selection uses cobalt wash and a stronger cobalt hairline. Only one inline editor occupies the module-editing row: changing the module re-keys that editor and runs a 180ms `cubic-bezier(.16, 1, .3, 1)` opacity, clip, and 2px vertical settle. Under reduced-motion preference, transition durations collapse to 0.01ms and smooth scrolling is removed.

**The Fixed-Editor Rule.** Optional modules change the content of one stable editor row; they do not accumulate into a vertical form stack.

## Do's and Don'ts

### Do:

- Do preserve ink-to-graphite separation with one-pixel hairlines before adding shadow.
- Do use cobalt for focus, selection, enabled state, and the primary next action.
- Do set prices, P&L, ratios, counts, and account identifiers in Geist Mono with tabular figures.
- Do keep desktop workspace chrome at a 52px rail, a 40px command bar, and an 8px working rhythm.
- Do re-key the active module editor and use the 180ms swap while honoring reduced motion.
- Do verify dense desktop views at 110% browser zoom and in the 620px low-height mode.

### Don't:

- Don't turn panes into floating rounded cards; standard containers are flat 5px ledger surfaces.
- Don't use green, red, or amber as decorative accents or substitutes for cobalt.
- Don't introduce gradients, glass, blur, or deep shadows into the operating workspace.
- Don't enlarge routine labels and controls into consumer-dashboard proportions; calibrated density is part of the product.
- Don't stack every optional module vertically; one fixed editor replaces another.
