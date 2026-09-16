# Sketchbook story page — design

Date: 2026-09-15
Status: approved in brainstorm (visual companion); pending written review

## Goal

Rebuild `/ganesh-chaturthi` as a page of the same sketchbook as the homepage:
clay paper, umber ink, handwritten heads, one taped photograph, festival
doodles, and a marigold toran hung along the top. Cut the copy from about
2,600 words to about 900, keeping only what is documented or genuinely
explains the festival. Hang the same toran on the homepage so the two pages
read as one book.

## Non-goals

- Changing the homepage beyond adding the toran, the nav label, and a
  photo credit on the story door.
- New photographs. Only the Lalbaugcha Raja photograph is used.
- Restyling `/api/likes` or any data model.

## Content

All copy lives in `data/story.ts` so it can be edited without touching
components. Handwritten lines are lower-case and conversational; prose is
plain and factual. The catalogue count is never hardcoded.

**Title page.** Margin line "the story, in four short pages". Title "Why we
bring him home" ("home" in terracotta). Standfirst: "Once a year, for a few
days, the god who removes obstacles comes to stay. This is why, and how it
came to be that way."

**I · A guest in the house.** Tagline "once a year, for a day and a half, or
five, or ten". Three paragraphs (about 150 words): Bhadrapada, the fourth day
of the waxing moon, late August to mid September; a guest in the house for a
day and a half, five or ten days, the length handed down; Vighnaharta, first
name spoken, easy to love (sweets, the mouse). Beside it a facts list:

| key | value |
| --- | --- |
| also called | Vinayaka Chaturthi |
| falls on | Shukla Chaturthi in Bhadrapada, late August to mid September |
| kept for | a day and a half, or five, seven or ten days |
| ends with | visarjan; Anant Chaturdashi for the full ten |
| he brings | buddhi, siddhi, riddhi |

**II · How it travelled.** Tagline "from home and temple, to the street, to
a whole city". One paragraph: nobody invented the festival; the worship is
ancient; what changed is how many people it gathered. Then six moments, each
a date, a one-line title and one sentence, taken from the existing
`data/timeline.ts` entries (which are sourced from documented history):
Long before · 1892 · 1893 · Early 1900s · 12 September 1934 · Today. The
other five entries are dropped from the page but the file keeps them.

**III · Lalbaugcha Raja.** Tagline "navsacha ganpati, the ganpati of the
vow". Three paragraphs (about 180 words): 1932 market closure at Peru Chawl;
the navas and the market rebuilt; installation on 12 September 1934; the
Kambli family from 1935; the Navsachi and Mukh Darshan lines. Beside it the
photograph, taped, with the caption "Lalbaugcha Raja" and the credit line
from `data/photographs` (Wikimedia Commons author and licence), and one
margin note: "the prayer that began it was for a place to work".

**IV · We bring him home, and we let him go.** Tagline "clay becomes form,
form becomes presence, then returns to the water". Two paragraphs (about 200
words): carried home, pranapratishtha, offerings (modak, durva, hibiscus),
morning and evening arti, children's confidences; uttarpuja, the water, the
clay dissolving, nothing lost. Then the chant, large: "Ganpati Bappa Morya,
pudhchya varshi lavkar ya", with the line beneath "o beloved Bappa, come
again soon, next year. sung out loud by thousands, feet already in the
water."

**Closing.** "Every year, we bring him home." / "Every year, we learn to let
him go." and a handwritten link "← back to the drawings" to `/`.

Dropped: the darshan "reasons" list, the pull quotes, the "festival today"
section (one line on shadu clay survives inside the Today moment), the strip
of drawings, the poster images per part, and the sticky timeline spine.

## Page structure

1. **Toran** (see below), full width, at the very top.
2. **Hand nav**, the homepage's `HandNav`, with the right-hand link reading
   "← back to the drawings" (to `/`) instead of "the story".
3. **Title page**: margin line, title, standfirst. Doodle field behind.
4. **Four chapters**, each: chapter head in the homepage's style (circled
   numeral, `sk-hand-heading` title, `sk-hand-note` tagline), then the
   chapter's body. Chapters I and III are two columns from 768px (prose left,
   facts list or photo right, 340px column); II and IV are single column.
   Each chapter has its own doodle field.
5. **Closing** block, centred, with a dashed rule above.
6. No footer. `SiteHeader` and `SiteFooter` are no longer used anywhere and
   are deleted, together with every `components/story/*` file.

Wrapper, gutters, margin line, tokens, type scale and grain are the
homepage's (`.room-sketch`, `.sk-wall`, `sk-hand-*`, `sk-serif-*`).

## The toran

A shared `Toran` component rendered at the top of both pages.

- One inline SVG using a `<pattern>` 200 units wide: two string curves (a
  swag `Q100 62 200 6` and a second slightly below), seven marigolds along
  the string as circles r 6.5–7, five hanging mango leaves (three at the low
  point, one under each shoulder flower), and a knot where swags join.
  `preserveAspectRatio="none"` on a `viewBox="0 0 1200 74"` rect filled with
  the pattern, so it repeats cleanly at any width.
- Coloured treatment (chosen): marigolds alternate a turmeric wash
  (`--color-turmeric`, fill-opacity .75) and a sindoor wash
  (`--color-terracotta`, .55); leaves a muted green `#8a9a5b` at .35 (the one
  new colour, added as `--color-leaf`); strings and outlines in ink at 1.9px.
- 74px tall from 768px, 56px on phones (the SVG scales; the pattern keeps
  its proportions because height is set on the SVG and the viewBox is
  stretched in x only).
- Static, `aria-hidden`, `pointer-events: none`, positioned at the top of
  the `.room-sketch` page above the nav; the nav gets top padding equal to
  the toran height. Never fixed to the viewport.

## Components and files

| Path | Role |
| --- | --- |
| `data/story.ts` | All story copy: title, standfirst, chapters (tagline, paragraphs), facts, the six moment keys, chant, closing. |
| `data/timeline.ts` | Unchanged; `data/story.ts` selects six entries by `when`. |
| `components/sketchbook/Toran.tsx` | The garland SVG. |
| `components/sketchbook/story/StoryPage.tsx` | Client composition: `room-sketch` + `sk-wall`, nav, title, chapters, closing. |
| `components/sketchbook/story/StoryChapter.tsx` | Chapter head + slot for body; two-column variant. |
| `components/sketchbook/story/FactsList.tsx` | The dashed ruled list. |
| `components/sketchbook/story/TimelineThread.tsx` | The hand-drawn thread with knots. |
| `components/sketchbook/story/StoryPhoto.tsx` | Taped photograph with caption, credit and margin note. |
| `components/sketchbook/story/Chant.tsx` | The chant block. |
| `components/sketchbook/story/StoryClosing.tsx` | Closing lines and the link home. |
| `components/sketchbook/HandNav.tsx` | Gains a `current: "home" \| "story"` prop that decides the right-hand link. |
| `components/sketchbook/Sketchbook.tsx` | Renders `Toran` first; passes `current="home"`. |
| `components/sketchbook/StoryDoor.tsx` | Adds the photograph's credit line under its caption. |
| `app/ganesh-chaturthi/page.tsx` | Rewritten: metadata kept, renders `StoryPage`. |
| `app/globals.css` | `--color-leaf`, `.sk-toran`, `.sk-story-*` (title, two-col, ruled list, thread, chant, closing). |
| Deleted | `components/story/*` (8 files), `components/SiteHeader.tsx`, `components/SiteFooter.tsx`. |
| `README.md`, `docs/design-system.md` | Story route description; toran and leaf token. |

## Motion and responsive

- Each chapter body uses the homepage's arrival swing (`useArrival` +
  `.sk-swing`); the photo drifts with `useParallax(0.04)`; doodle fields as
  on the homepage; the toran is static.
- Under 768px: single column everywhere, photo above its text, toran 56px,
  type scale as the homepage. No horizontal scroll.
- Reduced motion: as the homepage (swing becomes a fade, parallax off).

## Accessibility

- Semantic headings: `h1` title, `h2` per chapter. The timeline is an `ol`.
- Toran and doodles `aria-hidden`. Photo `alt` from `data/photographs`.
- Handwriting never below 15px; serif prose at the lead size.

## Testing

- `npm test` (9), `npx tsc --noEmit`, `npm run build` listing `/`,
  `/api/likes`, `/ganesh-chaturthi`.
- `grep -rn "components/story\|SiteHeader\|SiteFooter" app components lib`
  prints nothing after the deletions.
- Browser at 375, 900 and 1440: toran spans the full width on both pages,
  nav sits below it, the story shows four chapters and one photo with a
  credit, the link home works, no horizontal scroll, no console errors.
- Word count of the story prose (`data/story.ts` strings) between 700 and
  1,000.

## Open items

None.
