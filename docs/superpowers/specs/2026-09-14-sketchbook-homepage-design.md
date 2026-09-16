# Sketchbook homepage — design

Date: 2026-09-14
Status: approved in brainstorm (visual companion); palette and likes added 2026-09-14

## Goal

Replace the redirect at `/` with a real homepage that shows all 108 works of
the collection, in the voice of the artist's own sketchbook: paper grain,
wobbly ink frames, masking tape, handwritten margin notes, and scroll
parallax. The page must feel unique and playful, be mobile responsive, and
sit inside a max-width wrapper on wide screens.

The homepage is the only place the collection lives: `/gallery` and
`/about` are removed (decided 2026-09-14, after the homepage was built).
`/ganesh-chaturthi` keeps its current design, links back to `/`, and will be
revisited separately.

## Non-goals

- Restyling the story route or its shared `SiteHeader` / `SiteFooter`
  beyond repointing their links to `/`.
- Adding animation or scroll libraries. No new runtime dependencies.
- Changing the catalogue data model or the image pipeline.

## Page structure, top to bottom

All sections live inside one wrapper: `max-width: 1440px`, centred, with the
existing `--gutter` padding. A faint red vertical "notebook margin" line runs
down the left of the wrapper on screens 768px and wider; margin notes prefer
to sit near it.

1. **Handwritten nav.** "Ganapati" underlined at the left, and three links at
   the right: the collection (`/gallery`), the story (`/ganesh-chaturthi`),
   about (`/about`). Set in the handwriting face. Sticky is not required.
   On phones the three links wrap under the wordmark.

2. **The desk (hero).** Three parallax layers:
   - Layer 0, slowest: the title, "One hundred / and eight Ganeshas", in the
     handwriting face, very large, rotated about −2°, centred.
   - Layer 1, medium: the lead work (`LEAD_ID`, currently No. 001) in a
     wobbly ink frame with tape at two corners, centred, positioned low
     enough that the full title reads above it.
   - Layer 2, fastest: two side studies (No. 038 and No. 056) taped in at the
     left and right, rotated about −7° and +6°.
   - A small ✦ doodle (desktop only) and a centred line at the bottom:
     "scroll down, I drew all 107 of him ↓" (the count is derived). No
     margin notes on the desk (removed 2026-09-15).
   - Clicking the lead work or either study opens the Viewer at that work.
   - Phone: title, then the lead work, then the two studies peeking in from
     the left and right edges at reduced size; the notes sit under the
     studies. No parallax on phones (see Motion).

3. **A note before you go in.** Two columns on desktop, stacked on phone:
   - Left: heading "A note before you go in" (handwriting) and one short
     paragraph in the existing Cormorant serif at about 21px, describing the
     rules kept across all 108 drawings and that they are sorted into six
     parts by posture. Signed off with a handwritten line.
   - Right: a handwritten contents list, one line per part, numeral, title
     and count in red, each an anchor link to that chapter. Counts derive
     from `chapters` in `lib/collection.ts`; empty parts never render.

4. **Six chapter pages.** One per entry in `chapters`, in order. Each has:
   - A chapter head: the numeral inside a hand-drawn circle, the chapter
     title very large in the handwriting face, and a short handwritten
     tagline ("twenty-one of them, none sitting still"). Taglines are
     written once per posture in a small copy file.
   - Every work in that part, pinned loosely across three drifting columns
     from 768px up (tighter gutters on tablet), and one ragged column on
     phone, in catalogue order. Each work: wobbly ink frame (alternating between two
     border-radius shapes), one or two pieces of tape, a rotation cycling
     through a small set (−3° to +4°), a width cycling through a small set
     so the columns are ragged, and a caption beneath: number in red
     (`No. 061` style via `formatNumber`), title, and on every third work (index % 3 === 0 within the chapter) a
     smaller second line drawn from `describe()` (material, trunk).
   - Margin notes: three to five per chapter, each attached to a specific
     work id, written by me in the artist's voice from the catalogue data
     (mouse, offerings, palette, material, trunk). Notes are stored in one
     file, `data/notes.ts`, as `{ id, text, side }`, so they can be edited
     without touching components. A note renders beneath its work's
     caption, pulled to the left or right with a hand-drawn arrow pointing
     up at the frame, at every width. A note's work id that is not
     in the collection is ignored.
   - Clicking any work opens the existing `Viewer` at that work's index in
     `hangingOrder`, so the visitor can flip through all 108 from the
     homepage.

5. **Doorway to the Story.** A dashed rule, then two columns (stacked on
   phone): a taped photograph (`/photographs/lalbaugcha-raja.avif`) with the
   caption "Lalbaugcha Raja, a photograph, not a drawing", and beside it the
   heading "Why 108? Why him?", one serif paragraph, a handwritten link
   "read the story →" to `/ganesh-chaturthi`, and a quieter line
   "or, how this was catalogued → about" to `/about`.

6. **Sign-off.** A thin rule and one line, left and right: "drawn one hundred
   and eight times, hung once" and "Ganapati Bappa Morya ✦". The existing
   `SiteFooter` is not used on the homepage.

7. **The sketch viewer.** Tapping any work on the homepage opens
   `SketchViewer`, a full-screen sheet in the same hand as the page, not the
   gallery's dark `Viewer`:
   - Ground: the clay paper with grain, dimmed slightly at the edges with a
     soft radial vignette, so the sheet reads as a page pulled out of the
     book.
   - The work sits centred in a wobbly ink frame with tape at two corners,
     as large as fits (`max-height: 72vh`, never cropped).
   - Beneath it, handwritten: `No. 061` in terracotta, the title large, then
     a smaller line from `describe()` and, in the serif, the offerings
     ("Diya" or "No offering shown") and the palette. The like heart sits at
     the end of the title line.
   - Top-left, handwritten: the position in the walk, `2 of 107`. Top-right:
     a hand-drawn download mark (an `<a download>` of the prepared AVIF,
     named `ganapati-no-061-ganesha-061.avif`) and a ✕ scribble button
     labelled "Close".
   - The frame is one fixed box, square, sized from the viewport with room
     left for the top row, caption and arrows (`max(200px, min(92vw,
     100vh - 300px, 720px))`, a little more generous from 768px), with the
     work contained inside it, so the sheet keeps its size while the next
     work loads and narrower drawings show more mat. If a window is shorter
     still, the viewer scrolls rather than clipping the caption.
   - Left and right: hand-drawn arrows as buttons, "Previous" and "Next",
     wrapping around the collection. On phones the arrows sit under the
     caption and a horizontal swipe moves too.
   - Behaviour matches the gallery's viewer: Escape closes, arrow keys move,
     focus moves into the dialog on open and returns on close, body scroll
     is locked. That behaviour is extracted into `lib/useLightbox.ts`
     (keyboard, focus, scroll lock, swipe) so `SketchViewer` does not copy
     it. The gallery's `Viewer.tsx` is left as it is for now and will adopt
     the hook when the gallery is restyled.
   - It opens with a short fade and the frame settling in (same swing
     easing); reduced motion gets a plain fade.

8. **Festival doodles.** Behind every section, a scatter of small line
   drawings in the note ink at about 35% opacity: lotus, modak, mouse,
   marigold, marigold garland, diya, durva. "Medium" density, chosen in the
   brainstorm: about six behind the desk, three behind the intro and the
   door, and roughly one per two-and-a-half works behind each chapter
   (clamped to 4–12). Drawn as inline SVG in `doodles.tsx`, never image
   files. Placement is deterministic (seeded from the section's id) so it
   is stable between visits, biased to the margins and gutters, and always
   beneath the works (the mats are opaque). The layer drifts a touch slower
   than the page (`--px-doodle: -0.03`). On phones half of them are hidden
   and the rest are smaller; under reduced motion they are static.

9. **The flute.** One button in the homepage header plays a looping
   meditative flute track on request: "play the flute" / "pause the flute"
   with a small bansuri doodle and a five-bar waveform that is always
   visible, still while paused and breathing while playing. No mute
   control. It never autoplays. Files: `public/audio/meditative-flute.webm`
   (Opus) and `.m4a` (AAC fallback).

## Visual language

- **Colour.** The "Clay & Sindoor" palette chosen in the brainstorm; see the
  Design system section for the exact tokens. Ink is burnt umber, never
  black. Numbers and underlines are terracotta, margin notes are ochre, the
  highlighter is turmeric, links are teal, on warm shadu-clay paper with a
  subtle SVG turbulence grain (opacity about 0.07) tiled at 160px.
- **Type.** Caveat (weights 400–700) via `next/font/google`, exposed as
  `--font-hand`. Body paragraphs use the existing Cormorant Garamond. No
  Archivo on this page.
- **Wobbly frame.** `border: 2px solid ink`, the hand-drawn
  `border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px` (and a
  mirrored variant), white mat padding, and a hard offset shadow
  `4px 5px 0 ink`. Tape is a pseudo-element or small div rotated −8° / +9°.
- **Arrows and doodles.** Inline SVG paths with round caps, three or four
  arrow variants, plus a ✦ and a small modak doodle used sparingly.
- **Images.** `next/image` with the existing width, height and
  `blurDataURL`. The two hero works and the lead are `priority`; everything
  else lazy. `sizes` reflects the column layout so the browser fetches
  sensible widths.

## Design system

A proper token set, defined once in `app/globals.css` and documented in
`docs/design-system.md`, so every route can draw on it. The sketchbook
tokens are registered in Tailwind's `@theme` (so utilities such as
`text-sindoor` and `bg-paper-clay` exist) and applied on the homepage
through a `.room-sketch` scope that remaps the generic roles (`--color-paper`,
`--color-ink`, and so on) the other rooms already use. Existing routes keep
their current values untouched.

**Colour roles** (Clay & Sindoor):

| Role | Token | Value | Used for |
| --- | --- | --- | --- |
| paper | `--color-paper-clay` | `#f4ead8` | page ground |
| mat | `--color-mat-clay` | `#fffaf2` | inside the frames |
| ink | `--color-umber` | `#3b2a20` | headings, frames, body ink |
| soft | `--color-umber-soft` | `#7a6656` | secondary text |
| faint | `--color-umber-faint` | `#a08f7c` | hints, rules, tertiary text |
| accent | `--color-terracotta` | `#b8532f` | numbers, underlines, active nav |
| note | `--color-ochre` | `#8a5a1c` | margin notes and arrows |
| highlight | `--color-turmeric` | `#f0c75e` | highlighter behind a word |
| link | `--color-teal` | `#2a7f86` | links, focus ring |
| like | `--color-sindoor` | `#c9453a` | the liked heart |
| tape | `--color-tape` | `rgba(200,160,110,.55)` | masking tape |
| rule | `--color-rule-clay` | `rgba(59,42,32,.2)` | thin rules |
| margin | `--color-margin-line` | `rgba(184,83,47,.4)` | the notebook margin |

Contrast: ink on paper 11.9:1, soft on paper 5.1:1, terracotta on paper
4.6:1, ochre on paper 5.6:1, teal on paper 4.7:1. Faint is decorative only.

**Type scale** (all `clamp`ed for phone to desktop):

| Token | Face | Size | Used for |
| --- | --- | --- | --- |
| `--text-hand-display` | Caveat 700 | 3rem → 7.5rem | hero title |
| `--text-hand-heading` | Caveat 700 | 2.25rem → 4rem | chapter titles |
| `--text-hand-subhead` | Caveat 600 | 1.5rem → 1.875rem | section headings, contents |
| `--text-hand-note` | Caveat 500 | 1.25rem → 1.375rem | margin notes, nav |
| `--text-hand-caption` | Caveat 500 | 1.1875rem | work captions |
| `--text-hand-small` | Caveat 500 | 0.9375rem | caption second line |
| `--text-serif-lead` | Cormorant 300 | 1.25rem → 1.375rem | intro and story paragraphs |
| `--text-serif-body` | Cormorant 400 | 1.125rem | any longer prose |

**Space**: `--space-1` to `--space-10` on a 4px base: 4, 8, 12, 16, 24, 32,
48, 64, 96, 144px. Section gaps use `--space-9` on desktop and `--space-7`
on phone. The existing `--gutter` stays as the page gutter; `--wall-sketch`
is the 1440px wrapper.

**Shape**: `--radius-wobble-a: 255px 15px 225px 15px / 15px 225px 15px 255px`,
`--radius-wobble-b` (its mirror), `--radius-hand-circle: 50% 48% 52% 50% /
48% 52% 48% 52%`, `--frame-stroke: 2px`, `--tape-size: 56px × 16px`.

**Depth**: `--shadow-ink-sm: 3px 4px 0 var(--color-umber)`,
`--shadow-ink: 4px 5px 0 var(--color-umber)`.

**Motion**: `--ease-gallery` (existing), `--ease-swing:
cubic-bezier(0.34, 1.4, 0.64, 1)`, `--dur-swing: 900ms`, `--dur-write:
600ms`, `--dur-like: 350ms`, and the parallax speeds as named tokens
`--px-title: -0.08`, `--px-lead: 0.05`, `--px-study: 0.14`, `--px-col-a:
0.06`, `--px-col-b: -0.04`, `--px-col-c: 0.10`.

## Likes

Every work carries a like button, so the collection can learn which
drawings people love. Counts live in Upstash Redis, added to the Vercel
project from the Vercel Marketplace; locally the site runs on an in-memory
store, so nothing has to be provisioned to develop.

- **Button.** A hand-drawn heart (inline SVG, ink stroke) with the count
  beside it in the handwriting face, sitting at the right end of each
  caption. Unliked: outlined heart, count in faint. Liked: heart filled
  sindoor, a quick "thump" scale animation (`--dur-like`), count in ink.
  Clicking toggles; it does not open the Viewer (the heart is its own
  `button` outside the work's button). `aria-pressed` reflects the state,
  label "Like No. 061" / "Unlike No. 061".
- **One like per visitor.** Liked ids are kept in `localStorage` under
  `ganapati:liked`. A second click unlikes and decrements.
- **Client store.** `lib/likes.tsx` exposes `LikesProvider` and `useLikes()`
  returning `{ counts, liked, toggle(id) }`. On mount it fetches
  `GET /api/likes` for the counts map and reads liked ids from storage.
  `toggle` updates the UI optimistically, then `POST /api/likes` with
  `{ id, delta: 1 | -1 }`; on failure it reverts. Counts are held in one
  React context provided by `Sketchbook`, so 108 buttons share one fetch.
- **API.** `app/api/likes/route.ts` handles `GET` (returns
  `{ counts: Record<number, number> }`) and `POST` (validates `id` is a
  known work id and `delta` is 1 or -1, returns `{ id, count }`; anything
  else is a 400). Marked `force-dynamic` so counts are never cached.
- **Server store.** `lib/likes-store.ts` defines
  `interface LikesStore { all(): Promise<Record<number, number>>;
  bump(id: number, delta: 1 | -1): Promise<number> }` and two
  implementations:
  - `MemoryStore`: a module-level `Map`, never below zero. Used when the
    Upstash variables are absent (local dev, tests).
  - `UpstashStore`: talks to the Upstash REST API with plain `fetch`, no
    package. One hash `likes`, field per work id. `all()` is `HGETALL likes`;
    `bump()` is `HINCRBY likes <id> <delta>`, followed by a clamp to zero if
    the result is negative (`HSET likes <id> 0`). Reads
    `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, the names the
    Vercel integration injects. Requests use the bearer token and
    `cache: "no-store"`.
  - `getStore()` picks one at first call from the environment.
- **Ops.** Add Upstash Redis to the Vercel project from the Marketplace
  before or after the first deploy; no code change is needed. `.env.example`
  lists the two variable names. Rate limiting is out of scope; ids are
  validated so nothing outside the collection is ever stored.

## Motion

- **Parallax.** A small hook, `useParallax(speed)`, that on scroll (through
  `requestAnimationFrame`, one listener shared across elements) sets a CSS
  variable `--py` on the element from its distance to the viewport centre
  multiplied by `speed`. Elements combine it as
  `transform: rotate(var(--rot)) translateY(var(--py))`. Speeds: hero title
  −0.08, lead 0.05, studies 0.12–0.16; in the chapters every work carries
  its column's speed (0.06, −0.04, 0.10), so offsets stay within about
  ±70px and the columns still read as drifting. Whole columns are never
  parallaxed: at 4000px tall they would shift by hundreds of pixels.
- **Arrival.** Works use the existing `useArrival` and `.reveal` pattern,
  extended with a "swing in": start at a slightly larger rotation and
  translate, settle to rest over about 900ms with the gallery easing.
  Captions reveal with a left-to-right `clip-path` over about 600ms after
  the frame settles, so they read as being written on.
- **Reduced motion and phones.** With `prefers-reduced-motion: reduce`, and
  on viewports under 768px, parallax is off (`--py: 0`) and arrival is a
  plain fade. Rotations stay; they are static.

## Components and files

| Path | Role |
| --- | --- |
| `app/page.tsx` | The homepage. Server component; loads `chapters`, `hangingOrder`, `LEAD_ID`, renders `Sketchbook`. Metadata title "Ganapati". |
| `components/sketchbook/Sketchbook.tsx` | Client component owning `openAt` state and the `Viewer`, composing the sections below. |
| `components/sketchbook/HandNav.tsx` | Handwritten nav. |
| `components/sketchbook/Desk.tsx` | Hero with the three parallax layers and notes. |
| `components/sketchbook/IntroNote.tsx` | The note and the contents list. |
| `components/sketchbook/ChapterPage.tsx` | One chapter: head, column layout, works, margin notes. |
| `components/sketchbook/PinnedWork.tsx` | One work in a wobbly frame with tape, caption and swing-in. |
| `components/sketchbook/MarginNote.tsx` | A note with an optional arrow variant. |
| `components/sketchbook/StoryDoor.tsx` | Doorway to the Story and About. |
| `components/sketchbook/SignOff.tsx` | The footer line. |
| `components/sketchbook/SketchViewer.tsx` | Full-screen sketchbook viewer with like heart. |
| `lib/useLightbox.ts` | Keyboard, focus, scroll lock and swipe for a full-screen dialog. |
| `components/sketchbook/doodles.tsx` | Arrow, heart, close, star and the seven festival doodle SVGs. |
| `components/sketchbook/DoodleField.tsx` | Seeded scatter of festival doodles behind a section. |
| `components/sketchbook/LikeButton.tsx` | The heart, count and thump animation. |
| `lib/likes.tsx` | `LikesProvider`, `useLikes()`, localStorage of liked ids, optimistic toggle. |
| `lib/likes-store.ts` | Server-side store interface, `MemoryStore`, `UpstashStore`. |
| `app/api/likes/route.ts` | `GET` counts, `POST` toggle. |
| `docs/design-system.md` | Token reference and the Likes API. |
| `.env.example` | The two Upstash variable names. |
| `lib/useParallax.ts` | The parallax hook and its shared scroll loop. |
| `data/notes.ts` | Margin notes `{ id, text, side }` and per-posture chapter taglines. |
| `app/globals.css` | `.room-sketch` tokens, paper grain, wobbly frame, tape, swing-in and caption-write keyframes. |
| `app/layout.tsx` | Adds the Caveat font variable. |

`Plate.tsx`, `Gallery.tsx`, `Masthead.tsx`, `SiteHeader.tsx`, `Viewer.tsx`
and the gallery route are not modified. `Sketchbook` opens `SketchViewer`,
never `Viewer`. `formatNumber` and `describe` are
imported from `Plate.tsx`.

## Responsive rules

| Width | Columns | Hero | Parallax |
| --- | --- | --- | --- |
| < 768px | 1 | stacked, studies peek from edges | off |
| 768–1179px | 3, tighter gutters | as desktop, smaller title | on |
| ≥ 1180px | 3 | as designed | on |

The wrapper is `max-width: 1440px`; the margin line is hidden under 768px.
Nothing scrolls horizontally; frames and notes never exceed the wrapper.

## Accessibility

- Every work is a `button` with an `aria-label` of "Open No. 061, Dance by
  the Diya", as in `Plate.tsx`.
- The handwriting face is used at 18px or larger for anything that must be
  read; captions' second line is the smallest at about 15px.
- Focus rings follow the existing `:focus-visible` rule.
- Colour contrast of ink on paper exceeds 12:1; red numbers on paper exceed
  4.5:1.

## Testing

- `npm run build` passes, and `npx tsc --noEmit` is clean.
- Unit tests run with Node's built-in runner (`node --test`, Node 24 strips
  types natively) via a new `npm test` script; no test framework is added.
- Visual check in the browser at 375px, 900px and 1440px widths: all six
  chapters render, work count on the page equals `total`, no horizontal
  scroll, parallax moves on desktop and is off on the phone width.
- Clicking a work in the hero and in a chapter opens `SketchViewer` at the
  right index; arrow keys move, Escape closes, focus returns to the work.
  The heart inside the viewer and the heart under the same work on the page
  show the same count and state.
- With reduced motion emulated, elements do not translate on scroll.
- Likes: unit tests for `likes-store.ts` (`MemoryStore` increments,
  decrements, never goes below zero; `UpstashStore` builds the right REST
  calls against a stubbed `fetch`) and for the route handler's validation. In the browser: clicking a heart fills it and
  increments, clicking again reverts, a reload keeps the liked state from
  storage, and the count comes back from the API.

## Open items

None. Copy for the intro paragraph, taglines and margin notes is written
by me and lives in `data/notes.ts` and the components for later editing.
