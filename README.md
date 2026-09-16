# Ganapati

One sketchbook of Ganesha artwork, in two pages. Built with Next.js,
TypeScript and Tailwind.

| Route | What it is |
| --- | --- |
| `/` | **The Sketchbook** — the front door and the whole collection: all works pinned into the artist's notebook, with margin notes, parallax and a like heart on every work. The tab icon and the header mark are the same hand-drawn face (`app/icon.svg`, `components/sketchbook/Logo.tsx`). Every load opens with a short splash that draws the mark, writes the name and the chant, and lifts away into a shower of marigolds; the flute in the header keeps playing across pages because its audio lives in the root layout. |
| `/ganesh-chaturthi` | **The Story** — five short pages in the same sketchbook: why he comes home, how the festival travelled, Lalbaugcha Raja, the hundred and eight names and why 108, and visarjan. One photograph, credited. |

The sketchbook shows what Bappa looks like to us. The story explains why he
means so much to us. Both are rendered from one dataset — there is no
per-image markup anywhere.

```bash
npm install
npm run images   # prepare the artwork (only when images change)
npm run dev
```

## Adding or replacing artwork

1. Drop the image files into `originals/`. Any size, any aspect ratio — portrait
   and square both hang correctly, and nothing is cropped.
2. Run `npm run images`. This writes web-ready copies to `public/images/` as
   `ganesha-001.avif`, `ganesha-002.avif`, … and regenerates `data/plates.json`
   with each file's real dimensions and a blur placeholder.
3. Describe the new work in `data/catalogue.ts`, matching its `id`:

```ts
{
  id: 12,
  title: "The Water Pot",
  posture: "Sitting",      // Sitting | Standing | Dancing | Ceremonial | Meditative | Overflow
  material: "Wood",        // Natural Clay | Shadu | Terracotta | Bronze | Stone | Wood | Gold Leaf
  trunk: "Right",          // Upward | Left | Right | S-shaped | Geometric | Flowing
  palette: "Teal & Tan",
  mouse: true,
  offerings: ["Kalash", "Lotus"],
}
```

A file in `originals/` with no catalogue entry still appears — it just shows as
*Untitled* until it is described. The six parts and their counts are derived
from the data, so the contents line and the chapter dividers update themselves.
A part with nothing in it never renders.

Ordering is stable: `generation-1.jpg` first, then the numbered exports in order,
then anything else. Changing that order is a matter of editing `sortKey()` in
`scripts/prepare-images.mjs`.

## How it fits together

| Path | Role |
| --- | --- |
| `originals/` | Untouched source files. Not served. |
| `scripts/prepare-images.mjs` | Resizes to 1500px, encodes AVIF, writes `public/images/` + `data/plates.json`. |
| `data/catalogue.ts` | The curated record for each work. The file to edit. |
| `data/plates.json` | Generated. Paths, dimensions, blur placeholders. |
| `lib/collection.ts` | Merges the two, groups the six chapters, counts the facets. |
| `data/photographs.ts` | Photographs for the story page, and your own overrides. |
| `data/photographs.generated.json` | Generated. Image credits and licences from Wikimedia Commons. |
| `data/timeline.ts` | The longer reference history of the festival, kept for future use; the story's six moments are written in `data/story.ts`. |
| `lib/format.ts` | Shared formatting: catalogue numbers, the posture/material/trunk description. |
| `components/sketchbook/` | The sketchbook homepage and the story page: pinned works, chapter pages, the viewer, hand nav, the toran, and the story's building blocks in `components/sketchbook/story/`. |
| `data/names.ts` | The hundred and eight names with a short gloss each, for the story's fourth page. |
| `data/story.ts` | The story page's copy: chapters, facts, moments, chant and closing lines. |

## Likes

Every work on the homepage has a like heart. Counts live in Upstash Redis:
add "Upstash Redis" to the Vercel project from the Marketplace and the two
variables in `.env.example` are injected for you. With them unset (locally),
counts are kept in memory and reset when the dev server restarts. The API is
two calls, documented in `docs/design-system.md`. Design tokens for every
room of the site are in the same file.

## Notes on the catalogue

`material` records the surface a work *evokes* — terracotta ochres, shadu
whites, bronze, stone, wood, gold leaf — rather than claiming a physical
substance. Everything else (posture, trunk direction, the mouse, the offerings)
was read from the artwork itself.

## Interaction

The homepage is a sketchbook: 108 works pinned into drifting columns across six
chapters, each with a hand-written margin note and a like heart. The desk at
the top holds three studies and a lead plate, drawn from the same data as
everything below it — set which plate leads by changing `LEAD_ID` in
`lib/collection.ts`. Clicking any pinned work opens the sketch viewer. `←` /
`→` move through the collection, `Esc` closes, a download link sits alongside
the plate, and on touch devices a horizontal swipe navigates. The viewer walks
the whole collection in hanging order. A flute toggle in the corner plays
ambient sound, and everything with motion (the drift, the parallax, the
viewer's transitions) is disabled under reduced motion.

## The story page

The story is a page of the sketchbook, in four short chapters: why he comes
home, how the festival travelled, Lalbaugcha Raja, and visarjan. Its copy
lives in `data/story.ts`, and the six timeline moments that run through
chapter two live there too, in `data/story.ts`; `data/timeline.ts` is kept
as the fuller reference.

### House style

Warm, plain and affectionate. No em dashes anywhere in the copy: use commas,
colons or a second sentence instead. Nothing about the festival or its people
is written with an edge; where a fact is plain it is stated plainly, and where
something belongs to devotional tradition it is introduced gently ("as the
community has always told it", "in the best known telling") rather than with a
disclaimer.

### Sources

The history was checked against these before it was written:

- [Ganesh Chaturthi](https://en.wikipedia.org/wiki/Ganesh_Chaturthi) for the
  festival's dates and duration, public celebration under Shivaji and the
  Peshwas, the loss of state patronage under British rule, Khasgiwale and Bhau
  Rangari in 1892, Tilak and *Kesari* from 1893, and the rituals of
  pranapratishtha, shodashopachara, uttarpuja and visarjan.
- [Lalbaugcha Raja](https://en.wikipedia.org/wiki/Lalbaugcha_Raja) for the 1932
  closure of the Peru Chawl market, the navas, Rajabai Tayyabali's dedication of
  the plot, the installation on 12 September 1934, the Kambli family from 1935,
  and the Navsachi and Mukh Darshan lines.
- [Hindu American Foundation](https://www.hinduamerican.org/all-about-ganesh-chaturthi)
  for pranapratishtha and the sixteen step shodashopachara.

Two things are deliberately left as tradition rather than asserted as record:
the navas at Lalbaug, which is the community's own account, and the popular
association of the chant "Ganpati Bappa Morya" with the saint Morya Gosavi,
whose dates scholars place anywhere between the 13th and 17th centuries.

## Holding works out of the collection

`data/excluded.ts` lists works kept out of the collection. Exclusion is by **id**,
never by removing the file, because `prepare-images.mjs` numbers from the full
sorted list of `originals/`. Deleting a file would renumber everything after it
and silently attach the wrong catalogue entry to the wrong picture.

```ts
{ id: 41, reason: "extra-feet", note: "Four feet and four ankles." }
```

Running `npm run images` then does three things: skips that work, copies its
original into `review/extra-feet/` at full quality, and writes
`review/MANIFEST.txt`. Delete the line and re-run to bring a work back.

The same file also holds `moreThanFourArms`, a list that is **copied for review
but not excluded**. Multi-armed Ganesha is canonical rather than broken:
Heramba Ganapati has ten arms, Mahaganapati ten, and six and eight armed forms
are standard iconography. To drop any of them, move the id into `excluded`.

Counts are never hardcoded. The desk, the nav, the chapter heads, the story
door and the page metadata all derive from the data, so holding a work out
updates every number on the site.

`review/` holds full-size originals and should not be committed or deployed.

## Images

Everything served is AVIF. Sources are encoded once by the two scripts, and
`next.config.ts` sets `formats: ["image/avif", "image/webp"]` so the optimizer
serves AVIF where the browser accepts it and falls back to WebP where it does
not.

| | JPEG | AVIF |
| --- | --- | --- |
| `public/images` (108 plates) | 27 MB | 11 MB |
| `public/photographs` (10) | 4.8 MB | 2.6 MB |

Two things stay JPEG on purpose:

- **Blur placeholders.** Each is a 14px data URI inlined into the page, and JPEG
  decodes everywhere without a format negotiation.
- **`originals/`.** The untouched source exports, which are never served.

`data/plates.json` keeps an `origin` field recording the original filename, so
each plate can still be traced back to the file it came from.
