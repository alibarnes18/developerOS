# Forge — UI Guidelines

**Status:** Draft v0.1
**Brand relationship:** Independent from Nexflow — Forge has its own identity.

---

## 1. Design Thesis

Forge's core job is making context switching *visible and instant*. The one design idea everything else serves: **the active workspace should be unmistakable at a glance**, and moving between workspaces should feel like walking into a different, clearly-marked room — not like changing a filter on the same page.

The signature element: a persistent **workspace rail** on the left edge, where each workspace is a colored mark (its `accent_color` from the database). The accent color follows that workspace everywhere — task borders, the dashboard header, note tags — so a screenshot alone tells you which venture you're looking at, with no label required.

---

## 2. Color

| Token | Hex | Use |
|---|---|---|
| `bg-base` | `#12141A` | App background — deep graphite, not pure black |
| `bg-panel` | `#1A1D26` | Cards, sidebars, elevated surfaces |
| `text-primary` | `#E8EAF0` | Primary text |
| `text-muted` | `#8B90A0` | Secondary text, timestamps, labels |
| `accent-forge` | `#FF6B35` | Default/system accent (buttons, focus states) — an ember-orange, distinct from the common AI-generated terracotta (#D97757) |

**Workspace accent colors** are chosen per-workspace from a fixed palette (not free-form, to keep the UI coherent):
`#FF6B35` (ember) · `#3DDC84` (jade) · `#4D96FF` (cobalt) · `#C77DFF` (violet) · `#FFD23F` (amber)

A workspace's accent tints its rail mark, its dashboard header underline, and its task priority badges — nowhere else. Restraint matters here: the base UI stays graphite/neutral so the accent has something quiet to stand out against.

## 3. Typography

| Role | Typeface | Notes |
|---|---|---|
| Display / headings | **Space Grotesk** | Slightly technical, geometric — used with restraint, not on every line |
| Body | **Inter** | Readable at small sizes, standard for dense UI |
| Mono (task IDs, timestamps, code, CLI output) | **JetBrains Mono** | Reinforces "developer OS" register in exactly the places where precision matters |

Type scale: `12 / 14 / 16 / 20 / 28 / 36px`, weights limited to 400/500/600 — no 300 or 800, to avoid the flattened-then-overdramatic contrast that reads as templated.

## 4. Layout

```
┌────┬─────────────────────────────────────┐
│ W  │  Workspace Header (accent underline) │
│ o  ├─────────────────────────────────────┤
│ r  │  Dashboard / Tasks / Notes / Chat    │
│ k  │                                       │
│ r  │                                       │
│ a  │                                       │
│ i  │                                       │
│ l  │                                       │
└────┴─────────────────────────────────────┘
```

- **Workspace rail:** fixed-width (64px collapsed, expandable to show names), always visible, one colored dot per workspace.
- **Main panel:** the active view — dashboard is the default landing view, not the task list, because "what needs attention" is the daily first question (per PRD §8/§9).
- Density: compact by default — this is a daily-driver tool for the owner, not a marketing surface. Favor information density over generous whitespace, especially in task lists.

## 5. Components — Rules, Not Just Styles

- **Task priority** is shown as a small colored dot + label, never a colored background fill on the whole row — keeps lists scannable when there are many items.
- **Empty states** describe what to do next in the interface's own voice: "No tasks yet in this workspace — add your first one" rather than a generic illustration with no action.
- **AI chat messages** are visually distinct from human-authored notes at all times — no styling choice should make it ambiguous whether text came from the assistant or from the owner. This matters because Forge stores decisions; provenance must stay legible.
- Buttons: primary action uses `accent-forge`, not the active workspace's accent — workspace accent is for *identity*, not for *action*, so the two visual languages don't collide.

## 6. Motion

Minimal and functional only:
- Workspace switch: a brief (150ms) cross-fade, no slide/parallax — signals "context changed" without theatrics.
- No decorative animation on load, hover ripples, or scroll effects. This is a tool used dozens of times a day; motion should never cost attention.

## 7. Accessibility Floor (non-negotiable, even for a single-user MVP)

- All interactive elements have a visible keyboard focus state.
- Color is never the only signal — priority/status always pair color with text or an icon.
- Respect `prefers-reduced-motion`.

Building this in from v0.1 costs little and avoids retrofitting once the community/team phases (§4 of PRD.md) bring in users who need it.

---
*Next document: CONTRIBUTING.md — how code following these guidelines gets reviewed and merged.*
