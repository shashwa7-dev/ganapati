# Ganapati design system

One token set, defined in `app/globals.css`, used by every page of the site.
Generic roles (`--color-paper`, `--color-ink`, ...) are remapped to the
Clay & Sindoor palette inside `.room-sketch`, which wraps both the sketchbook
homepage and the story page.

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
| leaf | `--color-leaf` | `#8a9a5b` | | mango leaves in the toran |

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

`.sk-toran`: the garland along the top of every page, 56px on phones, 74px
from 768px, static.

## Motion

`--ease-gallery` (existing), `--ease-swing: cubic-bezier(0.34, 1.4, 0.64, 1)`.
Durations: `--dur-swing: 900ms`, `--dur-write: 600ms`, `--dur-like: 350ms`.
Parallax speeds: `--px-title: -0.08`, `--px-lead: 0.05`, `--px-study: 0.14`,
`--px-col-a: 0.06`, `--px-col-b: -0.04`, `--px-col-c: 0.10`.

Primitives: `.sk-px` (parallax carrier, `--py` set by `useParallax`),
`.sk-swing` (+ `.is-in` from `useArrival`), `.sk-write`, `.sk-heart`
(+ `.is-on`, `.is-thump`).
`sk-wave` (the flute's five breathing bars, off under reduced motion).

Parallax and swing are off under `prefers-reduced-motion: reduce`; parallax
is also off under 768px.

## Story page

The story reads on `.sk-wall--story` (1100px). Extra classes: `.sk-names*` (the ledger of 108 names, CSS columns), `.sk-story-art*` (No. 019 beside the title, `mix-blend-mode: multiply`), `.sk-story-wide` (a full-width slot under a chapter's prose).

`/ganesh-chaturthi` is a page of the same sketchbook, built from the story
building blocks in `components/sketchbook/story/`. Its classes: `.sk-story-*`
(title, kicker, standfirst, chapter, body, prose, aside, photo, closing),
`.sk-facts` (the dashed facts list), `.sk-thread` (the six-knot timeline) and
`.sk-chant` (the closing lines in Marathi, with their gloss).

## Audio

The `<audio>` lives in `lib/flute.tsx` (`FluteProvider`, mounted in the root layout) so playback survives client navigations; `FluteToggle` only reads the context.

The flute in the header loops `public/audio/meditative-flute.webm` (Opus)
with `meditative-flute.m4a` as the AAC fallback. One play/pause button; it
never autoplays.

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

## The mark

`components/sketchbook/Logo.tsx` draws the Ganesha face inline; `app/icon.svg` is the same drawing as a standalone favicon. Classes: `.sk-logo` (size), `.sk-logo-ink` (umber strokes), `.sk-logo-eye`, `.sk-logo-jewel` (turmeric), `.sk-logo-tilak` (sindoor).

## Splash and confetti

`components/sketchbook/Splash.tsx` shows on every load: `sk-draw` (the mark's strokes), `sk-write-on` (the name and the chant), `sk-appear` (eyes, jewel, tilak), then `.sk-splash--leaving` fades the sheet and `components/sketchbook/Confetti.tsx` paints a 3.4s canvas shower in the token colours. Reduced motion: a static card, no confetti. The doodle fields (`.sk-doodles`) overflow their sections on purpose; the page clips horizontally at `.room-sketch`. On the story they use `edges` mode: small marks only, placed outside the section in the page margins. A click or Escape skips the splash; a CSS failsafe (`sk-splash-failsafe`, 6s) hides it even if the script never runs.
