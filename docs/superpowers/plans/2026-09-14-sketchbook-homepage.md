# Sketchbook Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the redirect at `/` with a sketchbook-styled homepage that shows all 108 works with parallax, margin notes, per-work likes stored in Upstash Redis, and a matching full-screen viewer.

**Architecture:** A server page (`app/page.tsx`) hands the existing `chapters` / `hangingOrder` data to one client component tree under `components/sketchbook/`. Motion is a tiny shared `requestAnimationFrame` parallax hook plus CSS transitions; likes are a React context backed by a two-call route handler whose storage sits behind a `LikesStore` interface (in-memory locally, Upstash REST in production). Design tokens live once in `app/globals.css` and are documented in `docs/design-system.md`.

**Tech Stack:** Next.js 16.3.5 (App Router, `next/image`, `next/font/google`, route handlers), React 19, Tailwind CSS 4 (`@theme`), TypeScript 5, Node 24 built-in test runner (`node --test`, native type stripping). No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-09-14-sketchbook-homepage-design.md`

## Global Constraints

- Next.js in this repo is **16.3.5** and differs from older versions. Before writing any Next code, read the relevant file under `node_modules/next/dist/docs/01-app/` (route handlers: `03-api-reference/03-file-conventions/route.md`; fonts: `03-api-reference/02-components/font.md`; images: `03-api-reference/02-components/image.md`). `GET` route handlers are dynamic by default since v15; do not add `export const dynamic`.
- **No new runtime dependencies.** `package.json` `dependencies` stays `next`, `react`, `react-dom`. Tests use `node --test` only.
- **Only the homepage changes** (Tasks 1–10c). From Task 10d on, per the user's decision on 2026-09-14, `/gallery` and `/about` are deleted along with the components only they used, and the story route's links are repointed to `/`; `app/ganesh-chaturthi` is otherwise untouched. Existing CSS tokens keep their values; new tokens are added, never renamed.
- **Ink is never black.** Every colour on the homepage comes from the tokens in Task 1. No hex literals in components.
- **Copy rules.** Handwritten copy is lower-case and conversational; numbers are shown as `No. 061` (three digits via `formatNumber` from `components/Plate.tsx`). Counts in headings are spelled out with `inWords` / `inWordsCapitalised` from `lib/words.ts`.
- **Motion rules.** Parallax only at `min-width: 768px` and `prefers-reduced-motion: no-preference`. Every animation has a reduced-motion fallback (the existing global rule in `globals.css` already zeroes durations).
- **Accessibility.** Every work is a `button` with `aria-label="Open No. 061, Dance by the Diya"`. The like heart is a separate `button` with `aria-pressed`. Handwriting is never smaller than 15px.
- **Type stripping.** Files imported by tests (`lib/likes-store.ts`, `lib/likes-api.ts`) must use only erasable TypeScript: no `enum`, no parameter properties (`constructor(private x)`), no namespaces. Test files import them with an explicit `.ts` extension.
- **Commits.** One commit per task, message in imperative mood, ending with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. Never `git add -A`; `.gitignore`, `README.md` and the untracked pre-existing work in the tree are not part of this plan except where a task names them.

---

## File map

| Path | Responsibility | Task |
| --- | --- | --- |
| `app/globals.css` | Design tokens (`@theme` + `:root`), `.room-sketch` scope, sketch primitives (`sk-*`) | 1, 5, 7, 8, 9 |
| `app/layout.tsx` | Adds the Caveat font variable | 1 |
| `docs/design-system.md` | Token reference and Likes API | 1 |
| `lib/likes-store.ts` | `LikesStore`, `MemoryStore`, `UpstashStore`, `getStore` | 2 |
| `lib/likes-store.test.ts` | Store tests | 2 |
| `lib/likes-api.ts` | `parseToggle` request validation | 3 |
| `lib/likes-api.test.ts` | Validation tests | 3 |
| `app/api/likes/route.ts` | `GET` counts, `POST` toggle | 3 |
| `.env.example` | Upstash variable names | 3 |
| `lib/likes.tsx` | `LikesProvider`, `useLikes` | 4 |
| `components/sketchbook/LikeButton.tsx` | Heart + count | 4 |
| `lib/useParallax.ts` | Shared parallax loop | 5 |
| `data/notes.ts` | Chapter taglines and margin notes | 6 |
| `components/sketchbook/doodles.tsx` | Arrow, heart, close, star and festival doodle SVGs | 7, 9b |
| `components/sketchbook/DoodleField.tsx` | Seeded doodle scatter behind a section | 9b |
| `components/sketchbook/MarginNote.tsx` | A note with an arrow | 7 |
| `components/sketchbook/PinnedWork.tsx` | One framed work with caption, heart and note | 7 |
| `components/sketchbook/HandNav.tsx` | Handwritten nav | 8 |
| `components/sketchbook/Desk.tsx` | Hero | 8 |
| `components/sketchbook/Sketchbook.tsx` | Page composition, viewer state | 8, 9, 10 |
| `app/page.tsx` | The homepage | 8 |
| `components/sketchbook/IntroNote.tsx` | Intro + contents | 9 |
| `components/sketchbook/ChapterPage.tsx` | One chapter, three drifting columns | 9 |
| `components/sketchbook/StoryDoor.tsx` | Doorway to Story and About | 9 |
| `components/sketchbook/SignOff.tsx` | Footer line | 9 |
| `lib/useLightbox.ts` | Keyboard, focus, scroll lock, swipe | 10 |
| `components/sketchbook/SketchViewer.tsx` | Full-screen sketch viewer | 10 |
| `README.md` | Route table and Upstash note | 11 |

---

### Task 1: Design tokens, font and design-system doc

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css` (append after the existing `.tilt-b` rules at the end of the file)
- Create: `docs/design-system.md`

**Interfaces:**
- Produces: CSS custom properties listed below, the `.room-sketch` scope, the `font-hand` Tailwind utility, and the `sk-wall`, `sk-frame`, `sk-frame--b`, `sk-tape`, `sk-tape--r`, `sk-hl`, `sk-circle`, `sk-px`, `sk-swing`, `sk-write`, `sk-heart`, `sk-hand-*` classes that every later task uses.

- [ ] **Step 1: Add the Caveat font to the root layout**

Replace the top of `app/layout.tsx` so it reads:

```tsx
import type { Metadata } from "next";
import { Archivo, Caveat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
```

and change the `<html>` className to:

```tsx
<html lang="en" className={`${cormorant.variable} ${archivo.variable} ${caveat.variable} h-full`}>
```

- [ ] **Step 2: Add the tokens to `app/globals.css`**

Add these lines inside the existing `@theme { ... }` block, after `--ease-gallery`:

```css
  /* --- sketchbook: Clay & Sindoor -------------------------------------- */
  --color-paper-clay: #f4ead8;
  --color-mat-clay: #fffaf2;
  --color-umber: #3b2a20;
  --color-umber-soft: #7a6656;
  --color-umber-faint: #a08f7c;
  --color-terracotta: #b8532f;
  --color-ochre: #8a5a1c;
  --color-turmeric: #f0c75e;
  --color-teal: #2a7f86;
  --color-sindoor: #c9453a;
  --color-tape: rgba(200, 160, 110, 0.55);
  --color-rule-clay: rgba(59, 42, 32, 0.2);
  --color-margin-line: rgba(184, 83, 47, 0.4);

  --font-hand: var(--font-caveat), "Segoe Print", "Bradley Hand", cursive;

  --ease-swing: cubic-bezier(0.34, 1.4, 0.64, 1);
```

Then append this block at the very end of `app/globals.css`:

```css
/* ---------------------------------------------------------------------------
   THE SKETCHBOOK
   The homepage is the artist's own notebook: clay paper, umber ink, tape,
   handwritten notes in the margin. Tokens first, then the primitives.
   --------------------------------------------------------------------------- */

:root {
  /* type scale */
  --text-hand-display: clamp(3rem, 9vw, 7.5rem);
  --text-hand-heading: clamp(2.25rem, 5vw, 4rem);
  --text-hand-subhead: clamp(1.5rem, 2.2vw, 1.875rem);
  --text-hand-note: clamp(1.25rem, 1.5vw, 1.375rem);
  --text-hand-caption: 1.1875rem;
  --text-hand-small: 0.9375rem;
  --text-serif-lead: clamp(1.25rem, 1.6vw, 1.375rem);
  --text-serif-body: 1.125rem;

  /* space, 4px base */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;
  --space-9: 96px; --space-10: 144px;
  --wall-sketch: 1440px;

  /* shape */
  --radius-wobble-a: 255px 15px 225px 15px / 15px 225px 15px 255px;
  --radius-wobble-b: 15px 225px 15px 255px / 255px 15px 225px 15px;
  --radius-hand-circle: 50% 48% 52% 50% / 48% 52% 48% 52%;
  --frame-stroke: 2px;
  --tape-w: 56px;
  --tape-h: 16px;

  /* depth */
  --shadow-ink-sm: 3px 4px 0 var(--color-umber);
  --shadow-ink: 4px 5px 0 var(--color-umber);

  /* motion */
  --dur-swing: 900ms;
  --dur-write: 600ms;
  --dur-like: 350ms;
  --px-title: -0.08;
  --px-lead: 0.05;
  --px-study: 0.14;
  --px-col-a: 0.06;
  --px-col-b: -0.04;
  --px-col-c: 0.10;
}

/* The room: remap the generic roles the other rooms use, so anything that
   reads --color-ink or --color-paper inside picks up the clay palette. */
.room-sketch {
  --color-paper: var(--color-paper-clay);
  --color-mat: var(--color-mat-clay);
  --color-ink: var(--color-umber);
  --color-ink-soft: var(--color-umber-soft);
  --color-ink-faint: var(--color-umber-faint);
  --color-rule: var(--color-rule-clay);
  --color-brass: var(--color-terracotta);

  color: var(--color-ink);
  font-family: var(--font-hand);
  background-color: var(--color-paper);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.07'/%3E%3C/svg%3E");
  background-size: 160px 160px;
  min-height: 100vh;
  overflow-x: clip;
}

.room-sketch ::selection {
  background: color-mix(in oklab, var(--color-turmeric) 55%, transparent);
}

.room-sketch :focus-visible {
  outline: 2px solid var(--color-teal);
  outline-offset: 3px;
}

/* the page wrapper, with the notebook margin line from tablet up */
.sk-wall {
  position: relative;
  max-width: var(--wall-sketch);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

@media (min-width: 768px) {
  .sk-wall::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(var(--gutter) - 18px);
    width: 1px;
    background: var(--color-margin-line);
    pointer-events: none;
  }
}

/* handwriting scale */
.sk-hand-display { font-family: var(--font-hand); font-weight: 700; font-size: var(--text-hand-display); line-height: 0.84; }
.sk-hand-heading { font-family: var(--font-hand); font-weight: 700; font-size: var(--text-hand-heading); line-height: 0.9; }
.sk-hand-subhead { font-family: var(--font-hand); font-weight: 600; font-size: var(--text-hand-subhead); line-height: 1; }
.sk-hand-note    { font-family: var(--font-hand); font-weight: 500; font-size: var(--text-hand-note); line-height: 1.05; }
.sk-hand-caption { font-family: var(--font-hand); font-weight: 500; font-size: var(--text-hand-caption); line-height: 1; }
.sk-hand-small   { font-family: var(--font-hand); font-weight: 500; font-size: var(--text-hand-small); line-height: 1.1; }
.sk-serif-lead   { font-family: var(--font-display); font-weight: 300; font-size: var(--text-serif-lead); line-height: 1.5; }
.sk-serif-body   { font-family: var(--font-display); font-weight: 400; font-size: var(--text-serif-body); line-height: 1.6; }

/* the wobbly ink frame */
.sk-frame {
  position: relative;
  background: var(--color-mat);
  border: var(--frame-stroke) solid var(--color-ink);
  border-radius: var(--radius-wobble-a);
  padding: clamp(4px, 0.6vw, 8px);
  box-shadow: var(--shadow-ink);
}

.sk-frame--b { border-radius: var(--radius-wobble-b); }

.sk-frame img { display: block; width: 100%; height: auto; }

/* masking tape, top-left by default, top-right with --r */
.sk-tape {
  position: absolute;
  z-index: 2;
  width: var(--tape-w);
  height: var(--tape-h);
  left: -14px;
  top: -9px;
  background: var(--color-tape);
  transform: rotate(-8deg);
  pointer-events: none;
}

.sk-tape--r { left: auto; right: -14px; transform: rotate(9deg); }

/* a word with highlighter behind it */
.sk-hl { position: relative; display: inline-block; z-index: 0; }
.sk-hl::after {
  content: "";
  position: absolute;
  left: -4px; right: -6px; bottom: 0.12em;
  height: 0.38em;
  background: var(--color-turmeric);
  opacity: 0.75;
  transform: rotate(-1deg);
  z-index: -1;
}

/* a numeral in a hand-drawn circle */
.sk-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4em;
  height: 2.4em;
  border: var(--frame-stroke) solid var(--color-ink);
  border-radius: var(--radius-hand-circle);
  transform: rotate(-6deg);
  font-family: var(--font-hand);
  font-weight: 700;
}

/* parallax carrier: rotation is static, --py is set by useParallax */
.sk-px {
  transform: rotate(var(--rot, 0deg)) translateY(var(--py, 0px));
  will-change: transform;
}

/* swing-in on arrival: pair with useArrival, which adds .is-in */
.sk-swing {
  opacity: 0;
  transform: rotate(calc(var(--rot, 0deg) - 4deg)) translateY(28px);
}

.sk-swing.is-in {
  opacity: 1;
  transform: rotate(var(--rot, 0deg));
  transition:
    opacity var(--dur-swing) var(--ease-gallery),
    transform var(--dur-swing) var(--ease-swing);
  transition-delay: var(--reveal-delay, 0ms);
}

/* a caption that writes itself on after the frame has settled */
.sk-write {
  clip-path: inset(0 100% 0 0);
}

.is-in .sk-write {
  clip-path: inset(0 0 0 0);
  transition: clip-path var(--dur-write) var(--ease-gallery);
  transition-delay: calc(var(--reveal-delay, 0ms) + 400ms);
}

/* the like heart */
.sk-heart {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: none;
  cursor: pointer;
  font-family: var(--font-hand);
  font-weight: 600;
  font-size: var(--text-hand-small);
  color: var(--color-ink-faint);
  padding: 4px 6px;
  margin: -4px -6px;
  border-radius: 6px;
  transition: color 300ms var(--ease-gallery);
}

.sk-heart svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: var(--color-ink);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
  transition: fill 200ms var(--ease-gallery), stroke 200ms var(--ease-gallery);
}

.sk-heart.is-on { color: var(--color-ink); }
.sk-heart.is-on svg { fill: var(--color-sindoor); stroke: var(--color-sindoor); }

@keyframes sk-thump {
  0% { transform: scale(1); }
  35% { transform: scale(1.35) rotate(-8deg); }
  70% { transform: scale(0.92); }
  100% { transform: scale(1); }
}

.sk-heart.is-thump svg { animation: sk-thump var(--dur-like) var(--ease-swing) both; }

@media (prefers-reduced-motion: reduce) {
  .sk-swing { transform: rotate(var(--rot, 0deg)); }
  .sk-write { clip-path: none; }
  .sk-px { transform: rotate(var(--rot, 0deg)); }
}
```

- [ ] **Step 3: Write `docs/design-system.md`**

```markdown
# Ganapati design system

One token set, defined in `app/globals.css`, used by every room of the site.
The lit gallery and the dark story room already use the generic roles
(`--color-paper`, `--color-ink`, ...). The sketchbook homepage adds the
Clay & Sindoor palette and remaps those roles inside `.room-sketch`.

## Colour: Clay & Sindoor

| Role | Token | Value | Tailwind | Used for |
| --- | --- | --- | --- | --- |
| paper | `--color-paper-clay` | `#f4ead8` | `bg-paper-clay` | page ground |
| mat | `--color-mat-clay` | `#fffaf2` | `bg-mat-clay` | inside the frames |
| ink | `--color-umber` | `#3b2a20` | `text-umber` | headings, frames, body ink |
| soft | `--color-umber-soft` | `#7a6656` | `text-umber-soft` | secondary text |
| faint | `--color-umber-faint` | `#a08f7c` | `text-umber-faint` | hints, tertiary text (decorative only) |
| accent | `--color-terracotta` | `#b8532f` | `text-terracotta` | numbers, underlines, active nav |
| note | `--color-ochre` | `#8a5a1c` | `text-ochre` | margin notes and arrows |
| highlight | `--color-turmeric` | `#f0c75e` | `bg-turmeric` | highlighter behind a word |
| link | `--color-teal` | `#2a7f86` | `text-teal` | links, focus ring |
| like | `--color-sindoor` | `#c9453a` | `text-sindoor` | the liked heart |
| tape | `--color-tape` | `rgba(200,160,110,.55)` | `bg-tape` | masking tape |
| rule | `--color-rule-clay` | `rgba(59,42,32,.2)` | `border-rule-clay` | thin rules |
| margin | `--color-margin-line` | `rgba(184,83,47,.4)` | | the notebook margin line |

Contrast on paper: ink 11.9:1, soft 5.1:1, terracotta 4.6:1, ochre 5.6:1,
teal 4.7:1. Faint is below 4.5:1 and is only used decoratively.

## Type

Faces: `--font-hand` (Caveat, handwriting), `--font-display` (Cormorant
Garamond, serif), `--font-ui` (Archivo, not used on the homepage).

| Class | Token | Size |
| --- | --- | --- |
| `.sk-hand-display` | `--text-hand-display` | 3rem → 7.5rem |
| `.sk-hand-heading` | `--text-hand-heading` | 2.25rem → 4rem |
| `.sk-hand-subhead` | `--text-hand-subhead` | 1.5rem → 1.875rem |
| `.sk-hand-note` | `--text-hand-note` | 1.25rem → 1.375rem |
| `.sk-hand-caption` | `--text-hand-caption` | 1.1875rem |
| `.sk-hand-small` | `--text-hand-small` | 0.9375rem |
| `.sk-serif-lead` | `--text-serif-lead` | 1.25rem → 1.375rem |
| `.sk-serif-body` | `--text-serif-body` | 1.125rem |

## Space

`--space-1` … `--space-10`: 4, 8, 12, 16, 24, 32, 48, 64, 96, 144px.
`--gutter` is the page gutter (existing). `--wall-sketch` is the 1440px
wrapper (`.sk-wall`).

## Shape and depth

`--radius-wobble-a` / `--radius-wobble-b` (the hand-drawn frame),
`--radius-hand-circle`, `--frame-stroke: 2px`, tape `56px × 16px`.
`--shadow-ink-sm: 3px 4px 0 umber`, `--shadow-ink: 4px 5px 0 umber`.

Primitives: `.sk-frame` (+ `.sk-frame--b`), `.sk-tape` (+ `.sk-tape--r`),
`.sk-hl`, `.sk-circle`.

## Motion

`--ease-gallery` (existing), `--ease-swing: cubic-bezier(0.34, 1.4, 0.64, 1)`.
Durations: `--dur-swing: 900ms`, `--dur-write: 600ms`, `--dur-like: 350ms`.
Parallax speeds: `--px-title: -0.08`, `--px-lead: 0.05`, `--px-study: 0.14`,
`--px-col-a: 0.06`, `--px-col-b: -0.04`, `--px-col-c: 0.10`.

Primitives: `.sk-px` (parallax carrier, `--py` set by `useParallax`),
`.sk-swing` (+ `.is-in` from `useArrival`), `.sk-write`, `.sk-heart`
(+ `.is-on`, `.is-thump`).

Parallax and swing are off under `prefers-reduced-motion: reduce`; parallax
is also off under 768px.

## Likes API

Counts are stored in Upstash Redis (hash `likes`, field = work id). Locally,
with no Upstash variables set, an in-memory store is used.

Environment: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (the names
the Vercel Marketplace integration injects).

| Call | Body | Response |
| --- | --- | --- |
| `GET /api/likes` | | `{ "counts": { "61": 5, "3": 12 } }` |
| `POST /api/likes` | `{ "id": 61, "delta": 1 }` | `{ "id": 61, "count": 6 }` |

`delta` is `1` or `-1`; `id` must be a work in the collection. Anything
else is `400`. If the store is unreachable the `POST` returns `503` and the
client reverts its optimistic change. The client keeps liked ids in
`localStorage["ganapati:liked"]`, one like per visitor.
```

- [ ] **Step 4: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed with no errors. (The build downloads Caveat; if offline, `next/font` fails loudly. Retry online.)

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/globals.css docs/design-system.md
git commit -m "Add Clay & Sindoor design tokens and sketchbook primitives

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Likes store (memory + Upstash) with tests

**Files:**
- Create: `lib/likes-store.ts`
- Create: `lib/likes-store.test.ts`
- Modify: `package.json` (add `test` script)
- Modify: `tsconfig.json` (add `allowImportingTsExtensions`)

**Interfaces:**
- Produces:
  ```ts
  export interface LikesStore {
    all(): Promise<Record<number, number>>;
    bump(id: number, delta: 1 | -1): Promise<number>;
  }
  export class MemoryStore implements LikesStore {}
  export class UpstashStore implements LikesStore {
    constructor(url: string, token: string, fetchImpl?: typeof fetch);
  }
  export function getStore(env?: Record<string, string | undefined>): LikesStore;
  ```

- [ ] **Step 1: Add the test script and tsconfig flag**

In `package.json` `scripts`, add:

```json
"test": "node --test lib/*.test.ts"
```

In `tsconfig.json` `compilerOptions`, add:

```json
"allowImportingTsExtensions": true,
```

- [ ] **Step 2: Write the failing tests**

Create `lib/likes-store.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { MemoryStore, UpstashStore, getStore } from "./likes-store.ts";

test("MemoryStore starts empty and counts up and down", async () => {
  const store = new MemoryStore();
  assert.deepEqual(await store.all(), {});
  assert.equal(await store.bump(61, 1), 1);
  assert.equal(await store.bump(61, 1), 2);
  assert.equal(await store.bump(61, -1), 1);
  assert.deepEqual(await store.all(), { 61: 1 });
});

test("MemoryStore never goes below zero", async () => {
  const store = new MemoryStore();
  assert.equal(await store.bump(3, -1), 0);
  assert.equal(await store.bump(3, -1), 0);
  assert.deepEqual(await store.all(), { 3: 0 });
});

function fakeFetch(results: unknown[]) {
  const calls: { url: string; body: unknown; auth: string | undefined }[] = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    const headers = init?.headers as Record<string, string>;
    calls.push({ url: String(url), body: JSON.parse(String(init?.body)), auth: headers?.Authorization });
    const result = results.shift();
    return new Response(JSON.stringify({ result }), { status: 200 });
  }) as typeof fetch;
  return { impl, calls };
}

test("UpstashStore.all sends HGETALL and parses the flat reply", async () => {
  const { impl, calls } = fakeFetch([["61", "5", "3", "12", "9", "-2"]]);
  const store = new UpstashStore("https://example.upstash.io/", "tok", impl);
  const counts = await store.all();
  assert.deepEqual(counts, { 61: 5, 3: 12, 9: 0 });
  assert.equal(calls[0].url, "https://example.upstash.io");
  assert.deepEqual(calls[0].body, ["HGETALL", "likes"]);
  assert.equal(calls[0].auth, "Bearer tok");
});

test("UpstashStore.bump sends HINCRBY and returns the new count", async () => {
  const { impl, calls } = fakeFetch([7]);
  const store = new UpstashStore("https://example.upstash.io", "tok", impl);
  assert.equal(await store.bump(61, 1), 7);
  assert.deepEqual(calls[0].body, ["HINCRBY", "likes", "61", "1"]);
});

test("UpstashStore.bump clamps a negative result back to zero", async () => {
  const { impl, calls } = fakeFetch([-1, 0]);
  const store = new UpstashStore("https://example.upstash.io", "tok", impl);
  assert.equal(await store.bump(61, -1), 0);
  assert.deepEqual(calls[1].body, ["HSET", "likes", "61", "0"]);
});

test("UpstashStore throws on a non-2xx reply", async () => {
  const impl = (async () => new Response("nope", { status: 500 })) as typeof fetch;
  const store = new UpstashStore("https://example.upstash.io", "tok", impl);
  await assert.rejects(() => store.all(), /Upstash 500/);
});

test("getStore picks Upstash only when both variables are set", () => {
  assert.ok(getStore({}) instanceof MemoryStore);
  assert.ok(getStore({ UPSTASH_REDIS_REST_URL: "https://x" }) instanceof MemoryStore);
  assert.ok(
    getStore({ UPSTASH_REDIS_REST_URL: "https://x", UPSTASH_REDIS_REST_TOKEN: "t" }) instanceof UpstashStore,
  );
});
```

- [ ] **Step 3: Run the tests to see them fail**

Run: `npm test`
Expected: FAIL, "Cannot find module './likes-store.ts'".

- [ ] **Step 4: Implement `lib/likes-store.ts`**

```ts
/**
 * Where like counts live. One interface, two homes: a Map for local
 * development and tests, Upstash Redis (over its REST API, no SDK) in
 * production. Only erasable TypeScript here: this file is loaded by
 * `node --test` without a compile step.
 */

export interface LikesStore {
  all(): Promise<Record<number, number>>;
  bump(id: number, delta: 1 | -1): Promise<number>;
}

export class MemoryStore implements LikesStore {
  counts: Map<number, number> = new Map();

  async all(): Promise<Record<number, number>> {
    return Object.fromEntries(this.counts);
  }

  async bump(id: number, delta: 1 | -1): Promise<number> {
    const next = Math.max(0, (this.counts.get(id) ?? 0) + delta);
    this.counts.set(id, next);
    return next;
  }
}

const HASH = "likes";

export class UpstashStore implements LikesStore {
  url: string;
  token: string;
  fetchImpl: typeof fetch;

  constructor(url: string, token: string, fetchImpl: typeof fetch = fetch) {
    this.url = url.replace(/\/+$/, "");
    this.token = token;
    this.fetchImpl = fetchImpl;
  }

  /** One Redis command as Upstash's REST API expects it: a JSON array. */
  async command<T>(...parts: (string | number)[]): Promise<T> {
    const res = await this.fetchImpl(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(parts.map(String)),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash ${res.status}`);
    const data = (await res.json()) as { result?: T; error?: string };
    if (data.error) throw new Error(data.error);
    return data.result as T;
  }

  async all(): Promise<Record<number, number>> {
    const flat = await this.command<string[]>("HGETALL", HASH);
    const counts: Record<number, number> = {};
    for (let i = 0; i + 1 < flat.length; i += 2) {
      const id = Number(flat[i]);
      const n = Number(flat[i + 1]);
      if (Number.isInteger(id) && Number.isFinite(n)) counts[id] = Math.max(0, n);
    }
    return counts;
  }

  async bump(id: number, delta: 1 | -1): Promise<number> {
    const next = await this.command<number>("HINCRBY", HASH, id, delta);
    if (next < 0) {
      await this.command("HSET", HASH, id, 0);
      return 0;
    }
    return next;
  }
}

let store: LikesStore | null = null;

/** The store for this process, chosen once from the environment. */
export function getStore(
  env: Record<string, string | undefined> = process.env,
): LikesStore {
  if (env !== process.env) return make(env);
  if (!store) store = make(env);
  return store;
}

function make(env: Record<string, string | undefined>): LikesStore {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new UpstashStore(url, token) : new MemoryStore();
}
```

- [ ] **Step 5: Run the tests to see them pass**

Run: `npm test`
Expected: 7 passing, 0 failing. Also run `npx tsc --noEmit`; expected clean.

- [ ] **Step 6: Commit**

```bash
git add lib/likes-store.ts lib/likes-store.test.ts package.json tsconfig.json
git commit -m "Add likes store with memory and Upstash backends

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Likes route handler

**Files:**
- Create: `lib/likes-api.ts`
- Create: `lib/likes-api.test.ts`
- Create: `app/api/likes/route.ts`
- Create: `.env.example`

**Interfaces:**
- Consumes: `getStore()` from Task 2; `artworks` from `lib/collection.ts`.
- Produces: `parseToggle(body: unknown, known: (id: number) => boolean): { id: number; delta: 1 | -1 } | null`; HTTP `GET /api/likes` → `{ counts }`, `POST /api/likes` → `{ id, count }`.

- [ ] **Step 1: Write the failing validation tests**

Create `lib/likes-api.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseToggle } from "./likes-api.ts";

const known = (id: number) => id >= 1 && id <= 108;

test("accepts a known id with delta 1 or -1", () => {
  assert.deepEqual(parseToggle({ id: 61, delta: 1 }, known), { id: 61, delta: 1 });
  assert.deepEqual(parseToggle({ id: 1, delta: -1 }, known), { id: 1, delta: -1 });
});

test("rejects anything else", () => {
  assert.equal(parseToggle(null, known), null);
  assert.equal(parseToggle("61", known), null);
  assert.equal(parseToggle({ id: "61", delta: 1 }, known), null);
  assert.equal(parseToggle({ id: 61.5, delta: 1 }, known), null);
  assert.equal(parseToggle({ id: 999, delta: 1 }, known), null);
  assert.equal(parseToggle({ id: 61, delta: 2 }, known), null);
  assert.equal(parseToggle({ id: 61 }, known), null);
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npm test`
Expected: FAIL, "Cannot find module './likes-api.ts'".

- [ ] **Step 3: Implement `lib/likes-api.ts`**

```ts
/** Validates a like toggle. Only erasable TypeScript: loaded by node --test. */
export function parseToggle(
  body: unknown,
  known: (id: number) => boolean,
): { id: number; delta: 1 | -1 } | null {
  if (!body || typeof body !== "object") return null;
  const { id, delta } = body as Record<string, unknown>;
  if (typeof id !== "number" || !Number.isInteger(id) || !known(id)) return null;
  if (delta !== 1 && delta !== -1) return null;
  return { id, delta };
}
```

- [ ] **Step 4: Run to see it pass**

Run: `npm test`
Expected: 9 passing.

- [ ] **Step 5: Write the route handler**

Create `app/api/likes/route.ts`:

```ts
import { artworks } from "@/lib/collection";
import { parseToggle } from "@/lib/likes-api";
import { getStore } from "@/lib/likes-store";

const ids = new Set(artworks.map((artwork) => artwork.id));
const NO_STORE = { "cache-control": "no-store" };

export async function GET() {
  try {
    const counts = await getStore().all();
    return Response.json({ counts }, { headers: NO_STORE });
  } catch {
    return Response.json({ counts: {} }, { status: 503, headers: NO_STORE });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 });
  }
  const toggle = parseToggle(body, (id) => ids.has(id));
  if (!toggle) {
    return Response.json({ error: "Expected { id: <work id>, delta: 1 | -1 }" }, { status: 400 });
  }
  try {
    const count = await getStore().bump(toggle.id, toggle.delta);
    return Response.json({ id: toggle.id, count }, { headers: NO_STORE });
  } catch {
    return Response.json({ error: "Likes store unavailable" }, { status: 503 });
  }
}
```

- [ ] **Step 6: Add `.env.example`**

```bash
# Likes are stored in Upstash Redis. Add "Upstash Redis" to the Vercel project
# from the Marketplace and these are injected automatically. Leave them unset
# locally to use the in-memory store (counts reset when the dev server restarts).
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

- [ ] **Step 7: Exercise the route against the dev server**

Start the dev server (through the Browser pane's `preview_start` with name `ganapati`, or `npm run dev` if working from a plain terminal), then:

```bash
curl -s http://localhost:3000/api/likes
curl -s -X POST http://localhost:3000/api/likes -H 'content-type: application/json' -d '{"id":61,"delta":1}'
curl -s -X POST http://localhost:3000/api/likes -H 'content-type: application/json' -d '{"id":999,"delta":1}' -o /dev/null -w '%{http_code}\n'
curl -s http://localhost:3000/api/likes
```

Expected, in order: `{"counts":{}}`, `{"id":61,"count":1}`, `400`, `{"counts":{"61":1}}`.

- [ ] **Step 8: Commit**

```bash
git add lib/likes-api.ts lib/likes-api.test.ts app/api/likes/route.ts .env.example
git commit -m "Add likes API route with validation

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Client likes context and the heart

**Files:**
- Create: `lib/likes.tsx`
- Create: `components/sketchbook/LikeButton.tsx`

**Interfaces:**
- Consumes: `GET/POST /api/likes` from Task 3; `.sk-heart` CSS from Task 1; `formatNumber` from `components/Plate.tsx`.
- Produces:
  ```ts
  export function LikesProvider({ children }: { children: ReactNode }): JSX.Element;
  export function useLikes(): { counts: Record<number, number>; liked: Set<number>; toggle: (id: number) => void; ready: boolean };
  export function LikeButton({ id, className }: { id: number; className?: string }): JSX.Element;
  ```

- [ ] **Step 1: Write `lib/likes.tsx`**

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "ganapati:liked";

type Counts = Record<number, number>;

type LikesContextValue = {
  counts: Counts;
  liked: Set<number>;
  toggle: (id: number) => void;
  /** False until the first fetch has settled, so counts can be hidden briefly. */
  ready: boolean;
};

const LikesContext = createContext<LikesContextValue | null>(null);

function readLiked(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === "number") : []);
  } catch {
    return new Set();
  }
}

function writeLiked(liked: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...liked]));
  } catch {
    /* private mode or full storage: the like still counts, it just won't be remembered */
  }
}

/** One fetch of the counts for the whole page; every heart reads from here. */
export function LikesProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<Counts>({});
  const [liked, setLiked] = useState<Set<number>>(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLiked(readLiked());
    let cancelled = false;
    fetch("/api/likes", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { counts: {} }))
      .then((data: { counts?: Counts }) => {
        if (cancelled) return;
        setCounts(data.counts ?? {});
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback((id: number) => {
    let delta: 1 | -1 = 1;
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        delta = -1;
      } else {
        next.add(id);
        delta = 1;
      }
      writeLiked(next);
      return next;
    });
    setCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }));

    fetch("/api/likes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, delta }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<{ id: number; count: number }>;
      })
      .then((data) => setCounts((prev) => ({ ...prev, [id]: data.count })))
      .catch(() => {
        // Revert the optimistic change.
        setLiked((prev) => {
          const next = new Set(prev);
          if (delta === 1) next.delete(id);
          else next.add(id);
          writeLiked(next);
          return next;
        });
        setCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) - delta) }));
      });
  }, []);

  const value = useMemo(() => ({ counts, liked, toggle, ready }), [counts, liked, toggle, ready]);
  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}

export function useLikes(): LikesContextValue {
  const ctx = useContext(LikesContext);
  if (!ctx) throw new Error("useLikes must be used inside <LikesProvider>");
  return ctx;
}
```

Note on `delta`: `setLiked`'s updater runs synchronously in React 19 for a
click handler, so `delta` is set before the `setCounts` and `fetch` lines
read it. If a reviewer is unsure, the simpler equivalent is to compute
`delta` from a `likedRef` mirror; either is acceptable.

- [ ] **Step 2: Write `components/sketchbook/LikeButton.tsx`**

```tsx
"use client";

import { useState } from "react";
import { formatNumber } from "@/components/Plate";
import { HeartDoodle } from "@/components/sketchbook/doodles";
import { useLikes } from "@/lib/likes";

/** A hand-drawn heart and its count. Its own button, never inside the work's. */
export function LikeButton({ id, className = "" }: { id: number; className?: string }) {
  const { counts, liked, toggle, ready } = useLikes();
  const on = liked.has(id);
  const count = counts[id] ?? 0;
  const [thump, setThump] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${on ? "Unlike" : "Like"} No. ${formatNumber(id)}`}
      className={`sk-heart ${on ? "is-on" : ""} ${thump ? "is-thump" : ""} ${className}`}
      onClick={(event) => {
        event.stopPropagation();
        if (!on) setThump(true);
        toggle(id);
      }}
      onAnimationEnd={() => setThump(false)}
    >
      <HeartDoodle />
      <span aria-live="polite" style={{ minWidth: "1.2em" }}>
        {ready || count > 0 ? count : ""}
      </span>
    </button>
  );
}
```

`HeartDoodle` is created in Task 7. Until then this file will not type-check;
to keep this task independently checkable, create `components/sketchbook/doodles.tsx`
now with just the heart, and Task 7 adds the rest:

```tsx
/** Small hand-drawn marks used across the sketchbook. */

export function HeartDoodle() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20.3c-.4-.3-7.2-4.9-7.2-10.1a4.1 4.1 0 0 1 7.2-2.6 4.1 4.1 0 0 1 7.2 2.6c0 5.2-6.8 9.8-7.2 10.1z" />
    </svg>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add lib/likes.tsx components/sketchbook/LikeButton.tsx components/sketchbook/doodles.tsx
git commit -m "Add likes context and the sketchbook heart button

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Shared parallax hook

**Files:**
- Create: `lib/useParallax.ts`

**Interfaces:**
- Consumes: `.sk-px` from Task 1 (reads `--py`).
- Produces: `useParallax<T extends HTMLElement>(speed: number): RefObject<T | null>`.

- [ ] **Step 1: Write `lib/useParallax.ts`**

```ts
"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll parallax without a library. Every element registers with one
 * shared loop; on scroll we set `--py` from the element's distance to the
 * viewport centre times its speed. Pair with the `.sk-px` class, which
 * composes `--py` with the element's static rotation.
 *
 * Off on phones and under reduced motion: the media query decides.
 */

type Entry = { el: HTMLElement; speed: number; last: number };

const QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const entries = new Set<Entry>();
let raf = 0;
let bound = false;
let enabled = false;

function tick() {
  raf = 0;
  const mid = window.innerHeight / 2;
  for (const entry of entries) {
    if (!enabled) {
      if (entry.last !== 0) {
        entry.last = 0;
        entry.el.style.setProperty("--py", "0px");
      }
      continue;
    }
    const rect = entry.el.getBoundingClientRect();
    // The rect already includes the last translate; take it back out so the
    // measurement is of the element at rest, not a feedback loop.
    const centre = rect.top + rect.height / 2 - mid - entry.last;
    const py = Math.round(-centre * entry.speed * 10) / 10;
    if (py !== entry.last) {
      entry.last = py;
      entry.el.style.setProperty("--py", `${py}px`);
    }
  }
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(tick);
}

function bind() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  const media = window.matchMedia(QUERY);
  enabled = media.matches;
  media.addEventListener("change", (event) => {
    enabled = event.matches;
    schedule();
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}

export function useParallax<T extends HTMLElement>(speed: number) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    bind();
    const entry: Entry = { el, speed, last: 0 };
    entries.add(entry);
    schedule();
    return () => {
      entries.delete(entry);
      el.style.removeProperty("--py");
    };
  }, [speed]);

  return ref;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/useParallax.ts
git commit -m "Add shared scroll parallax hook

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Copy: chapter taglines and margin notes

**Files:**
- Create: `data/notes.ts`

**Interfaces:**
- Consumes: `Posture` from `lib/types.ts`; `inWords` from `lib/words.ts`.
- Produces:
  ```ts
  export type NoteSide = "left" | "right";
  export type ArrowKind = "swoop" | "hook" | "curl";
  export type MarginNote = { id: number; text: string; side: NoteSide; arrow: ArrowKind };
  export const notes: MarginNote[];
  export function noteFor(id: number): MarginNote | undefined;
  export function tagline(posture: Posture, count: number): string;
  export const intro: { heading: string; body: string; signoff: string };
  export const desk: { noteLeft: string; noteRight: string; scrollHint: string; studyLeft: number; studyRight: number };
  export const door: { heading: string; body: string; photoCaption: string; storyLink: string; aboutLink: string };
  export const signoff: { left: string; right: string };
  ```

- [ ] **Step 1: Write `data/notes.ts`**

```ts
import type { Posture } from "@/lib/types";
import { inWords } from "@/lib/words";

/**
 * Everything handwritten on the homepage, in one place, so the copy can be
 * changed without opening a component. Lower-case and conversational: it is
 * the artist talking in the margin, not a label.
 */

export type NoteSide = "left" | "right";
export type ArrowKind = "swoop" | "hook" | "curl";

export type MarginNote = {
  /** The work this note sits under. Unknown ids are ignored. */
  id: number;
  text: string;
  side: NoteSide;
  arrow: ArrowKind;
};

export const desk = {
  studyLeft: 38,
  studyRight: 56,
  noteLeft: "← this one dances",
  noteRight: "six arms,\nzero chill →",
  scrollHint: "scroll down, I drew all 108 of him ↓",
};

export const intro = {
  heading: "A note before you go in",
  body:
    "One figure, drawn one hundred and eight times. I kept the same rules every time: an elephant's head, a round belly, a broken tusk, and something sweet within reach. Everything else was allowed to change. What came out is sorted into six parts, mostly by what he's doing with his legs.",
  signoff: "— sorted by posture, then by whatever felt right",
};

export function tagline(posture: Posture, count: number): string {
  const n = inWords(count);
  switch (posture) {
    case "Sitting":
      return `${n} ways of sitting down`;
    case "Standing":
      return `${n} of them, all upright, all on time`;
    case "Dancing":
      return `${n} of them, none sitting still`;
    case "Ceremonial":
      return `${n} evenings of lamps and garlands`;
    case "Meditative":
      return `${n} times I tried to draw quiet`;
    case "Overflow":
      return `${n} that didn't follow the brief. kept them anyway.`;
  }
}

export const notes: MarginNote[] = [
  // I · The Seated Forms
  { id: 3, text: "the first throne. I got carried away with the gold.", side: "right", arrow: "swoop" },
  { id: 6, text: "ukadiche modak. steamed, the proper kind.", side: "left", arrow: "hook" },
  { id: 12, text: "the mouse is guarding the kalash. or drinking from it.", side: "right", arrow: "curl" },
  { id: 29, text: "the ears took longer than the rest of him", side: "left", arrow: "swoop" },
  { id: 100, text: "drew the grain first, then found him inside it", side: "right", arrow: "hook" },
  { id: 108, text: "no. 108. the last one. I put everything in.", side: "left", arrow: "curl" },
  // II · The Standing Forms
  { id: 40, text: "bronze gone green, the way old temple bells do", side: "right", arrow: "swoop" },
  { id: 44, text: "one diya. that's all the light he needed.", side: "left", arrow: "hook" },
  { id: 50, text: "two inks only. ultramarine, and the paper.", side: "right", arrow: "curl" },
  { id: 54, text: "the mouse is carrying the incense. of course he is.", side: "left", arrow: "swoop" },
  { id: 99, text: "the lotus stem is longer than he is tall", side: "right", arrow: "hook" },
  // III · Movement
  { id: 38, text: "my favourite of the lot, honestly", side: "right", arrow: "swoop" },
  { id: 61, text: "the lamp is the only light source, so everything else went dark", side: "left", arrow: "hook" },
  { id: 63, text: "one arm goes off the page. I let it.", side: "right", arrow: "curl" },
  { id: 64, text: "has a mouse. look closely.", side: "left", arrow: "swoop" },
  { id: 97, text: "drawn on a linen scrap, then traced", side: "right", arrow: "hook" },
  // IV · Ceremony
  { id: 20, text: "this is what the room looks like at nine on the first night", side: "left", arrow: "curl" },
  { id: 32, text: "the marigold garland is heavier than it looks", side: "right", arrow: "swoop" },
  { id: 58, text: "the pandal, the lights, everyone. had to draw all of it.", side: "left", arrow: "hook" },
  { id: 80, text: "everything on the plate at once. modak, diya, mala, marigold.", side: "right", arrow: "curl" },
  // V · Stillness
  { id: 4, text: "the quietest one. paper and rust, nothing else.", side: "left", arrow: "swoop" },
  { id: 26, text: "tried to draw stillness with only straight lines", side: "right", arrow: "hook" },
  { id: 89, text: "eyes closed. first time I drew him not looking back.", side: "left", arrow: "curl" },
  { id: 94, text: "the mouse is also meditating. or asleep.", side: "right", arrow: "swoop" },
  // VI · Beyond the Brief
  { id: 19, text: "how few circles can he be? this many.", side: "left", arrow: "hook" },
  { id: 33, text: "what if he were a building", side: "right", arrow: "curl" },
  { id: 88, text: "pen never left the paper", side: "left", arrow: "swoop" },
  { id: 95, text: "one stroke. took forty tries.", side: "right", arrow: "hook" },
];

const byId = new Map(notes.map((note) => [note.id, note]));

export function noteFor(id: number): MarginNote | undefined {
  return byId.get(id);
}

export const door = {
  heading: "Why 108?\nWhy him?",
  body:
    "The festival, the clay, the ten days, the goodbye at the sea. The drawings make more sense once you've read this bit.",
  photoCaption: "Lalbaugcha Raja, a photograph, not a drawing",
  storyLink: "read the story →",
  aboutLink: "or, how this was catalogued → about",
};

export const signoff = {
  left: "drawn one hundred and eight times, hung once",
  right: "Ganapati Bappa Morya ✦",
};
```

- [ ] **Step 2: Type-check and sanity-check the ids**

Run: `npx tsc --noEmit`
Expected: clean.

Run:

```bash
node -e '
const cat = require("fs").readFileSync("data/catalogue.ts","utf8");
const ids = new Set([...cat.matchAll(/id: (\d+)/g)].map(m => +m[1]));
const notes = require("fs").readFileSync("data/notes.ts","utf8");
const used = [...notes.matchAll(/\{ id: (\d+)/g)].map(m => +m[1]);
console.log("unknown:", used.filter(i => !ids.has(i)), "total notes:", used.length);
'
```

Expected: `unknown: [] total notes: 28`.

- [ ] **Step 3: Commit**

```bash
git add data/notes.ts
git commit -m "Add sketchbook copy: taglines and margin notes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Doodles, MarginNote and PinnedWork

**Files:**
- Modify: `components/sketchbook/doodles.tsx` (from Task 4)
- Create: `components/sketchbook/MarginNote.tsx`
- Create: `components/sketchbook/PinnedWork.tsx`
- Modify: `app/globals.css` (append)

**Interfaces:**
- Consumes: `useArrival` from `lib/useArrival.ts`; `formatNumber`, `describe` from `components/Plate.tsx`; `LikeButton` (Task 4); `MarginNote` type, `noteFor` (Task 6); CSS primitives (Task 1).
- Produces:
  ```ts
  export function Arrow({ kind, className, style }: { kind: ArrowKind; className?: string; style?: CSSProperties }): JSX.Element;
  export function CloseDoodle(): JSX.Element;
  export function StarDoodle({ className, style }: { className?: string; style?: CSSProperties }): JSX.Element;
  export function MarginNoteBlock({ note }: { note: MarginNote }): JSX.Element;
  export function PinnedWork({ artwork, index, onOpen, eager, frame, rotate, width, withMeta, note }: PinnedWorkProps): JSX.Element;
  export const FRAME_CYCLE: ("a" | "b")[]; export const ROTATE_CYCLE: number[]; export const WIDTH_CYCLE: string[];
  ```

- [ ] **Step 1: Complete `components/sketchbook/doodles.tsx`**

Replace the file with:

```tsx
import type { CSSProperties } from "react";
import type { ArrowKind } from "@/data/notes";

/** Small hand-drawn marks used across the sketchbook. All ink-coloured via CSS. */

export function HeartDoodle() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20.3c-.4-.3-7.2-4.9-7.2-10.1a4.1 4.1 0 0 1 7.2-2.6 4.1 4.1 0 0 1 7.2 2.6c0 5.2-6.8 9.8-7.2 10.1z" />
    </svg>
  );
}

const ARROWS: Record<ArrowKind, { viewBox: string; paths: string[] }> = {
  // a long sweep that rises to the right
  swoop: { viewBox: "0 0 120 50", paths: ["M4 44 C 30 10, 70 4, 112 22", "M98 12 L112 22 L98 32"] },
  // a short hook that turns up
  hook: { viewBox: "0 0 60 70", paths: ["M52 66 C 30 60, 16 40, 12 8", "M4 20 L12 6 L24 16"] },
  // a loop that doubles back before pointing up
  curl: { viewBox: "0 0 80 70", paths: ["M6 64 C 40 70, 70 50, 50 30 C 36 18, 20 30, 34 40 C 48 48, 62 30, 56 8", "M46 18 L56 6 L66 18"] },
};

export function Arrow({ kind, className = "", style }: { kind: ArrowKind; className?: string; style?: CSSProperties }) {
  const arrow = ARROWS[kind];
  return (
    <svg viewBox={arrow.viewBox} className={`sk-arrow ${className}`} style={style} aria-hidden="true">
      {arrow.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/** Two quick strokes, the way you'd cross something out. */
export function CloseDoodle() {
  return (
    <svg viewBox="0 0 32 32" className="sk-arrow" aria-hidden="true">
      <path d="M6 7 C 12 12, 20 20, 26 25" />
      <path d="M25 6 C 20 12, 12 20, 7 26" />
    </svg>
  );
}

export function StarDoodle({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 32 32" className={`sk-arrow ${className}`} style={style} aria-hidden="true">
      <path d="M16 3 C 17 11, 21 15, 29 16 C 21 17, 17 21, 16 29 C 15 21, 11 17, 3 16 C 11 15, 15 11, 16 3 Z" />
    </svg>
  );
}
```

- [ ] **Step 2: Append the note, arrow and work CSS to `app/globals.css`**

```css
/* --- doodles, notes, pinned works ---------------------------------------- */

.sk-arrow {
  display: block;
  fill: none;
  stroke: var(--color-ochre);
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* a margin note: arrow first, pointing up at the frame, then the words */
.sk-note {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  max-width: 17rem;
  margin-top: var(--space-3);
  color: var(--color-ochre);
}

.sk-note--right { margin-inline-start: auto; flex-direction: row-reverse; text-align: right; }
.sk-note .sk-arrow { width: 44px; flex: none; }
.sk-note--right .sk-arrow { transform: scaleX(-1); }
.sk-note--left { transform: rotate(-2deg); }
.sk-note--right { transform: rotate(2deg); }

/* one pinned work: frame, caption row, optional note */
.sk-work {
  width: var(--w, 100%);
  margin-inline-start: var(--ms, 0);
  margin-inline-end: var(--me, 0);
}

.sk-work-frame {
  display: block;
  width: 100%;
  cursor: pointer;
  text-align: left;
}

.sk-work-caption {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-3);
  padding-inline: 2px;
}

.sk-work-title {
  display: block;
  min-width: 0;
  cursor: pointer;
  text-align: left;
}

.sk-work-num {
  font-family: var(--font-hand);
  font-weight: 700;
  color: var(--color-terracotta);
  font-size: var(--text-hand-small);
  letter-spacing: 0.04em;
  margin-inline-end: 0.35em;
}

.sk-work-meta {
  display: block;
  color: var(--color-ink-faint);
  margin-top: 3px;
}
```

- [ ] **Step 3: Write `components/sketchbook/MarginNote.tsx`**

```tsx
import type { MarginNote } from "@/data/notes";
import { Arrow } from "@/components/sketchbook/doodles";

/** The artist's aside, tucked under a work, pointing back up at it. */
export function MarginNoteBlock({ note }: { note: MarginNote }) {
  return (
    <p className={`sk-note sk-note--${note.side} sk-hand-note`}>
      <Arrow kind={note.arrow} />
      <span style={{ whiteSpace: "pre-line" }}>{note.text}</span>
    </p>
  );
}
```

- [ ] **Step 4: Write `components/sketchbook/PinnedWork.tsx`**

```tsx
"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { describe, formatNumber } from "@/components/Plate";
import { LikeButton } from "@/components/sketchbook/LikeButton";
import { MarginNoteBlock } from "@/components/sketchbook/MarginNote";
import type { MarginNote } from "@/data/notes";
import { useArrival } from "@/lib/useArrival";
import type { Artwork } from "@/lib/types";

/** Cycles that keep the wall from ever falling into a grid. */
export const FRAME_CYCLE: ("a" | "b")[] = ["a", "b", "a", "a", "b", "b", "a", "b"];
export const ROTATE_CYCLE = [-2, 2.5, -1, 3, -3, 1.5, 4, -1.5];
export const WIDTH_CYCLE = ["100%", "78%", "88%", "92%", "70%", "96%", "84%"];

export type PinnedWorkProps = {
  artwork: Artwork;
  /** Position within its column or run; drives the cycles and the stagger. */
  index: number;
  onOpen: () => void;
  eager?: boolean;
  /** Override the cycles when a caller wants a specific look (the hero does). */
  frame?: "a" | "b";
  rotate?: number;
  width?: string;
  /** Show the material · trunk line under the title. */
  withMeta?: boolean;
  note?: MarginNote;
  sizes?: string;
};

export function PinnedWork({
  artwork,
  index,
  onOpen,
  eager = false,
  frame = FRAME_CYCLE[index % FRAME_CYCLE.length],
  rotate = ROTATE_CYCLE[index % ROTATE_CYCLE.length],
  width = WIDTH_CYCLE[index % WIDTH_CYCLE.length],
  withMeta = index % 3 === 0,
  note,
  sizes = "(min-width: 768px) 30vw, 92vw",
}: PinnedWorkProps) {
  const ref = useArrival<HTMLElement>();
  const hangRight = index % 2 === 1;

  const style = {
    "--rot": `${rotate}deg`,
    "--w": width,
    "--ms": hangRight ? "auto" : "0",
    "--me": hangRight ? "0" : "auto",
    "--reveal-delay": `${(index % 3) * 110}ms`,
  } as CSSProperties;

  const label = `Open No. ${formatNumber(artwork.id)}, ${artwork.title}`;

  return (
    <figure ref={ref} className="sk-work sk-swing" style={style}>
      <button type="button" onClick={onOpen} className="sk-work-frame" aria-label={label}>
        <div className={`sk-frame ${frame === "b" ? "sk-frame--b" : ""}`}>
          <span className="sk-tape" />
          {index % 3 !== 1 && <span className="sk-tape sk-tape--r" />}
          <Image
            src={artwork.src}
            alt={`${artwork.title}. ${describe(artwork)}`}
            width={artwork.width}
            height={artwork.height}
            placeholder="blur"
            blurDataURL={artwork.blurDataURL}
            sizes={sizes}
            priority={eager}
            loading={eager ? undefined : "lazy"}
          />
        </div>
      </button>

      <figcaption className="sk-work-caption sk-write">
        <button type="button" onClick={onOpen} className="sk-work-title sk-hand-caption" aria-label={label}>
          <span className="sk-work-num">No. {formatNumber(artwork.id)}</span>
          <span className="text-ink">{artwork.title}</span>
          {withMeta && (
            <span className="sk-work-meta sk-hand-small">
              {artwork.material.toLowerCase()} · {artwork.trunk.toLowerCase()} trunk
            </span>
          )}
        </button>
        <LikeButton id={artwork.id} />
      </figcaption>

      {note && <MarginNoteBlock note={note} />}
    </figure>
  );
}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add components/sketchbook/doodles.tsx components/sketchbook/MarginNote.tsx components/sketchbook/PinnedWork.tsx app/globals.css
git commit -m "Add pinned work, margin note and doodles

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Nav, hero and the page itself

After this task `/` renders the sketchbook with the nav and hero; chapters come in Task 9.

**Files:**
- Create: `components/sketchbook/HandNav.tsx`
- Create: `components/sketchbook/Desk.tsx`
- Create: `components/sketchbook/Sketchbook.tsx`
- Modify: `app/page.tsx` (replace entirely)
- Modify: `app/globals.css` (append)

**Interfaces:**
- Consumes: `PinnedWork` (Task 7), `useParallax` (Task 5), `LikesProvider` (Task 4), `desk` copy (Task 6), `inWordsCapitalised` (`lib/words.ts`), `chapters`, `hangingOrder`, `artworkById`, `LEAD_ID`, `total` (`lib/collection.ts`).
- Produces:
  ```ts
  export function Sketchbook({ chapters, order, lead }: { chapters: Chapter[]; order: Artwork[]; lead: Artwork }): JSX.Element;
  export function Desk({ lead, studies, total, onOpen }: { lead: Artwork; studies: [Artwork, Artwork]; total: number; onOpen: (artwork: Artwork) => void }): JSX.Element;
  export function HandNav(): JSX.Element;
  ```
  `Sketchbook` keeps `openAt: number | null` state and passes `openWork(artwork)` down; Task 10 wires `SketchViewer` to it.

- [ ] **Step 1: Append the nav and desk CSS to `app/globals.css`**

```css
/* --- nav and the desk ----------------------------------------------------- */

.sk-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2) var(--space-5);
  padding-block: var(--space-4) 0;
}

.sk-nav-brand {
  font-family: var(--font-hand);
  font-weight: 700;
  font-size: var(--text-hand-subhead);
  border-bottom: 2px solid var(--color-terracotta);
  line-height: 1;
}

.sk-nav-links {
  display: flex;
  gap: var(--space-4);
  font-family: var(--font-hand);
  font-weight: 500;
  font-size: var(--text-hand-note);
  color: var(--color-ink-soft);
}

.sk-nav-links a { transition: color 300ms var(--ease-gallery); }
.sk-nav-links a:hover { color: var(--color-teal); }

/* the desk: stacked on a phone, layered from tablet up */
.sk-desk {
  position: relative;
  padding-top: var(--space-6);
}

.sk-desk-title {
  text-align: center;
  transform: rotate(-2deg);
  color: var(--color-ink);
  text-wrap: balance;
}

.sk-desk-title .and { display: block; font-weight: 500; font-size: 0.55em; }
.sk-desk-title .who { color: var(--color-terracotta); }

.sk-desk-stage {
  position: relative;
  margin-top: var(--space-5);
}

.sk-desk-lead { width: min(100%, 320px); margin-inline: auto; }
.sk-desk-study { position: absolute; width: 30%; max-width: 150px; top: 8%; }
.sk-desk-study--left { left: -6%; }
.sk-desk-study--right { right: -5%; top: 46%; }

.sk-desk-notes {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-4);
  color: var(--color-ochre);
  white-space: pre-line;
}

.sk-desk-hint {
  text-align: center;
  color: var(--color-ink-soft);
  margin-top: var(--space-6);
}

@media (min-width: 768px) {
  .sk-desk { min-height: clamp(560px, 82vh, 780px); padding-top: var(--space-7); }
  .sk-desk-stage { margin-top: calc(var(--space-6) * -1); }
  .sk-desk-lead { width: min(38vw, 360px); }
  .sk-desk-study { width: 20%; max-width: 190px; top: 22%; }
  .sk-desk-study--left { left: 6%; }
  .sk-desk-study--right { right: 5%; top: 16%; }
  .sk-desk-notes { position: absolute; left: 0; right: 0; bottom: 14%; padding-inline: 4%; margin: 0; pointer-events: none; }
  .sk-desk-hint { position: absolute; left: 0; right: 0; bottom: var(--space-4); margin: 0; }
  .sk-desk-star { position: absolute; right: 14%; top: 10%; width: 34px; transform: rotate(14deg); }
}

@media (min-width: 1180px) {
  .sk-desk-lead { width: min(30vw, 380px); }
  .sk-desk-study--left { left: 12%; }
  .sk-desk-study--right { right: 11%; }
}
```

- [ ] **Step 2: Write `components/sketchbook/HandNav.tsx`**

```tsx
import Link from "next/link";

const LINKS = [
  { href: "/gallery", label: "the collection" },
  { href: "/ganesh-chaturthi", label: "the story" },
  { href: "/about", label: "about" },
];

/** The nav, written by hand at the top of the page. Not sticky. */
export function HandNav() {
  return (
    <nav className="sk-nav" aria-label="Site">
      <Link href="/" className="sk-nav-brand">
        Ganapati
      </Link>
      <div className="sk-nav-links">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Write `components/sketchbook/Desk.tsx`**

```tsx
"use client";

import { PinnedWork } from "@/components/sketchbook/PinnedWork";
import { StarDoodle } from "@/components/sketchbook/doodles";
import { desk } from "@/data/notes";
import { useParallax } from "@/lib/useParallax";
import type { Artwork } from "@/lib/types";
import { inWordsCapitalised } from "@/lib/words";

/**
 * The opening: the title behind, the lead work taped in front, two studies
 * at the edges. Three parallax speeds, read from the motion tokens.
 */
export function Desk({
  lead,
  studies,
  total,
  onOpen,
}: {
  lead: Artwork;
  studies: [Artwork, Artwork];
  total: number;
  onOpen: (artwork: Artwork) => void;
}) {
  const titleRef = useParallax<HTMLHeadingElement>(-0.08);
  const leadRef = useParallax<HTMLDivElement>(0.05);
  const leftRef = useParallax<HTMLDivElement>(0.16);
  const rightRef = useParallax<HTMLDivElement>(0.12);

  // "One hundred and eight" → "One hundred" / "and eight"
  const words = inWordsCapitalised(total);
  const cut = words.indexOf(" and ");
  const first = cut === -1 ? words : words.slice(0, cut);
  const rest = cut === -1 ? "" : words.slice(cut + 1);

  return (
    <section className="sk-desk" aria-label="Introduction">
      <h1 ref={titleRef} className="sk-desk-title sk-hand-display sk-px">
        {first}
        {rest && <span className="and">{rest}</span>}
        <span className="who"> Ganeshas</span>
      </h1>

      <StarDoodle className="sk-desk-star" />

      <div className="sk-desk-stage">
        <div ref={leftRef} className="sk-desk-study sk-desk-study--left sk-px" style={{ "--rot": "-7deg" } as React.CSSProperties}>
          <PinnedWork artwork={studies[0]} index={1} frame="b" rotate={0} width="100%" withMeta={false} eager onOpen={() => onOpen(studies[0])} sizes="20vw" />
        </div>

        <div ref={leadRef} className="sk-desk-lead sk-px" style={{ "--rot": "1.5deg" } as React.CSSProperties}>
          <PinnedWork artwork={lead} index={0} frame="a" rotate={0} width="100%" withMeta={false} eager onOpen={() => onOpen(lead)} sizes="(min-width: 768px) 38vw, 92vw" />
        </div>

        <div ref={rightRef} className="sk-desk-study sk-desk-study--right sk-px" style={{ "--rot": "6deg" } as React.CSSProperties}>
          <PinnedWork artwork={studies[1]} index={2} frame="a" rotate={0} width="100%" withMeta={false} eager onOpen={() => onOpen(studies[1])} sizes="20vw" />
        </div>
      </div>

      <div className="sk-desk-notes sk-hand-note" aria-hidden="true">
        <span style={{ transform: "rotate(-4deg)" }}>{desk.noteLeft}</span>
        <span style={{ transform: "rotate(3deg)", textAlign: "right" }}>{desk.noteRight}</span>
      </div>

      <p className="sk-desk-hint sk-hand-note">{desk.scrollHint}</p>
    </section>
  );
}
```

Note: the studies and lead are wrapped in a parallax carrier (`.sk-px` with `--rot`) and `PinnedWork` is told `rotate={0}` so the rotation lives on the carrier, not the swing. The `PinnedWork` caption still shows the number, title and heart under the lead; for the two studies the caption is fine to show too (it is what the spec's mockup did).

- [ ] **Step 4: Write `components/sketchbook/Sketchbook.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Desk } from "@/components/sketchbook/Desk";
import { HandNav } from "@/components/sketchbook/HandNav";
import { desk } from "@/data/notes";
import type { Chapter } from "@/lib/collection";
import { LikesProvider } from "@/lib/likes";
import type { Artwork } from "@/lib/types";

/** The homepage, composed. Owns which work (if any) is open full-screen. */
export function Sketchbook({
  chapters,
  order,
  lead,
}: {
  chapters: Chapter[];
  order: Artwork[];
  lead: Artwork;
}) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const total = order.length;
  const byId = (id: number) => order.find((work) => work.id === id) ?? order[0];
  const openWork = (artwork: Artwork) => setOpenAt(order.findIndex((work) => work.id === artwork.id));

  return (
    <LikesProvider>
      <div className="room-sketch">
        <div className="sk-wall">
          <HandNav />
          <Desk lead={lead} studies={[byId(desk.studyLeft), byId(desk.studyRight)]} total={total} onOpen={openWork} />
          {/* Task 9: IntroNote, ChapterPage × chapters, StoryDoor, SignOff */}
          {/* Task 10: SketchViewer when openAt !== null */}
          <p className="sk-hand-small" style={{ visibility: "hidden" }}>{chapters.length} parts, open: {openAt ?? "none"}</p>
        </div>
      </div>
    </LikesProvider>
  );
}
```

(The hidden line only keeps `chapters` and `openAt` in use so the type-check
stays clean until Tasks 9 and 10 replace it. Remove it in Task 9.)

- [ ] **Step 5: Replace `app/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Sketchbook } from "@/components/sketchbook/Sketchbook";
import { LEAD_ID, artworkById, chapters, hangingOrder, total } from "@/lib/collection";
import { inWordsCapitalised } from "@/lib/words";

export const metadata: Metadata = {
  title: "Ganapati",
  description: `${inWordsCapitalised(total)} forms of Ganesha, drawn one at a time and hung in the artist's own sketchbook.`,
};

/** The front door: the sketchbook. The full catalogue view stays at /gallery. */
export default function Home() {
  return <Sketchbook chapters={chapters} order={hangingOrder} lead={artworkById(LEAD_ID)} />;
}
```

- [ ] **Step 6: Type-check and look at it**

Run: `npx tsc --noEmit` — expected clean.

Open the dev server (Browser pane `preview_start` name `ganapati`), navigate to `/`. Expected: clay paper with grain, handwritten nav, the title "One hundred / and eight Ganeshas" with "Ganeshas" in terracotta, the lead work centred in a wobbly frame with two tapes, studies at left and right, the two notes and the scroll hint. Scroll a little: the title and studies move at different rates. Resize to 375px: everything stacks, studies peek in from the edges, nothing scrolls horizontally. Check `read_console_messages` for errors: none expected.

- [ ] **Step 7: Commit**

```bash
git add components/sketchbook/HandNav.tsx components/sketchbook/Desk.tsx components/sketchbook/Sketchbook.tsx app/page.tsx app/globals.css
git commit -m "Replace the homepage redirect with the sketchbook desk

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Intro, chapters, story door and sign-off

**Files:**
- Create: `components/sketchbook/IntroNote.tsx`
- Create: `components/sketchbook/ChapterPage.tsx`
- Create: `components/sketchbook/StoryDoor.tsx`
- Create: `components/sketchbook/SignOff.tsx`
- Modify: `components/sketchbook/Sketchbook.tsx`
- Modify: `app/globals.css` (append)

**Interfaces:**
- Consumes: `PinnedWork` (Task 7), `useParallax` (Task 5), `intro`, `tagline`, `noteFor`, `door`, `signoff` (Task 6), `Chapter` type.
- Produces:
  ```ts
  export function IntroNote({ chapters }: { chapters: Chapter[] }): JSX.Element;
  export function ChapterPage({ chapter, onOpen }: { chapter: Chapter; onOpen: (artwork: Artwork) => void }): JSX.Element;
  export function StoryDoor(): JSX.Element;
  export function SignOff(): JSX.Element;
  ```
  Chapter anchors are `id="part-i"`, `part-ii`, … (numeral lower-cased), the same ids the gallery uses.

- [ ] **Step 1: Append the section CSS to `app/globals.css`**

```css
/* --- intro, chapters, door, sign-off -------------------------------------- */

.sk-intro {
  display: grid;
  gap: var(--space-6);
  padding-top: var(--space-8);
}

@media (min-width: 768px) {
  .sk-intro { grid-template-columns: minmax(0, 1fr) 300px; gap: var(--space-8); align-items: start; padding-top: var(--space-9); }
}

.sk-intro-body { max-width: 36rem; color: var(--color-ink); }
.sk-intro-sign { color: var(--color-ink-soft); margin-top: var(--space-4); }

.sk-contents {
  border-left: var(--frame-stroke) solid var(--color-ink);
  padding-left: var(--space-4);
  transform: rotate(1deg);
  line-height: 1.35;
}

.sk-contents-label { font-size: var(--text-hand-small); font-weight: 700; color: var(--color-ink-faint); letter-spacing: 0.06em; }
.sk-contents a { display: flex; gap: 0.5em; align-items: baseline; }
.sk-contents a:hover .sk-contents-title { color: var(--color-teal); }
.sk-contents-num { color: var(--color-ink-faint); min-width: 1.6em; }
.sk-contents-count { color: var(--color-terracotta); }

.sk-chapter { padding-top: var(--space-9); scroll-margin-top: var(--space-5); }
.sk-chapter-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--space-3) var(--space-4); }
.sk-chapter-head .sk-circle { font-size: var(--text-hand-note); }
.sk-chapter-tag { color: var(--color-ink-soft); }
.sk-chapter-ids { color: var(--color-ink-faint); margin-top: var(--space-1); }

/* three drifting columns from tablet up; one ragged run on a phone */
.sk-columns {
  display: flex;
  flex-direction: column;
  gap: var(--space-7);
  margin-top: var(--space-6);
}

.sk-columns .sk-col { display: contents; }
.sk-columns .sk-work { order: var(--i, 0); }

@media (min-width: 768px) {
  .sk-columns {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0 clamp(var(--space-4), 3vw, var(--space-7));
    align-items: start;
  }
  .sk-columns .sk-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    padding-top: var(--col-offset, 0);
  }
  .sk-columns .sk-work { order: 0; }
}

.sk-door {
  display: grid;
  gap: var(--space-6);
  margin-top: var(--space-9);
  padding-top: var(--space-8);
  border-top: 2px dashed var(--color-rule-clay);
}

@media (min-width: 768px) {
  .sk-door { grid-template-columns: minmax(260px, 380px) minmax(0, 1fr); gap: var(--space-8); align-items: center; }
}

.sk-door-photo { transform: rotate(-2.5deg); }
.sk-door-caption { text-align: center; color: var(--color-ink-soft); margin-top: var(--space-3); }
.sk-door-heading { white-space: pre-line; }
.sk-door-body { max-width: 30rem; margin-top: var(--space-4); }
.sk-door-link { display: inline-block; margin-top: var(--space-5); color: var(--color-teal); border-bottom: 2px solid var(--color-teal); }
.sk-door-quiet { display: block; margin-top: var(--space-3); color: var(--color-ink-faint); }
.sk-door-quiet:hover { color: var(--color-teal); }

.sk-signoff {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-2) var(--space-5);
  margin-top: var(--space-9);
  padding-block: var(--space-4) var(--space-7);
  border-top: 1px solid var(--color-rule-clay);
  color: var(--color-ink-soft);
}
```

- [ ] **Step 2: Write `components/sketchbook/IntroNote.tsx`**

```tsx
import { intro } from "@/data/notes";
import type { Chapter } from "@/lib/collection";

/** A short note from the artist, and the contents written down the side. */
export function IntroNote({ chapters }: { chapters: Chapter[] }) {
  return (
    <section className="sk-intro" aria-label="About the collection">
      <div>
        <h2 className="sk-hand-subhead">{intro.heading}</h2>
        <p className="sk-intro-body sk-serif-lead" style={{ marginTop: "var(--space-3)" }}>
          {intro.body}
        </p>
        <p className="sk-intro-sign sk-hand-note">{intro.signoff}</p>
      </div>

      <nav className="sk-contents sk-hand-note" aria-label="Contents">
        <div className="sk-contents-label">CONTENTS</div>
        {chapters.map((chapter) => (
          <a key={chapter.posture} href={`#part-${chapter.numeral.toLowerCase()}`}>
            <span className="sk-contents-num">{chapter.numeral}</span>
            <span className="sk-contents-title">{chapter.title}</span>
            <span className="sk-contents-count">{chapter.works.length}</span>
          </a>
        ))}
      </nav>
    </section>
  );
}
```

- [ ] **Step 3: Write `components/sketchbook/ChapterPage.tsx`**

```tsx
"use client";

import type { CSSProperties } from "react";
import { formatNumber } from "@/components/Plate";
import { PinnedWork } from "@/components/sketchbook/PinnedWork";
import { noteFor, tagline } from "@/data/notes";
import type { Chapter } from "@/lib/collection";
import { useParallax } from "@/lib/useParallax";
import type { Artwork } from "@/lib/types";

const SPEEDS = [0.06, -0.04, 0.1];
const OFFSETS = ["0px", "var(--space-8)", "var(--space-5)"];

/** One column of the wall, drifting at its own speed. */
function Column({ speed, offset, children }: { speed: number; offset: string; children: React.ReactNode }) {
  const ref = useParallax<HTMLDivElement>(speed);
  return (
    <div ref={ref} className="sk-col sk-px" style={{ "--col-offset": offset } as CSSProperties}>
      {children}
    </div>
  );
}

/** A compact list of the numbers in this part, for the line under the head. */
function idRuns(works: Artwork[]) {
  const ids = works.map((work) => work.id);
  const runs: string[] = [];
  let start = ids[0];
  let prev = ids[0];
  for (const id of ids.slice(1).concat(NaN)) {
    if (id === prev + 1) {
      prev = id;
      continue;
    }
    runs.push(start === prev ? formatNumber(start) : `${formatNumber(start)} – ${formatNumber(prev)}`);
    start = prev = id;
  }
  return runs.join(", ");
}

/** A chapter of the sketchbook: its head, then every work, pinned in three drifting columns. */
export function ChapterPage({ chapter, onOpen }: { chapter: Chapter; onOpen: (artwork: Artwork) => void }) {
  const columns: Artwork[][] = [[], [], []];
  chapter.works.forEach((work, i) => columns[i % 3].push(work));

  return (
    <section id={`part-${chapter.numeral.toLowerCase()}`} className="sk-chapter" aria-labelledby={`part-${chapter.numeral.toLowerCase()}-title`}>
      <div className="sk-chapter-head">
        <span className="sk-circle">{chapter.numeral}</span>
        <h2 id={`part-${chapter.numeral.toLowerCase()}-title`} className="sk-hand-heading">
          {chapter.title}
        </h2>
        <p className="sk-chapter-tag sk-hand-note">{tagline(chapter.posture, chapter.works.length)}</p>
      </div>
      <p className="sk-chapter-ids sk-hand-small">works {idRuns(chapter.works)}</p>

      <div className="sk-columns">
        {columns.map((works, c) => (
          <Column key={c} speed={SPEEDS[c]} offset={OFFSETS[c]}>
            {works.map((work, i) => (
              <div key={work.id} style={{ "--i": chapter.works.indexOf(work), display: "contents" } as CSSProperties}>
                <PinnedWork
                  artwork={work}
                  index={i * 3 + c}
                  note={noteFor(work.id)}
                  onOpen={() => onOpen(work)}
                />
              </div>
            ))}
          </Column>
        ))}
      </div>
    </section>
  );
}
```

Note on ordering: on phones `.sk-col` is `display: contents`, so every
`.sk-work` becomes a flex item of `.sk-columns`. Because a `display: contents`
wrapper cannot carry `order`, `PinnedWork` must set `--i` on the `figure`
itself. Change the wrapper approach: instead of the extra `div`, pass the
catalogue index into `PinnedWork` through a new optional prop `order` and
have `PinnedWork` add `"--i": order` to its `style`. Update `PinnedWork` in
this task accordingly:

In `components/sketchbook/PinnedWork.tsx`, add to `PinnedWorkProps`:

```ts
  /** Catalogue position within the chapter; drives phone ordering. */
  order?: number;
```

add `order = 0` to the destructured props, and add `"--i": order,` to the
`style` object. Then in `ChapterPage` replace the wrapper `div` with:

```tsx
<PinnedWork
  key={work.id}
  artwork={work}
  index={i * 3 + c}
  order={chapter.works.indexOf(work)}
  note={noteFor(work.id)}
  onOpen={() => onOpen(work)}
/>
```

- [ ] **Step 4: Write `components/sketchbook/StoryDoor.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { door } from "@/data/notes";

/** The way out of the sketchbook and into the story. */
export function StoryDoor() {
  return (
    <section className="sk-door" aria-label="The story">
      <div>
        <div className="sk-door-photo sk-frame">
          <span className="sk-tape" />
          <span className="sk-tape sk-tape--r" />
          <Image
            src="/photographs/lalbaugcha-raja.avif"
            alt="Lalbaugcha Raja, the celebrated Ganesha idol of Lalbaug, Mumbai, during the festival"
            width={1200}
            height={800}
            sizes="(min-width: 768px) 380px, 92vw"
          />
        </div>
        <p className="sk-door-caption sk-hand-small">{door.photoCaption}</p>
      </div>
      <div>
        <h2 className="sk-door-heading sk-hand-heading">{door.heading}</h2>
        <p className="sk-door-body sk-serif-lead">{door.body}</p>
        <Link href="/ganesh-chaturthi" className="sk-door-link sk-hand-subhead">
          {door.storyLink}
        </Link>
        <Link href="/about" className="sk-door-quiet sk-hand-note">
          {door.aboutLink}
        </Link>
      </div>
    </section>
  );
}
```

Check the photograph's real size first with
`node -e 'require("sharp")("public/photographs/lalbaugcha-raja.avif").metadata().then(m=>console.log(m.width,m.height))'`
and put those numbers in `width` / `height` so the aspect ratio is honest.

- [ ] **Step 5: Write `components/sketchbook/SignOff.tsx`**

```tsx
import { signoff } from "@/data/notes";

export function SignOff() {
  return (
    <footer className="sk-signoff sk-hand-note">
      <span>{signoff.left}</span>
      <span>{signoff.right}</span>
    </footer>
  );
}
```

- [ ] **Step 6: Compose them in `Sketchbook.tsx`**

Replace the body of the `sk-wall` div (and the placeholder line) with:

```tsx
<HandNav />
<Desk lead={lead} studies={[byId(desk.studyLeft), byId(desk.studyRight)]} total={total} onOpen={openWork} />
<IntroNote chapters={chapters} />
{chapters.map((chapter) => (
  <ChapterPage key={chapter.posture} chapter={chapter} onOpen={openWork} />
))}
<StoryDoor />
<SignOff />
{/* Task 10: SketchViewer when openAt !== null */}
<p className="sk-hand-small" style={{ visibility: "hidden" }}>open: {openAt ?? "none"}</p>
```

and add the imports:

```tsx
import { ChapterPage } from "@/components/sketchbook/ChapterPage";
import { IntroNote } from "@/components/sketchbook/IntroNote";
import { SignOff } from "@/components/sketchbook/SignOff";
import { StoryDoor } from "@/components/sketchbook/StoryDoor";
```

- [ ] **Step 7: Type-check, then count the works in the browser**

Run: `npx tsc --noEmit` — expected clean.

In the Browser pane on `/`, run with `javascript_tool`:

```js
({ works: document.querySelectorAll("figure.sk-work").length, hearts: document.querySelectorAll("button.sk-heart").length, chapters: document.querySelectorAll("section.sk-chapter").length })
```

Expected: `works: 111` (108 in chapters + the 3 on the desk), `hearts: 111`, `chapters: 6`.

Then scroll through: works swing in as they arrive, captions write on, columns drift at different rates, the 28 margin notes appear under their works. Resize to 375px: one column, works alternate left and right with ragged widths, in catalogue order (check the numbers read 002, 003, 004 … down the page). Check `read_console_messages` for errors: none expected.

- [ ] **Step 8: Commit**

```bash
git add components/sketchbook/IntroNote.tsx components/sketchbook/ChapterPage.tsx components/sketchbook/StoryDoor.tsx components/sketchbook/SignOff.tsx components/sketchbook/Sketchbook.tsx components/sketchbook/PinnedWork.tsx app/globals.css
git commit -m "Hang all 108 works in the sketchbook chapters

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9b: Festival doodles behind every section

**Files:**
- Modify: `components/sketchbook/doodles.tsx` (append the seven festival marks)
- Create: `components/sketchbook/DoodleField.tsx`
- Modify: `components/sketchbook/Desk.tsx`, `IntroNote.tsx`, `ChapterPage.tsx`, `StoryDoor.tsx` (add one `<DoodleField>` each)
- Modify: `app/globals.css` (append)

**Interfaces:**
- Consumes: `useParallax` (Task 5), `.sk-px` (Task 1).
- Produces:
  ```ts
  export type DoodleKind = "lotus" | "modak" | "mouse" | "marigold" | "garland" | "diya" | "durva";
  export function FestivalDoodle({ kind }: { kind: DoodleKind }): JSX.Element;
  export function DoodleField({ seed, count }: { seed: string; count: number }): JSX.Element;
  export function doodleCount(works: number): number; // Math.min(12, Math.max(4, Math.round(works / 2.5)))
  ```

- [ ] **Step 1: Append the seven marks to `components/sketchbook/doodles.tsx`**

```tsx
export type DoodleKind = "lotus" | "modak" | "mouse" | "marigold" | "garland" | "diya" | "durva";

export const DOODLE_KINDS: DoodleKind[] = ["lotus", "modak", "mouse", "marigold", "garland", "diya", "durva"];

/** viewBox and natural width (px at desktop) for each mark; height follows the box. */
const DOODLES: Record<DoodleKind, { viewBox: string; width: number; paths: string[]; circles?: [number, number, number][] }> = {
  lotus: {
    viewBox: "0 0 100 70", width: 110,
    paths: [
      "M50 8 C 42 25, 42 45, 50 58 C 58 45, 58 25, 50 8 Z",
      "M50 58 C 35 50, 22 38, 20 22 C 32 28, 44 40, 50 58",
      "M50 58 C 65 50, 78 38, 80 22 C 68 28, 56 40, 50 58",
      "M50 60 C 30 58, 12 48, 6 34 C 20 38, 38 48, 50 60",
      "M50 60 C 70 58, 88 48, 94 34 C 80 38, 62 48, 50 60",
      "M28 64 Q 50 71 72 64",
    ],
  },
  modak: {
    viewBox: "0 0 80 80", width: 68,
    paths: [
      "M40 8 C 30 26, 18 40, 12 58 C 20 70, 60 70, 68 58 C 62 40, 50 26, 40 8 Z",
      "M40 8 C 36 30, 30 46, 24 62",
      "M40 8 C 44 30, 50 46, 56 62",
      "M40 8 C 40 30, 39 48, 40 64",
      "M6 68 Q 40 78 74 68",
    ],
  },
  mouse: {
    viewBox: "0 0 100 60", width: 92,
    paths: [
      "M22 42 C 18 26, 34 16, 52 18 C 70 20, 82 30, 80 42 C 72 50, 30 52, 22 42 Z",
      "M22 42 C 8 44, 2 34, 10 24",
      "M80 34 L 94 30 M80 37 L 95 38 M80 40 L 93 46",
    ],
    circles: [[62, 16, 7], [74, 20, 5], [70, 30, 1.4]],
  },
  marigold: {
    viewBox: "0 0 60 60", width: 52,
    paths: [
      "M48 30 A8 8 0 0 1 42.7 42.7 A8 8 0 0 1 30 48 A8 8 0 0 1 17.3 42.7 A8 8 0 0 1 12 30 A8 8 0 0 1 17.3 17.3 A8 8 0 0 1 30 12 A8 8 0 0 1 42.7 17.3 A8 8 0 0 1 48 30 Z",
    ],
    circles: [[30, 30, 10], [30, 30, 4]],
  },
  garland: {
    viewBox: "0 0 300 70", width: 250,
    paths: [
      "M0 10 Q150 70 300 10",
      "M60 35 c-4 8 4 8 0 16 M150 46 c-4 8 4 8 0 16 M240 35 c-4 8 4 8 0 16",
      "M105 43 c-3 6 3 6 0 12 M195 43 c-3 6 3 6 0 12",
    ],
    circles: [[24, 19, 6], [60, 29, 6], [105, 37, 6], [150, 40, 6], [195, 37, 6], [240, 29, 6], [276, 19, 6]],
  },
  diya: {
    viewBox: "0 0 60 50", width: 58,
    paths: [
      "M6 28 Q30 31 54 28 C 52 40, 8 40, 6 28 Z",
      "M30 8 C 24 16, 24 24, 30 27 C 36 24, 36 16, 30 8 Z",
      "M14 44 Q30 48 46 44",
    ],
  },
  durva: {
    viewBox: "0 0 60 60", width: 50,
    paths: ["M30 58 C 28 40, 30 20, 34 6", "M30 58 C 20 44, 10 34, 6 20", "M30 58 C 40 44, 50 36, 56 22"],
  },
};

export function doodleWidth(kind: DoodleKind) {
  return DOODLES[kind].width;
}

export function FestivalDoodle({ kind }: { kind: DoodleKind }) {
  const d = DOODLES[kind];
  return (
    <svg viewBox={d.viewBox} className="sk-arrow" aria-hidden="true">
      {d.paths.map((path) => (
        <path key={path} d={path} />
      ))}
      {d.circles?.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}-${r}`} cx={cx} cy={cy} r={r} />
      ))}
    </svg>
  );
}
```

- [ ] **Step 2: Append the doodle CSS to `app/globals.css`**

```css
/* --- festival doodles ------------------------------------------------------
   A scatter of small line drawings behind each section, in the note ink. */

:root { --px-doodle: -0.03; }

.sk-doodles {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.sk-doodle {
  position: absolute;
  opacity: 0.34;
  transform: rotate(var(--rot, 0deg));
}

.sk-doodle .sk-arrow { stroke-width: 1.8; }

/* sections that host a field must stack above it */
.sk-has-doodles { position: relative; }
.sk-has-doodles > :not(.sk-doodles) { position: relative; z-index: 1; }

@media (max-width: 767px) {
  .sk-doodle { transform: rotate(var(--rot, 0deg)) scale(0.7); transform-origin: top left; }
  .sk-doodle:nth-child(even) { display: none; }
}
```

- [ ] **Step 3: Write `components/sketchbook/DoodleField.tsx`**

```tsx
"use client";

import type { CSSProperties } from "react";
import { DOODLE_KINDS, FestivalDoodle, doodleWidth, type DoodleKind } from "@/components/sketchbook/doodles";
import { useParallax } from "@/lib/useParallax";

/** Deterministic small PRNG (mulberry32) so a section's scatter is stable between visits. */
function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Placed = { kind: DoodleKind; x: number; y: number; rot: number; scale: number };

function scatter(seed: string, count: number): Placed[] {
  const next = rng(seed);
  const out: Placed[] = [];
  for (let i = 0; i < count; i++) {
    const kind = DOODLE_KINDS[Math.floor(next() * DOODLE_KINDS.length)];
    // Six in ten sit in the margins; the rest can land anywhere.
    const edge = next() < 0.6;
    const x = edge ? (next() < 0.5 ? -2 + next() * 16 : 84 + next() * 16) : 10 + next() * 80;
    const y = 2 + next() * 94;
    const rot = -24 + next() * 48;
    const scale = 0.8 + next() * 0.5;
    out.push({ kind, x, y, rot, scale });
  }
  return out;
}

/** How many doodles a chapter with `works` works gets: about one per two and a half works. */
export function doodleCount(works: number) {
  return Math.min(12, Math.max(4, Math.round(works / 2.5)));
}

/**
 * The scatter behind one section. The host section needs `sk-has-doodles`
 * so its content stacks above the field.
 */
export function DoodleField({ seed, count }: { seed: string; count: number }) {
  const ref = useParallax<HTMLDivElement>(-0.03);
  const placed = scatter(seed, count);
  return (
    <div ref={ref} className="sk-doodles sk-px" aria-hidden="true">
      {placed.map((d, i) => (
        <span
          key={i}
          className="sk-doodle"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${Math.round(doodleWidth(d.kind) * d.scale)}px`,
            "--rot": `${d.rot.toFixed(1)}deg`,
          } as CSSProperties}
        >
          <FestivalDoodle kind={d.kind} />
        </span>
      ))}
    </div>
  );
}
```

`scatter` is pure and runs identically on server and client, so there is no hydration mismatch.

- [ ] **Step 4: Drop a field into each section**

- `Desk.tsx`: add `sk-has-doodles` to the `<section className="sk-desk">` class list and, as its first child, `<DoodleField seed="desk" count={6} />`.
- `IntroNote.tsx`: add `sk-has-doodles` to the section, first child `<DoodleField seed="intro" count={3} />`.
- `ChapterPage.tsx`: add `sk-has-doodles` to the section, first child `<DoodleField seed={chapter.posture} count={doodleCount(chapter.works.length)} />`.
- `StoryDoor.tsx`: add `sk-has-doodles` to the section, first child `<DoodleField seed="door" count={3} />`.

Import `DoodleField` (and `doodleCount` in `ChapterPage`) from `@/components/sketchbook/DoodleField`. `IntroNote` and `StoryDoor` are server components; `DoodleField` is a client component and can be rendered from them as-is.

- [ ] **Step 5: Type-check and look**

Run: `npx tsc --noEmit` — expected clean.

In the Browser pane: faint ochre doodles behind the desk, intro, every chapter and the door; none on top of a frame; a reload gives the same scatter. Scroll: they drift slightly against the page. At 375px roughly half remain, smaller. `read_console_messages` errors: none.

- [ ] **Step 6: Commit**

```bash
git add components/sketchbook/doodles.tsx components/sketchbook/DoodleField.tsx components/sketchbook/Desk.tsx components/sketchbook/IntroNote.tsx components/sketchbook/ChapterPage.tsx components/sketchbook/StoryDoor.tsx app/globals.css
git commit -m "Scatter festival doodles behind every section

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9c: Parallax per work, room under the chapter heads, title fully visible

Found in the browser at 1440px after Task 9: each chapter column is 4000–5000px tall, so parallax measured on the column's centre produces `--py` values of −872px to +351px and lifts the columns into the chapter heads. Parallax must move each work instead (bounded to roughly ±70px, since a work's centre is never more than about a viewport from the viewport centre), keeping the three per-column speeds so the columns still read as drifting. Separately, the lead work overlaps the last line of the hero title at desktop.

**Files:**
- Modify: `lib/useParallax.ts` (skip registration when `speed` is 0)
- Modify: `components/sketchbook/PinnedWork.tsx` (parallax carrier + inner swing element, new `parallax` prop)
- Modify: `components/sketchbook/ChapterPage.tsx` (no column-level hook; pass `parallax` per work)
- Modify: `app/globals.css` (chapter spacing; desktop desk layout)

**Interfaces:**
- Consumes: `useParallax` (Task 5), `PinnedWork` (Task 7/9), `ChapterPage` (Task 9).
- Produces: `PinnedWorkProps.parallax?: number` (default 0 = no parallax). `Column` in `ChapterPage` becomes a plain `div.sk-col` with `--col-offset`; no `.sk-px` on columns.

- [ ] **Step 1: Skip zero-speed registration in `lib/useParallax.ts`**

In the effect, change `if (!el) return;` to `if (!el || speed === 0) return;`.

- [ ] **Step 2: Restructure `components/sketchbook/PinnedWork.tsx`**

Add to `PinnedWorkProps`:

```ts
  /** Scroll parallax speed for this work; 0 (default) registers nothing. */
  parallax?: number;
```

Destructure `parallax = 0`. Add `import { useParallax } from "@/lib/useParallax";` and inside the component `const pxRef = useParallax<HTMLElement>(parallax);` (keep the existing `const ref = useArrival<HTMLDivElement>();` but retype it to `HTMLDivElement`).

Split the style object in two:

```tsx
  const figureStyle = {
    "--w": width,
    "--ms": hangRight ? "auto" : "0",
    "--me": hangRight ? "0" : "auto",
    "--i": order,
  } as CSSProperties;

  const swingStyle = {
    "--rot": `${rotate}deg`,
    "--reveal-delay": `${(index % 3) * 110}ms`,
  } as CSSProperties;
```

Change the JSX so the figure is the parallax carrier and an inner div swings:

```tsx
    <figure ref={pxRef} className="sk-work sk-px" style={figureStyle}>
      <div ref={ref} className="sk-swing" style={swingStyle}>
        {/* ...everything that was inside the figure before: the frame button, the figcaption, the note... */}
      </div>
    </figure>
```

Nothing else inside changes.

- [ ] **Step 3: Move the speed to the works in `components/sketchbook/ChapterPage.tsx`**

Replace the `Column` helper with:

```tsx
/** One column of the wall. Its works carry the drift; the column only carries its offset. */
function Column({ offset, children }: { offset: string; children: ReactNode }) {
  return (
    <div className="sk-col" style={{ "--col-offset": offset } as CSSProperties}>
      {children}
    </div>
  );
}
```

Remove the `useParallax` import from this file. In the render, call `<Column key={c} offset={OFFSETS[c]}>` and pass `parallax={SPEEDS[c]}` to each `PinnedWork`. Add a comment above `SPEEDS`: `// Per-column drift speeds: 0 lifts gently, 1 sinks slowly against the page, 2 lifts most.`

- [ ] **Step 4: Spacing in `app/globals.css`**

In the "intro, chapters, door, sign-off" block:
- `.sk-chapter { padding-top: var(--space-9); ... }` stays for phones; inside the block's `@media (min-width: 768px)` add `.sk-chapter { padding-top: var(--space-10); }` and `.sk-columns { margin-top: var(--space-8); }` (append these two lines inside that existing media block).

In the "nav and the desk" block the desktop hero currently relies on a fixed `min-height` and absolutely positioned notes and hint, so at 1440px the title's last line hides behind the lead and the notes and hint overlap the lead's caption. Replace the desktop rules with a grid that keeps everything in flow. Replace the ENTIRE `@media (min-width: 768px) { ... }` block of that section (the one containing `.sk-desk { min-height: ...}` through `.sk-desk-star { display: block; ... }`) with:

```css
@media (min-width: 768px) {
  .sk-desk { padding-top: var(--space-7); }
  .sk-desk-stage {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 380px) minmax(0, 1fr);
    align-items: start;
    column-gap: var(--space-6);
    margin-top: var(--space-5);
  }
  .sk-desk-lead { grid-column: 2; width: 100%; margin: 0; }
  .sk-desk-study { position: static; width: min(100%, 190px); max-width: none; }
  .sk-desk-study--left { grid-column: 1; justify-self: end; margin-top: 18%; }
  .sk-desk-study--right { grid-column: 3; justify-self: start; margin-top: 6%; }
  .sk-desk-notes { margin-top: var(--space-5); padding-inline: 4%; }
  .sk-desk-hint { margin-top: var(--space-6); }
  .sk-desk-star { display: block; position: absolute; right: 14%; top: 10%; width: 34px; transform: rotate(14deg); }
}
```

and replace the section's `@media (min-width: 1180px) { ... }` block (the one with `.sk-desk-lead { width: min(30vw, 380px); }`) with:

```css
@media (min-width: 1180px) {
  .sk-desk-stage { column-gap: var(--space-8); }
  .sk-desk-study { width: min(100%, 220px); }
}
```

Leave the phone rules of the section (everything outside those two media blocks) exactly as they are: phones stack and peek and are fine. `Desk.tsx` does not change.

- [ ] **Step 5: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing; `npm run build` succeeds. With the dev server on port 3000: `curl -s http://localhost:3000/ | grep -o 'class="sk-col"' | wc -l` prints 18 (no `sk-px` on columns), and `grep -o 'class="sk-work sk-px"' | wc -l` prints 110. `grep -c "min-height: clamp(560px" app/globals.css` prints 0 and `grep -c "grid-template-columns: minmax(0, 1fr) minmax(0, 380px)" app/globals.css` prints 1.

- [ ] **Step 6: Commit**

```bash
git add lib/useParallax.ts components/sketchbook/PinnedWork.tsx components/sketchbook/ChapterPage.tsx app/globals.css
git commit -m "Move parallax from columns to works and clear the chapter heads

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: The sketch viewer

**Files:**
- Create: `lib/useLightbox.ts`
- Create: `components/sketchbook/SketchViewer.tsx`
- Modify: `components/sketchbook/Sketchbook.tsx`
- Modify: `app/globals.css` (append)

**Interfaces:**
- Consumes: `LikeButton` (Task 4), `CloseDoodle`, `Arrow` (Task 7), `describe`, `formatNumber` (`components/Plate.tsx`).
- Produces:
  ```ts
  export function useLightbox({ onClose, onMove }: { onClose: () => void; onMove: (delta: 1 | -1) => void }): { dialogRef: RefObject<HTMLDivElement | null>; onTouchStart: TouchEventHandler; onTouchEnd: TouchEventHandler };
  export function SketchViewer({ works, index, onClose, onMove }: { works: Artwork[]; index: number; onClose: () => void; onMove: (next: number) => void }): JSX.Element | null;
  ```

- [ ] **Step 1: Write `lib/useLightbox.ts`**

```ts
"use client";

import { useCallback, useEffect, useRef, type TouchEvent } from "react";

/**
 * What every full-screen viewer needs and none should re-implement:
 * Escape closes, arrow keys move, focus enters the dialog and returns on
 * close, page scroll is locked, and a horizontal swipe moves.
 */
export function useLightbox({
  onClose,
  onMove,
}: {
  onClose: () => void;
  onMove: (delta: 1 | -1) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const restoreTo = useRef<Element | null>(null);

  useEffect(() => {
    restoreTo.current = document.activeElement;
    dialogRef.current?.focus();
    document.documentElement.classList.add("no-scroll");
    return () => {
      document.documentElement.classList.remove("no-scroll");
      (restoreTo.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onMove(1);
      if (event.key === "ArrowLeft") onMove(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onMove]);

  const onTouchStart = useCallback((event: TouchEvent) => {
    touchX.current = event.touches[0]?.clientX ?? null;
  }, []);

  const onTouchEnd = useCallback(
    (event: TouchEvent) => {
      const start = touchX.current;
      touchX.current = null;
      const end = event.changedTouches[0]?.clientX;
      if (start === null || end === undefined) return;
      const dx = end - start;
      if (Math.abs(dx) > 48) onMove(dx < 0 ? 1 : -1);
    },
    [onMove],
  );

  return { dialogRef, onTouchStart, onTouchEnd };
}
```

- [ ] **Step 2: Append the viewer CSS to `app/globals.css`**

```css
/* --- the sketch viewer ---------------------------------------------------- */

.sk-viewer {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: var(--space-4);
  outline: none;
  animation: viewer-in 360ms var(--ease-gallery) both;
}

.sk-viewer::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 55%, rgba(59, 42, 32, 0.22) 100%);
  pointer-events: none;
}

.sk-viewer > * { position: relative; }

.sk-viewer-top { display: flex; justify-content: space-between; align-items: center; color: var(--color-ink-soft); }
.sk-viewer-close { width: 40px; height: 40px; padding: 6px; cursor: pointer; border-radius: 8px; }
.sk-viewer-close .sk-arrow { stroke: var(--color-ink); stroke-width: 2.6; }

.sk-viewer-stage {
  display: grid;
  place-items: center;
  min-height: 0;
  padding-block: var(--space-3);
}

.sk-viewer-sheet {
  display: grid;
  justify-items: center;
  gap: var(--space-4);
  max-width: min(92vw, 720px);
  animation: viewer-plate-in 520ms var(--ease-swing) both;
}

.sk-viewer-sheet .sk-frame { --rot: -1deg; transform: rotate(var(--rot)); max-height: 72vh; }
.sk-viewer-sheet .sk-frame img { max-height: calc(72vh - 2 * clamp(4px, 0.6vw, 8px) - 4px); width: auto; max-width: 100%; height: auto; object-fit: contain; }

.sk-viewer-caption { text-align: center; max-width: 34rem; }
.sk-viewer-title { display: inline-flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; justify-content: center; }
.sk-viewer-meta { color: var(--color-ink-soft); margin-top: var(--space-1); }
.sk-viewer-offerings { color: var(--color-ink-soft); margin-top: var(--space-2); font-style: italic; }

.sk-viewer-nav { display: flex; justify-content: center; gap: var(--space-8); }
.sk-viewer-arrow { width: 72px; height: 40px; padding: 4px; cursor: pointer; border-radius: 8px; }
.sk-viewer-arrow .sk-arrow { stroke: var(--color-ink); }
.sk-viewer-arrow--prev .sk-arrow { transform: scaleX(-1); }

@media (min-width: 768px) {
  .sk-viewer { padding: var(--space-5) var(--space-6); }
  .sk-viewer-nav { position: absolute; inset: 0; pointer-events: none; display: flex; justify-content: space-between; align-items: center; }
  .sk-viewer-arrow { pointer-events: auto; width: 96px; height: 56px; }
}
```

- [ ] **Step 3: Write `components/sketchbook/SketchViewer.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useCallback } from "react";
import { describe, formatNumber } from "@/components/Plate";
import { LikeButton } from "@/components/sketchbook/LikeButton";
import { Arrow, CloseDoodle } from "@/components/sketchbook/doodles";
import { useLightbox } from "@/lib/useLightbox";
import type { Artwork } from "@/lib/types";

/** A page pulled out of the sketchbook: one work, large, with its notes. */
export function SketchViewer({
  works,
  index,
  onClose,
  onMove,
}: {
  works: Artwork[];
  index: number;
  onClose: () => void;
  onMove: (next: number) => void;
}) {
  const move = useCallback(
    (delta: 1 | -1) => onMove((index + delta + works.length) % works.length),
    [index, works.length, onMove],
  );
  const { dialogRef, onTouchStart, onTouchEnd } = useLightbox({ onClose, onMove: move });
  const artwork = works[index];
  if (!artwork) return null;

  const offerings = artwork.offerings.length ? artwork.offerings.join(" · ") : "No offering shown";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`No. ${formatNumber(artwork.id)}, ${artwork.title}`}
      tabIndex={-1}
      className="sk-viewer room-sketch"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="sk-viewer-top sk-hand-note">
        <span>
          {artwork.id} of {works.length}
        </span>
        <button type="button" onClick={onClose} className="sk-viewer-close" aria-label="Close">
          <CloseDoodle />
        </button>
      </div>

      <div className="sk-viewer-stage">
        <figure key={artwork.id} className="sk-viewer-sheet">
          <div className="sk-frame">
            <span className="sk-tape" />
            <span className="sk-tape sk-tape--r" />
            <Image
              src={artwork.src}
              alt={`${artwork.title}. ${describe(artwork)}`}
              width={artwork.width}
              height={artwork.height}
              placeholder="blur"
              blurDataURL={artwork.blurDataURL}
              sizes="(min-width: 768px) 720px, 92vw"
              quality={88}
              priority
            />
          </div>
          <figcaption className="sk-viewer-caption">
            <div className="sk-viewer-title">
              <span className="sk-work-num" style={{ fontSize: "var(--text-hand-note)" }}>
                No. {formatNumber(artwork.id)}
              </span>
              <span className="sk-hand-subhead">{artwork.title}</span>
              <LikeButton id={artwork.id} />
            </div>
            <p className="sk-viewer-meta sk-hand-note">
              {artwork.material.toLowerCase()} · {artwork.trunk.toLowerCase()} trunk · {artwork.palette.toLowerCase()}
            </p>
            <p className="sk-viewer-offerings sk-serif-body">{offerings}</p>
          </figcaption>
        </figure>
      </div>

      <div className="sk-viewer-nav">
        <button type="button" onClick={() => move(-1)} className="sk-viewer-arrow sk-viewer-arrow--prev" aria-label="Previous">
          <Arrow kind="swoop" />
        </button>
        <button type="button" onClick={() => move(1)} className="sk-viewer-arrow" aria-label="Next">
          <Arrow kind="swoop" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire it into `Sketchbook.tsx`**

Replace the placeholder line and comment with:

```tsx
{openAt !== null && (
  <SketchViewer works={order} index={openAt} onClose={() => setOpenAt(null)} onMove={setOpenAt} />
)}
```

and import `SketchViewer` from `@/components/sketchbook/SketchViewer`.

- [ ] **Step 5: Type-check and test in the browser**

Run: `npx tsc --noEmit` — expected clean.

In the Browser pane: click the lead work. Expected: the sheet fades in on clay paper with a soft vignette, the work in a wobbly frame with two tapes, "1 of 108" top-left, a scribbled ✕ top-right, "No. 001 Standing Ganesha with Lotus" with the heart, the material line and the offerings line. Press the right arrow key: it moves to No. 002 and the counter reads "2 of 108". Press Escape: it closes and focus returns to the work's button (check `document.activeElement.getAttribute("aria-label")` with `javascript_tool`; expected `Open No. 001, Standing Ganesha with Lotus`). Like inside the viewer, close, and confirm the heart under the same work on the page is filled with the same count. At 375px the arrows sit beneath the caption.

- [ ] **Step 6: Commit**

```bash
git add lib/useLightbox.ts components/sketchbook/SketchViewer.tsx components/sketchbook/Sketchbook.tsx app/globals.css
git commit -m "Add the sketchbook viewer with likes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10b: Viewer download button, stable frame box, positional counter

User request after seeing the viewer: a download button per work, and no size change while switching works (the frame currently follows each work's aspect ratio, so it visibly shrinks and grows between portrait and square drawings). Also the counter showed "1 of 107" then "5 of 107" on one arrow press because it printed the catalogue id; a counter should print the position.

**Files:**
- Modify: `components/sketchbook/doodles.tsx` (append `DownloadDoodle`)
- Modify: `components/sketchbook/SketchViewer.tsx`
- Modify: `app/globals.css` (viewer block)

**Interfaces:**
- Produces: `DownloadDoodle(): JSX.Element`. `SketchViewer` props unchanged.

- [ ] **Step 1: Append the download mark to `components/sketchbook/doodles.tsx`**

```tsx
/** An arrow dropping into a tray, drawn in two strokes. */
export function DownloadDoodle() {
  return (
    <svg viewBox="0 0 32 32" className="sk-arrow" aria-hidden="true">
      <path d="M16 4 C 16 10, 15.5 16, 16 21" />
      <path d="M9 15 L16 22 L23 15" />
      <path d="M5 24 C 10 27, 22 27, 27 24" />
    </svg>
  );
}
```

- [ ] **Step 2: Update `components/sketchbook/SketchViewer.tsx`**

Import `DownloadDoodle` alongside `Arrow` and `CloseDoodle`. Add above the `return`:

```tsx
  const fileName = `ganapati-no-${formatNumber(artwork.id)}-${artwork.slug}.avif`;
```

(`slug` is on every artwork, e.g. `ganesha-001`.)

Change the counter to the position:

```tsx
        <span>
          {index + 1} of {works.length}
        </span>
```

Replace the single close button in `.sk-viewer-top` with a right-hand group:

```tsx
        <div className="sk-viewer-actions">
          <a
            href={artwork.src}
            download={fileName}
            className="sk-viewer-action"
            aria-label={`Download No. ${formatNumber(artwork.id)}`}
            title="Download"
          >
            <DownloadDoodle />
          </a>
          <button type="button" onClick={onClose} className="sk-viewer-action sk-viewer-close" aria-label="Close" title="Close">
            <CloseDoodle />
          </button>
        </div>
```

Give the `<Image>` `className="sk-viewer-img"` (keep every other prop).

- [ ] **Step 3: CSS**

In the "the sketch viewer" block of `app/globals.css`:

Replace the two rules

```css
.sk-viewer-close { width: 40px; height: 40px; padding: 6px; cursor: pointer; border-radius: 8px; }
.sk-viewer-close .sk-arrow { stroke: var(--color-ink); stroke-width: 2.6; }
```

with

```css
.sk-viewer-actions { display: flex; align-items: center; gap: var(--space-2); }
.sk-viewer-action { display: inline-flex; width: 40px; height: 40px; padding: 6px; cursor: pointer; border-radius: 8px; color: inherit; }
.sk-viewer-action .sk-arrow { stroke: var(--color-ink); stroke-width: 2.6; width: 100%; height: 100%; }
.sk-viewer-action:hover .sk-arrow { stroke: var(--color-teal); }
```

Replace the two frame/image sizing rules

```css
.sk-viewer-sheet .sk-frame { --rot: -1deg; transform: rotate(var(--rot)); max-height: 72vh; }
.sk-viewer-sheet .sk-frame img { max-height: calc(72vh - 2 * clamp(4px, 0.6vw, 8px) - 4px); width: auto; max-width: 100%; height: auto; object-fit: contain; }
```

with a fixed box that every work is contained in, so the sheet never changes size while the next image loads:

```css
/* One box for every work: the mat shows around narrower drawings, and the
   sheet keeps its size while the next image loads. */
.sk-viewer-sheet .sk-frame {
  --rot: -1deg;
  transform: rotate(var(--rot));
  width: min(92vw, 72vh, 720px);
  height: min(92vw, 72vh, 720px);
  display: grid;
  place-items: center;
}
.sk-viewer-sheet .sk-viewer-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

- [ ] **Step 4: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing; `npm run build` succeeds. In the browser (dev server on port 3000): open No. 001, note the frame's bounding box, press ArrowRight three times through works of different aspect ratios and confirm the frame's width and height do not change (`javascript_tool`: `document.querySelector('.sk-viewer-sheet .sk-frame').getBoundingClientRect()` before and after); the counter reads "1 of 107", "2 of 107", …; the download link's `href` is the work's `/images/ganesha-###.avif` and its `download` attribute is `ganapati-no-###-ganesha-###.avif`; at 375px the two action buttons sit top-right and the frame box is 92vw square.

- [ ] **Step 5: Commit**

```bash
git add components/sketchbook/doodles.tsx components/sketchbook/SketchViewer.tsx app/globals.css
git commit -m "Viewer: download button, fixed frame box, positional counter

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10c: Viewer fits short viewports

Measured in a 670 × 459 window: the top row ends at 56px, the sheet is 434px tall (frame 72vh plus caption), so the caption ends at 505px, below the viewport, and the in-flow arrows (mobile layout) land on top of it. The frame box must be budgeted from the viewport height with room for the caption and arrows, and the viewer must scroll if it still does not fit.

**Files:**
- Modify: `app/globals.css` (viewer block)
- Modify: `components/sketchbook/SketchViewer.tsx` (one prop on the `Image`)

- [ ] **Step 1: CSS**

In the "the sketch viewer" block of `app/globals.css`:

Replace

```css
.sk-viewer {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: var(--space-4);
  outline: none;
  animation: viewer-in 360ms var(--ease-gallery) both;
}
```

with

```css
.sk-viewer {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  overflow-y: auto;
  overscroll-behavior: contain;
  outline: none;
  animation: viewer-in 360ms var(--ease-gallery) both;
  /* The frame is square; budget it from the shorter side, leaving room for the
     top row, the caption and the arrows, and never below 200px. */
  --sheet: max(200px, min(92vw, 100vh - 300px, 720px));
}
```

Replace

```css
.sk-viewer-stage {
  display: grid;
  place-items: center;
  min-height: 0;
  padding-block: var(--space-3);
}
```

with

```css
.sk-viewer-stage {
  display: grid;
  place-items: center;
  flex: 1 0 auto;
  min-height: 0;
  padding-block: var(--space-2);
}
```

In `.sk-viewer-sheet .sk-frame { ... }` replace the two lines `width: min(92vw, 72vh, 720px);` and `height: min(92vw, 72vh, 720px);` with `width: var(--sheet);` and `height: var(--sheet);`.

Inside the block's `@media (min-width: 768px) { ... }` change `.sk-viewer { padding: var(--space-5) var(--space-6); }` to `.sk-viewer { padding: var(--space-5) var(--space-6); --sheet: max(240px, min(92vw, 100vh - 260px, 720px)); }` (on desktop the arrows are absolute, so the caption needs less budget).

- [ ] **Step 2: Blur placeholder inside the contain box**

In `components/sketchbook/SketchViewer.tsx`, add `style={{ objectFit: "contain" }}` to the `<Image>` (keep every other prop). Next derives the blur placeholder's `background-size` from this, so the placeholder is no longer cropped to cover the square box.

- [ ] **Step 3: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing; `npm run build` succeeds. In the browser (dev server on port 3000) with the window about 670 × 460: open a work; `javascript_tool` shows the caption's bottom and the nav's bottom both ≤ `innerHeight`, and the nav's top ≥ the caption's bottom (no overlap). At 1440 × 900: the frame is 600px square (`min(92vw, 640, 720)` → 640 minus nothing: expect `--sheet` = 640px) and the caption is visible under it. At 375 × 812: frame 345px (92vw), everything visible without scrolling.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css components/sketchbook/SketchViewer.tsx
git commit -m "Viewer: budget the frame from the viewport so the caption always fits

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10d: Remove the gallery and about routes

User decision: the homepage is the only place the collection lives. `/gallery` and `/about` go away, together with the components only they used. The story route stays and its links point home. The shared helpers `formatNumber` and `describe` move out of `components/Plate.tsx` into `lib/format.ts` so `Plate.tsx` can go too.

**Files:**
- Create: `lib/format.ts`
- Delete: `app/gallery/page.tsx`, `app/about/page.tsx`, `components/Gallery.tsx`, `components/Masthead.tsx`, `components/ChapterDivider.tsx`, `components/Viewer.tsx`, `components/Plate.tsx`
- Modify: `components/sketchbook/{LikeButton,PinnedWork,ChapterPage,SketchViewer}.tsx` (import path only), `components/sketchbook/HandNav.tsx`, `components/sketchbook/StoryDoor.tsx`, `data/notes.ts`, `components/SiteHeader.tsx`, `components/SiteFooter.tsx`, `components/story/FormsStrip.tsx`, `app/ganesh-chaturthi/page.tsx` (one href), `README.md`

**Interfaces:**
- Produces: `lib/format.ts` exporting `formatNumber(id: number): string` and `describe(artwork: Artwork): string` with the exact bodies from `components/Plate.tsx`.

- [ ] **Step 1: Create `lib/format.ts`**

```ts
import type { Artwork } from "@/lib/types";

/** Three-digit catalogue number: 61 → "061". */
export function formatNumber(id: number) {
  return String(id).padStart(3, "0");
}

/** The short description under a work: posture, material and trunk. */
export function describe(artwork: Artwork) {
  return [artwork.posture, artwork.material, `${artwork.trunk} trunk`].join(" · ");
}
```

Then change the import in each of `components/sketchbook/LikeButton.tsx`, `PinnedWork.tsx`, `ChapterPage.tsx`, `SketchViewer.tsx` from `"@/components/Plate"` to `"@/lib/format"` (same named imports).

- [ ] **Step 2: Delete the routes and their components**

```bash
git rm -r app/gallery app/about
git rm components/Gallery.tsx components/Masthead.tsx components/ChapterDivider.tsx components/Viewer.tsx components/Plate.tsx
```

Run `npx tsc --noEmit` — expected: errors only in the files Step 3 fixes (links), or clean.

- [ ] **Step 3: Repoint every link**

- `components/sketchbook/HandNav.tsx`: `LINKS` becomes `[{ href: "/ganesh-chaturthi", label: "the story" }]`.
- `components/sketchbook/StoryDoor.tsx`: remove the `<Link href="/about" ...>{door.aboutLink}</Link>` element. In `data/notes.ts` remove the `aboutLink` field from `door`.
- `components/SiteHeader.tsx`: `NAV` becomes `[{ href: "/", label: "The Sketchbook" }, { href: "/ganesh-chaturthi", label: "The Story" }]`; the brand `<Link href="/gallery" ...>` becomes `href="/"`; `EYEBROW` keeps only the `"/ganesh-chaturthi"` entry and its default string.
- `components/SiteFooter.tsx`: the first door becomes `{ href: "/", kicker: "The Sketchbook", title: `${total} drawings of Bappa, pinned into one notebook.`, hint: "What Bappa looks like to us." }`.
- `components/story/FormsStrip.tsx`: both `href="/gallery"` become `href="/"`.
- `app/ganesh-chaturthi/page.tsx`: the one `href="/gallery"` becomes `href="/"`.

Run `grep -rn '"/gallery\|"/about\|@/components/Plate' app components data lib` — expected: no output.

- [ ] **Step 4: README**

In the route table remove the `/gallery` and `/about` rows and make the `/` row read: `| \`/\` | **The Sketchbook** — the front door and the whole collection: all works pinned into the artist's notebook, with margin notes, parallax and a like heart on every work. |`. In "How it fits together", if `components/Plate.tsx` or the gallery are mentioned, update to `lib/format.ts` and the sketchbook components.

- [ ] **Step 5: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing; `npm run build` succeeds and its route list shows `/`, `/api/likes`, `/ganesh-chaturthi` and no `/gallery` or `/about`. Against the dev server on port 3000: `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/gallery` → 404, same for `/about`; `http://localhost:3000/ganesh-chaturthi` → 200; `/` still has 110 `figure.sk-work`.

- [ ] **Step 6: Commit**

```bash
git add -A app components data lib README.md
git commit -m "Remove the gallery and about routes; the sketchbook is the collection

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

(`git add -A` scoped to those paths is fine here because the deletions must be staged; nothing outside them changes.)

---

### Task 10e: The flute — background music control in the header

User request: an optional looping track (`meditative-flute`) the visitor can play and pause from the homepage header. One button only, no mute control. A small waveform sits beside the label at all times: static when paused, breathing while playing. The audio files are already in `public/audio/` (`meditative-flute.webm`, Opus, and `meditative-flute.m4a`, AAC fallback for Safari). Nothing autoplays: playback starts only from the visitor's click, as browsers require.

**Files:**
- Modify: `components/sketchbook/doodles.tsx` (append `FluteDoodle`)
- Create: `components/sketchbook/FluteToggle.tsx`
- Modify: `components/sketchbook/HandNav.tsx`
- Modify: `app/globals.css` (append)
- Modify: `docs/design-system.md` (two short additions)

**Interfaces:**
- Produces: `FluteToggle(): JSX.Element`, `FluteDoodle(): JSX.Element`.

- [ ] **Step 1: Append the flute mark to `components/sketchbook/doodles.tsx`**

```tsx
/** A bansuri: two long strokes, a wrapped end, and six holes. */
export function FluteDoodle() {
  return (
    <svg viewBox="0 0 64 24" className="sk-arrow" aria-hidden="true">
      <path d="M4 15 C 20 9, 44 8, 60 9" />
      <path d="M4 19 C 20 13, 44 12, 60 13" />
      <path d="M4 15 L 4 19 M60 9 L 60 13" />
      <path d="M8 14 L 8 18 M11 13.5 L 11 17.5" />
      <path d="M22 13 h0.01 M28 12.5 h0.01 M34 12 h0.01 M40 11.7 h0.01 M46 11.4 h0.01 M52 11.2 h0.01" />
    </svg>
  );
}
```

- [ ] **Step 2: Write `components/sketchbook/FluteToggle.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { FluteDoodle } from "@/components/sketchbook/doodles";

/**
 * A looping flute the visitor can start and stop from the header. Nothing
 * plays until they ask: browsers require the gesture, and so does good
 * manners. The waveform is always there; it only moves while the track does.
 */
export function FluteToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
    } catch {
      // Blocked or unsupported: the button simply stays in its "play" state.
    }
  };

  return (
    <div className="sk-flute" data-playing={playing ? "" : undefined}>
      <audio
        ref={audioRef}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/audio/meditative-flute.webm" type='audio/webm; codecs="opus"' />
        <source src="/audio/meditative-flute.m4a" type="audio/mp4" />
      </audio>

      <button
        type="button"
        className="sk-flute-play"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Pause the flute" : "Play the flute"}
      >
        <FluteDoodle />
        <span>{playing ? "pause the flute" : "play the flute"}</span>
        <span className="sk-flute-waves" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Put it in the header**

In `components/sketchbook/HandNav.tsx`, import `FluteToggle` and render it between the brand link and the links div:

```tsx
      <Link href="/" className="sk-nav-brand">
        Ganapati
      </Link>
      <FluteToggle />
      <div className="sk-nav-links">
```

`HandNav` stays a server component; `FluteToggle` is a client component and can be rendered from it.

- [ ] **Step 4: CSS**

Append to `app/globals.css`:

```css
/* --- the flute -------------------------------------------------------------
   A looping track the visitor can start from the header. Off until asked. */

.sk-flute {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-hand);
  font-weight: 500;
  font-size: var(--text-hand-note);
  color: var(--color-ink-soft);
}

.sk-flute-play {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  color: inherit;
  border-radius: 6px;
  padding: 2px 6px;
  margin: -2px -6px;
  transition: color 300ms var(--ease-gallery);
}

.sk-flute-play:hover { color: var(--color-teal); }
.sk-flute[data-playing] .sk-flute-play { color: var(--color-ink); }

.sk-flute-play .sk-arrow { width: 36px; height: 14px; stroke: var(--color-ink); stroke-width: 2; }
.sk-flute-play .sk-arrow path:last-child { stroke-width: 3; }

/* five little bars: still while paused, breathing while the track plays */
.sk-flute-waves { display: inline-flex; align-items: center; gap: 2px; height: 14px; margin-inline-start: 2px; }
.sk-flute-waves i {
  display: block;
  width: 2px;
  border-radius: 1px;
  background: var(--color-terracotta);
  height: var(--h, 6px);
}
.sk-flute-waves i:nth-child(1) { --h: 5px; }
.sk-flute-waves i:nth-child(2) { --h: 9px; }
.sk-flute-waves i:nth-child(3) { --h: 13px; }
.sk-flute-waves i:nth-child(4) { --h: 8px; }
.sk-flute-waves i:nth-child(5) { --h: 5px; }

@keyframes sk-wave { from { height: 4px; } to { height: 14px; } }

.sk-flute[data-playing] .sk-flute-waves i {
  animation: sk-wave 700ms var(--ease-gallery) infinite alternate;
}
.sk-flute[data-playing] .sk-flute-waves i:nth-child(2) { animation-delay: 120ms; }
.sk-flute[data-playing] .sk-flute-waves i:nth-child(3) { animation-delay: 240ms; }
.sk-flute[data-playing] .sk-flute-waves i:nth-child(4) { animation-delay: 360ms; }
.sk-flute[data-playing] .sk-flute-waves i:nth-child(5) { animation-delay: 480ms; }

@media (prefers-reduced-motion: reduce) {
  .sk-flute[data-playing] .sk-flute-waves i { animation: none; }
}

@media (max-width: 767px) {
  .sk-nav { row-gap: var(--space-3); }
  .sk-flute { order: 3; width: 100%; }
}
```

- [ ] **Step 5: Document**

In `docs/design-system.md`, under "## Motion", add the line: `` `sk-wave` (the flute's five breathing bars, off under reduced motion). `` And under a new short heading `## Audio`: "The flute in the header loops `public/audio/meditative-flute.webm` (Opus) with `meditative-flute.m4a` as the AAC fallback. One play/pause button; it never autoplays."

- [ ] **Step 6: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing; `npm run build` succeeds. Against the dev server on port 3000: `curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:3000/audio/meditative-flute.webm` → 200 with a webm type; same for `.m4a` → 200 with an mp4 type; `curl -s http://localhost:3000/ | grep -c 'sk-flute-play'` → 1; the served HTML must not contain `sk-flute-mute`. In the browser (if available): the five bars are visible and still before any click; click "play the flute" — the label becomes "pause the flute", `aria-pressed` is `true`, the bars animate (check `getComputedStyle(document.querySelector('.sk-flute-waves i')).animationName === 'sk-wave'`); click again — label "play the flute", bars still (`animationName === 'none'`). At 375px the control sits on its own row under the brand and links.

- [ ] **Step 7: Commit**

```bash
git add components/sketchbook/doodles.tsx components/sketchbook/FluteToggle.tsx components/sketchbook/HandNav.tsx app/globals.css docs/design-system.md
git commit -m "Add the flute: a looping track the visitor can play from the header

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10f: Phone hero proportions

Measured at 375px: `.sk-desk-lead` is 331px wide (nearly the full screen) and the two studies, about 125px wide at the left and right edges, sit inside its span and overlap it. On phones the lead must leave room for the studies to peek in beside it.

**Files:**
- Modify: `app/globals.css` (phone rules of the "nav and the desk" block only)

- [ ] **Step 1: CSS**

In the "nav and the desk" block of `app/globals.css`, OUTSIDE any media query (these are the phone base rules), replace

```css
.sk-desk-lead { width: min(100%, 320px); margin-inline: auto; }
.sk-desk-study { position: absolute; width: 30%; max-width: 150px; top: 8%; }
.sk-desk-study--left { left: -6%; }
.sk-desk-study--right { right: -5%; top: 46%; }
```

with

```css
/* phone: the lead takes the middle, the studies peek in from the edges beside it */
.sk-desk-lead { width: min(58%, 250px); margin-inline: auto; }
.sk-desk-study { position: absolute; width: 26%; max-width: 120px; top: 6%; }
.sk-desk-study--left { left: -4%; }
.sk-desk-study--right { right: -3%; top: 38%; }
```

Leave the `@media (min-width: 768px)` and `@media (min-width: 1180px)` blocks of the section exactly as they are (they set `position: static` and grid placement for the studies, so these phone offsets do not apply there).

- [ ] **Step 2: Verify**

`npx tsc --noEmit` clean; `npm run build` succeeds. In the browser at the 375×812 mobile preset (dev server on port 3000), via `javascript_tool`:

```js
const q=s=>{const r=document.querySelector(s).getBoundingClientRect(); return {l:Math.round(r.left), r:Math.round(r.right), w:Math.round(r.width)}}; const lead=q('.sk-desk-lead'), L=q('.sk-desk-study--left'), R=q('.sk-desk-study--right'); ({lead, L, R, leftClear: L.r <= lead.l + 6, rightClear: R.l >= lead.r - 6})
```

Expected: `leftClear: true`, `rightClear: true` (a few pixels of rotated-frame overlap are fine), lead width about 217px, studies about 97px. Take a screenshot at that preset. Then reset the viewport to the `desktop` preset and confirm at 1440px the studies are still in the grid beside the lead (unchanged from Task 9c).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "Phone hero: lead in the middle, studies beside it

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Verification pass, README and production build

**Files:**
- Modify: `README.md` (route table and a Likes paragraph)

- [ ] **Step 1: Update the README**

The route table was already updated in Task 10d; confirm it lists only `/` and `/ganesh-chaturthi`.

After the "How it fits together" table add:

```markdown
## Likes

Every work on the homepage has a like heart. Counts live in Upstash Redis:
add "Upstash Redis" to the Vercel project from the Marketplace and the two
variables in `.env.example` are injected for you. With them unset (locally),
counts are kept in memory and reset when the dev server restarts. The API is
two calls, documented in `docs/design-system.md`. Design tokens for every
room of the site are in the same file.
```

- [ ] **Step 2: Run everything**

```bash
npm test && npx tsc --noEmit && npm run build
```

Expected: 9 tests passing, type-check clean, build succeeds and lists `/`, `/api/likes` (ƒ dynamic), `/ganesh-chaturthi` only.

- [ ] **Step 3: Browser checks at three widths**

With the dev server in the Browser pane, for each of `resize_window` presets `mobile` (375), custom `900×1000`, and `desktop`:

1. `javascript_tool`: `document.documentElement.scrollWidth <= window.innerWidth` — expected `true` (no horizontal scroll).
2. `javascript_tool`: `document.querySelectorAll("figure.sk-work").length` — expected `111`.
3. Scroll to the middle of chapter III and take a screenshot.
4. At desktop only: `javascript_tool` after scrolling 600px: `getComputedStyle(document.querySelector(".sk-desk-title")).transform !== "none"` — expected `true` (parallax applied). At mobile: `document.querySelector(".sk-desk-title").style.getPropertyValue("--py")` — expected `""` or `"0px"`.
5. Click a heart in chapter I: it fills, count increments. Reload: the heart is still filled (localStorage) and the count still shows (server memory). Click again: it empties and decrements.
6. `read_console_messages` with `onlyErrors: true` — expected none.

Attach the three screenshots to the final report.

- [ ] **Step 4: Confirm the story route still works**

Run: `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/ganesh-chaturthi`
Expected: 200. And `git ls-files app/gallery app/about components/Gallery.tsx components/Viewer.tsx components/Plate.tsx` prints nothing.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "Document the sketchbook homepage and likes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Self-review notes

- **Spec coverage.** Festival doodles (T9b), Nav (T8), desk with three layers and notes (T8), intro + contents (T9), six chapters with all works, cycles, captions, meta on every third, margin notes (T6, T7, T9), story door (T9), sign-off (T9), sketch viewer with hook (T10), design tokens + doc (T1), likes button/context/API/store/env (T2–T4), parallax hook and speeds (T5), reduced motion (T1, T5), responsive rules (T1, T8, T9 CSS), tests (T2, T3), README (T11), gallery untouched (T11 step 4).
- **Deviation from the spec worth knowing.** The hero's two studies and lead use `PinnedWork`, so they carry a caption and heart too; the spec only required them to open the viewer. This is additive and matches the approved mockup.
- **Type consistency.** `onOpen: (artwork: Artwork) => void` on `Desk`, `ChapterPage`; `onOpen: () => void` on `PinnedWork`. `useLightbox` receives `onMove: (delta: 1 | -1) => void`; `SketchViewer` receives `onMove: (next: number) => void` and adapts. `LikesStore.bump(id, delta: 1 | -1)` matches `parseToggle`'s return.

### Task 11b: Remove the hero's margin notes, fix the README count

User decision: the two handwritten notes on the desk ("← this one dances", "six arms, zero chill →") do not read well and are removed. The scroll hint stays. Also the README still says "108 plates" in one place; the collection has 107.

**Files:**
- Modify: `components/sketchbook/Desk.tsx`
- Modify: `data/notes.ts`
- Modify: `app/globals.css` (remove the now-dead `.sk-desk-notes` rules)
- Modify: `README.md`

- [ ] **Step 1: Remove the notes from the desk**

In `components/sketchbook/Desk.tsx` delete the whole `<div className="sk-desk-notes sk-hand-note" aria-hidden="true">…</div>` element. In `data/notes.ts` remove the `noteLeft` and `noteRight` fields from `desk` (keep `studyLeft`, `studyRight`, `scrollHint`). Run `grep -rn "noteLeft\|noteRight\|sk-desk-notes" app components data lib` — expected: only the CSS rules, which Step 2 removes.

- [ ] **Step 2: Remove the dead CSS**

In `app/globals.css`, in the "nav and the desk" block, delete the `.sk-desk-notes { ... }` rule (phone base) and the `.sk-desk-notes { ... }` line inside the section's `@media (min-width: 768px)` block. Run the grep again — expected: no output.

- [ ] **Step 3: README count**

`grep -n "108" README.md` — change any figure that describes the number of works currently in the collection to 107 (leave "108" where it refers to the sacred number or to the catalogue's numbering range, if any; say which in the report).

- [ ] **Step 4: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing; `npm run build` succeeds. `curl -s http://localhost:3000/ | grep -c "this one dances"` → 0.

- [ ] **Step 5: Commit**

```bash
git add components/sketchbook/Desk.tsx data/notes.ts app/globals.css README.md
git commit -m "Drop the hero margin notes; README says 107

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

