# Sketchbook Story Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/ganesh-chaturthi` as a page of the sketchbook (about 900 words, four chapters, one photograph) and hang a marigold toran across the top of both pages.

**Architecture:** A shared `Toran` SVG component sits at the top of the homepage and the story. The story is a server page composing small sketchbook components (chapter, facts list, timeline thread, photo, chant, closing) fed by one copy file, `data/story.ts`, and reusing the homepage's tokens, `HandNav`, `DoodleField`, `useArrival` and `useParallax`. The old story components and the old site header and footer are deleted.

**Tech Stack:** Next.js 16.3.5 (App Router), React 19, TypeScript 5, Tailwind CSS 4 (`@theme`), Node 24 test runner. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-15-sketchbook-story-design.md`

## Global Constraints

- Next.js in this repo is **16.3.5**; read `node_modules/next/dist/docs/01-app/` for anything unfamiliar. `GET` route handlers and pages are dynamic/static as Next decides; do not add `export const dynamic`.
- **No new runtime dependencies.** `package.json` `dependencies` stays `next`, `react`, `react-dom`.
- **Design system.** Every colour comes from the tokens in `app/globals.css` (`--color-umber`, `--color-terracotta`, `--color-ochre`, `--color-turmeric`, `--color-teal`, `--color-paper-clay`, `--color-mat-clay`, `--color-tape`, `--color-rule-clay`, plus the new `--color-leaf: #8a9a5b`). No other hex literals in components or CSS.
- **Type classes.** Use the existing `sk-hand-display`, `sk-hand-heading`, `sk-hand-subhead`, `sk-hand-note`, `sk-hand-caption`, `sk-hand-small`, `sk-serif-lead`, `sk-serif-body`; handwriting never below 15px.
- **Copy rules.** Handwritten lines lower-case and conversational; prose plain and factual; the catalogue count is never hardcoded. All story copy lives in `data/story.ts`.
- **Photograph credit.** Wherever `/photographs/lalbaugcha-raja.avif` is shown, the `credit` from `data/photographs.ts` (`photo("lalbaugcha-raja")`, today "NatePowell · CC BY-SA 4.0") is shown beside the caption.
- **Motion.** Arrival swing via `useArrival` + `.sk-swing`; parallax via `useParallax` (off under 768px and reduced motion); the toran is static.
- **Accessibility.** `h1` for the page title, `h2` per chapter, `ol` for the timeline; toran and doodles `aria-hidden`.
- **Dev server.** One is running on port 3000 for this directory; Next 16 refuses a second instance, so never start another. Use it for curl and browser checks.
- **Commits.** One per task, imperative subject, ending with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. Stage only the files the task names (plus `git rm` for deletions).

---

## File map

| Path | Responsibility | Task |
| --- | --- | --- |
| `components/sketchbook/Toran.tsx` | The garland SVG | 1 |
| `components/sketchbook/HandNav.tsx` | `current` prop chooses the right-hand link | 1 |
| `components/sketchbook/Sketchbook.tsx` | Renders `Toran`; passes `current="home"` | 1 |
| `components/sketchbook/StoryDoor.tsx` | Photo from `data/photographs`, with credit | 1 |
| `app/globals.css` | `--color-leaf`, `--toran-h`, `.sk-toran*`, nav padding; later `.sk-story-*` | 1, 3 |
| `data/story.ts` | All story copy | 2 |
| `components/sketchbook/story/inline.tsx` | `**bold**` / `==highlight==` inline renderer | 3 |
| `components/sketchbook/story/StoryChapter.tsx` | Chapter head + body (+ optional aside column) | 3 |
| `components/sketchbook/story/FactsList.tsx` | Dashed ruled list | 3 |
| `components/sketchbook/story/TimelineThread.tsx` | Hand-drawn thread with knots | 3 |
| `components/sketchbook/story/StoryPhoto.tsx` | Taped photo, caption, credit, margin note | 3 |
| `components/sketchbook/story/Chant.tsx` | The chant block | 3 |
| `components/sketchbook/story/StoryClosing.tsx` | Closing lines + link home | 3 |
| `components/sketchbook/story/StoryPage.tsx` | Composition | 4 |
| `app/ganesh-chaturthi/page.tsx` | Rewritten to render `StoryPage` | 4 |
| Deleted: `components/story/*`, `components/SiteHeader.tsx`, `components/SiteFooter.tsx` | | 4 |
| `README.md`, `docs/design-system.md` | Story route, toran, leaf token | 4 |

---

### Task 1: The toran on both pages, nav label, photo credit

**Files:**
- Create: `components/sketchbook/Toran.tsx`
- Modify: `components/sketchbook/HandNav.tsx`, `components/sketchbook/Sketchbook.tsx`, `components/sketchbook/StoryDoor.tsx`, `app/globals.css` (one `@theme` line; one block appended)

**Interfaces:**
- Produces: `Toran(): JSX.Element`; `HandNav({ current?: "home" | "story" })`.
- Consumes: `photo(slot)` from `data/photographs.ts` returning `{ src, width, height, alt, caption, credit, blurDataURL? } | undefined`.

- [ ] **Step 1: Leaf token**

In `app/globals.css`, inside the existing `@theme { ... }` block, after `--color-margin-line: ...;` add:

```css
  --color-leaf: #8a9a5b;
```

- [ ] **Step 2: Write `components/sketchbook/Toran.tsx`**

```tsx
/**
 * A string of marigold swags with mango leaves, hung along the top of the
 * page like a toran over a doorway. One repeating swag, 200 units wide; the
 * SVG is scaled by height and sliced on the right, so the swags keep their
 * shape at any width.
 */
export function Toran() {
  return (
    <div className="sk-toran" aria-hidden="true">
      <svg viewBox="0 0 4000 74" preserveAspectRatio="xMinYMin slice" focusable="false">
        <defs>
          <pattern id="sk-toran-swag" x="0" y="0" width="200" height="74" patternUnits="userSpaceOnUse">
            <path className="sk-toran-string" d="M0 6 Q100 62 200 6" />
            <path className="sk-toran-string" d="M0 10 Q100 66 200 10" />
            <circle className="sk-toran-flower" cx="24" cy="15" r="6.5" />
            <circle className="sk-toran-flower sk-toran-flower--s" cx="52" cy="26" r="6.5" />
            <circle className="sk-toran-flower" cx="80" cy="35" r="6.5" />
            <circle className="sk-toran-flower sk-toran-flower--s" cx="100" cy="38" r="7" />
            <circle className="sk-toran-flower" cx="120" cy="35" r="6.5" />
            <circle className="sk-toran-flower sk-toran-flower--s" cx="148" cy="26" r="6.5" />
            <circle className="sk-toran-flower" cx="176" cy="15" r="6.5" />
            <path className="sk-toran-leaf" d="M92 44 c-5 9 5 12 0 24 c-6 -10 -2 -16 0 -24z" />
            <path className="sk-toran-leaf" d="M100 46 c-5 9 5 13 0 26 c-6 -11 -2 -17 0 -26z" />
            <path className="sk-toran-leaf" d="M108 44 c-5 9 5 12 0 24 c-6 -10 -2 -16 0 -24z" />
            <path className="sk-toran-leaf" d="M52 33 c-4 7 4 9 0 18 c-5 -8 -2 -12 0 -18z" />
            <path className="sk-toran-leaf" d="M148 33 c-4 7 4 9 0 18 c-5 -8 -2 -12 0 -18z" />
            <path className="sk-toran-string" d="M196 2 c 3 4, 5 4, 8 0 M198 6 l 0 5" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="4000" height="74" fill="url(#sk-toran-swag)" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: Toran CSS**

Append to `app/globals.css`:

```css
/* --- the toran -------------------------------------------------------------
   A garland along the top edge of every sketchbook page. Static. */

:root { --toran-h: 56px; }
@media (min-width: 768px) { :root { --toran-h: 74px; } }

.room-sketch { position: relative; }

.sk-toran {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: var(--toran-h);
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
}

.sk-toran svg { display: block; width: 100%; height: 100%; }

.sk-toran-string {
  fill: none;
  stroke: var(--color-umber);
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sk-toran-flower {
  fill: var(--color-turmeric);
  fill-opacity: 0.75;
  stroke: var(--color-umber);
  stroke-width: 1.9;
}

.sk-toran-flower--s { fill: var(--color-terracotta); fill-opacity: 0.55; }

.sk-toran-leaf {
  fill: var(--color-leaf);
  fill-opacity: 0.35;
  stroke: var(--color-ochre);
  stroke-width: 1.8;
  stroke-linecap: round;
}

/* the nav sits under the garland */
.sk-nav { padding-top: calc(var(--toran-h) + var(--space-3)); }
```

(The earlier `.sk-nav { padding-block: var(--space-4) 0; }` rule stays; this later rule wins on `padding-top` by source order.)

- [ ] **Step 4: `HandNav` gets a `current` prop**

Replace `components/sketchbook/HandNav.tsx` with:

```tsx
import Link from "next/link";
import { FluteToggle } from "@/components/sketchbook/FluteToggle";

const LINKS = {
  home: { href: "/ganesh-chaturthi", label: "the story" },
  story: { href: "/", label: "← back to the drawings" },
} as const;

/** The nav, written by hand at the top of the page. Not sticky. */
export function HandNav({ current = "home" }: { current?: keyof typeof LINKS }) {
  const link = LINKS[current];
  return (
    <nav className="sk-nav" aria-label="Site">
      <Link href="/" className="sk-nav-brand">
        Ganapati
      </Link>
      <FluteToggle />
      <div className="sk-nav-links">
        <Link href={link.href}>{link.label}</Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Toran on the homepage**

In `components/sketchbook/Sketchbook.tsx`, import `Toran` from `@/components/sketchbook/Toran` and render it as the first child of `<div className="room-sketch">`, before `<div className="sk-wall">`:

```tsx
      <div className="room-sketch">
        <Toran />
        <div className="sk-wall">
          <HandNav current="home" />
```

- [ ] **Step 6: Photo credit on the story door**

Replace `components/sketchbook/StoryDoor.tsx` with:

```tsx
import Image from "next/image";
import Link from "next/link";
import { DoodleField } from "@/components/sketchbook/DoodleField";
import { door } from "@/data/notes";
import { photo } from "@/data/photographs";

/** The way out of the sketchbook and into the story. */
export function StoryDoor() {
  const raja = photo("lalbaugcha-raja");
  if (!raja) return null;

  return (
    <section className="sk-door sk-has-doodles" aria-label="The story">
      <DoodleField seed="door" count={3} />
      <div>
        <div className="sk-door-photo sk-frame">
          <span className="sk-tape" />
          <span className="sk-tape sk-tape--r" />
          <Image
            src={raja.src}
            alt={raja.alt}
            width={raja.width}
            height={raja.height}
            placeholder={raja.blurDataURL ? "blur" : "empty"}
            blurDataURL={raja.blurDataURL}
            sizes="(min-width: 768px) 380px, 92vw"
          />
        </div>
        <p className="sk-door-caption sk-hand-small">
          {door.photoCaption} · {raja.credit}
        </p>
      </div>
      <div>
        <h2 className="sk-door-heading sk-hand-heading">{door.heading}</h2>
        <p className="sk-door-body sk-serif-lead">{door.body}</p>
        <Link href="/ganesh-chaturthi" className="sk-door-link sk-hand-subhead">
          {door.storyLink}
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing; `npm run build` succeeds. `curl -s http://localhost:3000/ | grep -c 'class="sk-toran"'` → 1; `curl -s http://localhost:3000/ | grep -c "CC BY-SA"` → 1. In the browser (if available), at desktop and the 375px preset: the garland spans the full width at the top, the nav sits below it with no overlap, no horizontal scroll.

- [ ] **Step 8: Commit**

```bash
git add components/sketchbook/Toran.tsx components/sketchbook/HandNav.tsx components/sketchbook/Sketchbook.tsx components/sketchbook/StoryDoor.tsx app/globals.css
git commit -m "Hang a marigold toran over the sketchbook; credit the photograph

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: The story copy

**Files:**
- Create: `data/story.ts`

**Interfaces:**
- Produces:
  ```ts
  export type Fact = [key: string, value: string];
  export type Moment = { when: string; title: string; line: string };
  export type StoryChapterCopy = { numeral: string; title: string; tagline: string; paragraphs: string[] };
  export const story: {
    kicker: string; title: [string, string]; standfirst: string;
    chapters: [StoryChapterCopy, StoryChapterCopy, StoryChapterCopy, StoryChapterCopy];
    facts: Fact[]; moments: Moment[];
    photoNote: string; chant: { lines: [string, string]; gloss: string };
    closing: { lines: [string, string]; back: string };
  };
  ```
  Paragraph strings may contain `**bold**` and `==highlight==` markup, rendered by Task 3's `inline.tsx`.

- [ ] **Step 1: Write `data/story.ts`**

```ts
/**
 * Everything written on the story page, in one place. Handwritten lines are
 * lower-case; prose is plain and factual. Inline markup: **bold** and
 * ==highlighted== (rendered by components/sketchbook/story/inline.tsx).
 */

export type Fact = [key: string, value: string];
export type Moment = { when: string; title: string; line: string };
export type StoryChapterCopy = {
  numeral: string;
  title: string;
  tagline: string;
  paragraphs: string[];
};

export const story = {
  kicker: "the story, in four short pages",
  title: ["Why we bring", "him home"] as [string, string],
  standfirst:
    "Once a year, for a few days, the god who removes obstacles comes to stay. This is why, and how it came to be that way.",

  chapters: [
    {
      numeral: "I",
      title: "A guest in the house",
      tagline: "once a year, for a day and a half, or five, or ten",
      paragraphs: [
        "Every year, in the month of Bhadrapada, Lord Ganesha comes home. Ganesh Chaturthi celebrates his birth. It falls on the fourth day of the waxing moon, somewhere between late August and the middle of September.",
        "For the days that follow he is not a distant figure in a temple. He is a ==guest in the house==. Families bring a murti home and give him the best place in it. Some keep him for a day and a half, some for five days, some for the full ten. The length is rarely chosen. It is simply what your family has always done.",
        "He is **Vighnaharta**, the remover of obstacles, and his is the first name spoken at every beginning. He is easy to love: fond of sweets, fond of his small companion the mouse, fond of the people who come to him.",
      ],
    },
    {
      numeral: "II",
      title: "How it travelled",
      tagline: "from home and temple, to the street, to a whole city",
      paragraphs: [
        "Nobody invented Ganesh Chaturthi. The worship is ancient, and even the public celebration is older than the familiar story suggests. What changed, across these years, is how many people it gathered and how far it reached.",
      ],
    },
    {
      numeral: "III",
      title: "Lalbaugcha Raja",
      tagline: "navsacha ganpati, the ganpati of the vow",
      paragraphs: [
        "In the early 1930s, Lalbaug was a working neighbourhood in the truest sense: mill hands, Koli fishermen, hawkers and small traders. In **1932** the market at Peru Chawl was closed, and the people who sold there lost the one thing their living depended on, which was simply a place to stand.",
        "As the community tells it, they turned to Ganesha and made a **navas**, a solemn vow: a permanent place for their market, and an idol in return. The market was built. On **12 September 1934**, in gratitude, they installed him. From **1935** the Kambli family took up the making of the idol, and has shaped him ever since.",
        "Two lines form for his darshan. The **Navsachi** line, for those who come to make a vow or to complete one. And the **Mukh Darshan** line, for those who come simply to see his face. Many wait through the night. They do not call it waiting.",
      ],
    },
    {
      numeral: "IV",
      title: "We bring him home, and we let him go",
      tagline: "clay becomes form, form becomes presence, then returns to the water",
      paragraphs: [
        "The murti is carried home through the traffic, held steady on somebody's lap. Then comes **pranapratishtha**, the invocation: from that moment he is not an image in the room, he is a guest in the house. He is bathed, dressed and garlanded, and offered modak, durva grass and red hibiscus. There is arti in the morning and arti again in the evening. Children tell him things they have not told anyone else.",
        "On the final day there is **uttarpuja**, a last worship. Then the same hands that carried him in carry him out again, to the water. The clay softens and dissolves and becomes the river once more. Nothing is truly lost.",
      ],
    },
  ] as [StoryChapterCopy, StoryChapterCopy, StoryChapterCopy, StoryChapterCopy],

  facts: [
    ["also called", "Vinayaka Chaturthi"],
    ["falls on", "Shukla Chaturthi in Bhadrapada, late August to mid September"],
    ["kept for", "a day and a half, or five, seven or ten days"],
    ["ends with", "visarjan; Anant Chaturdashi for the full ten"],
    ["he brings", "buddhi, siddhi, riddhi"],
  ] as Fact[],

  moments: [
    { when: "long before", title: "An old and deep devotion", line: "Loved and worshipped across India for centuries, in temples and in the daily habit of speaking his name first." },
    { when: "1892", title: "The first sarvajanik Ganeshotsav, in Pune", line: "Bhau Rangari installs the first public Ganesha idol, at his wada in Shalukar Bol." },
    { when: "1893", title: "Lokmanya Tilak takes up the idea", line: "And gives it a purpose: a gathering the whole city could share." },
    { when: "early 1900s", title: "The festival arrives in Bombay's mill neighbourhoods", line: "Girangaon, the village of mills: Lalbaug, Parel, Worli and Byculla. The neighbourhood Ganpati gave newcomers a way to belong." },
    { when: "12 september 1934", title: "Lalbaugcha Raja is installed", line: "The story on the next page." },
    { when: "today", title: "Carried forward with care", line: "Shadu clay returning in place of plaster, gentler colours, and a growing tenderness towards the water he returns to." },
  ] as Moment[],

  photoNote: "the prayer that began it was for a place to work",

  chant: {
    lines: ["Ganpati Bappa Morya,", "pudhchya varshi lavkar ya"] as [string, string],
    gloss: "o beloved Bappa, come again soon, next year. sung out loud by thousands, feet already in the water.",
  },

  closing: {
    lines: ["Every year, we bring him home.", "Every year, we learn to let him go."] as [string, string],
    back: "← back to the drawings",
  },
};
```

- [ ] **Step 2: Verify the word budget**

Run:

```bash
node -e '
const s=require("fs").readFileSync("data/story.ts","utf8");
const words=(s.match(/"([^"\\]|\\.)*"/g)||[]).join(" ").replace(/\*\*|==/g,"").split(/\s+/).filter(w=>/[A-Za-z]/.test(w)).length;
console.log("story words:", words);'
```

Expected: a number between 700 and 1,000. `npx tsc --noEmit` clean.

- [ ] **Step 3: Commit**

```bash
git add data/story.ts
git commit -m "Add the story copy: four short pages

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Story building blocks

**Files:**
- Create: `components/sketchbook/story/inline.tsx`, `StoryChapter.tsx`, `FactsList.tsx`, `TimelineThread.tsx`, `StoryPhoto.tsx`, `Chant.tsx`, `StoryClosing.tsx`
- Modify: `app/globals.css` (append)

**Interfaces:**
- Consumes: `DoodleField({ seed, count })`, `Arrow({ kind })`, `useArrival`, `useParallax`, `photo(slot)`, types from `data/story.ts`.
- Produces:
  ```ts
  export function Inline({ text }: { text: string }): JSX.Element;
  export function StoryChapter({ numeral, title, tagline, paragraphs, aside, children }: { numeral: string; title: string; tagline: string; paragraphs: string[]; aside?: ReactNode; children?: ReactNode }): JSX.Element;
  export function FactsList({ facts }: { facts: Fact[] }): JSX.Element;
  export function TimelineThread({ moments }: { moments: Moment[] }): JSX.Element;
  export function StoryPhoto({ slot, note }: { slot: string; note: string }): JSX.Element | null;
  export function Chant({ lines, gloss }: { lines: [string, string]; gloss: string }): JSX.Element;
  export function StoryClosing({ lines, back }: { lines: [string, string]; back: string }): JSX.Element;
  ```

- [ ] **Step 1: `components/sketchbook/story/inline.tsx`**

```tsx
import { Fragment } from "react";

/** Renders **bold** and ==highlight== inside a copy string. Nothing else. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|==[^=]+==)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("==")) return <span key={i} className="sk-hl">{part.slice(2, -2)}</span>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
```

- [ ] **Step 2: `components/sketchbook/story/StoryChapter.tsx`**

```tsx
"use client";

import type { ReactNode } from "react";
import { DoodleField } from "@/components/sketchbook/DoodleField";
import { Inline } from "@/components/sketchbook/story/inline";
import { useArrival } from "@/lib/useArrival";

/**
 * One page of the story: the homepage's chapter head, the prose, and an
 * optional aside column (a facts list or a photograph) from 768px up.
 */
export function StoryChapter({
  numeral,
  title,
  tagline,
  paragraphs,
  aside,
  children,
}: {
  numeral: string;
  title: string;
  tagline: string;
  paragraphs: string[];
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const ref = useArrival<HTMLDivElement>();
  const id = `story-${numeral.toLowerCase()}`;

  return (
    <section id={id} className="sk-story-chapter sk-has-doodles" aria-labelledby={`${id}-title`}>
      <DoodleField seed={id} count={4} />
      <div className="sk-chapter-head">
        <span className="sk-circle">{numeral}</span>
        <h2 id={`${id}-title`} className="sk-hand-heading">
          {title}
        </h2>
      </div>
      <p className="sk-chapter-tag sk-hand-note">{tagline}</p>

      <div ref={ref} className={`sk-story-body sk-swing ${aside ? "sk-story-body--two" : ""}`}>
        <div className="sk-story-prose sk-serif-lead">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>
              <Inline text={paragraph} />
            </p>
          ))}
          {children}
        </div>
        {aside && <div className="sk-story-aside">{aside}</div>}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `components/sketchbook/story/FactsList.tsx`**

```tsx
import type { Fact } from "@/data/story";

/** A dashed, ruled list in the hand, the way facts get jotted in a margin. */
export function FactsList({ facts }: { facts: Fact[] }) {
  return (
    <dl className="sk-facts">
      {facts.map(([key, value]) => (
        <div key={key} className="sk-facts-row">
          <dt className="sk-facts-key">{key}</dt>
          <dd className="sk-facts-value sk-hand-caption">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
```

- [ ] **Step 4: `components/sketchbook/story/TimelineThread.tsx`**

```tsx
import type { Moment } from "@/data/story";

/** Six knots on a hand-drawn thread. */
export function TimelineThread({ moments }: { moments: Moment[] }) {
  return (
    <ol className="sk-thread">
      {moments.map((moment) => (
        <li key={moment.when} className="sk-thread-knot">
          <div className="sk-thread-when">{moment.when}</div>
          <div className="sk-thread-title sk-hand-subhead">{moment.title}</div>
          <p className="sk-thread-line sk-serif-body">{moment.line}</p>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 5: `components/sketchbook/story/StoryPhoto.tsx`**

```tsx
"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { Arrow } from "@/components/sketchbook/doodles";
import { photo } from "@/data/photographs";
import { useParallax } from "@/lib/useParallax";

/** One photograph, taped in beside the prose, with its caption, credit and a note. */
export function StoryPhoto({ slot, note }: { slot: string; note: string }) {
  const ref = useParallax<HTMLDivElement>(0.04);
  const p = photo(slot);
  if (!p) return null;

  return (
    <figure className="sk-story-photo">
      <div ref={ref} className="sk-px" style={{ "--rot": "-2deg" } as CSSProperties}>
        <div className="sk-frame">
          <span className="sk-tape" />
          <span className="sk-tape sk-tape--r" />
          <Image
            src={p.src}
            alt={p.alt}
            width={p.width}
            height={p.height}
            placeholder={p.blurDataURL ? "blur" : "empty"}
            blurDataURL={p.blurDataURL}
            sizes="(min-width: 768px) 340px, 92vw"
          />
        </div>
      </div>
      <figcaption className="sk-story-photo-caption sk-hand-small">
        {p.caption} · {p.credit}
      </figcaption>
      <p className="sk-note sk-note--left sk-hand-note">
        <Arrow kind="hook" />
        <span>{note}</span>
      </p>
    </figure>
  );
}
```

- [ ] **Step 6: `components/sketchbook/story/Chant.tsx` and `StoryClosing.tsx`**

```tsx
/** The farewell, written large, with its meaning underneath. */
export function Chant({ lines, gloss }: { lines: [string, string]; gloss: string }) {
  return (
    <div className="sk-chant">
      <p className="sk-chant-lines sk-hand-heading" lang="mr">
        {lines[0]}
        <br />
        {lines[1]}
      </p>
      <p className="sk-chant-gloss sk-hand-note">{gloss}</p>
    </div>
  );
}
```

```tsx
import Link from "next/link";

/** The last lines, and the way back to the drawings. */
export function StoryClosing({ lines, back }: { lines: [string, string]; back: string }) {
  return (
    <footer className="sk-story-closing">
      <p className="sk-story-closing-lines sk-hand-heading">
        {lines[0]}
        <span>{lines[1]}</span>
      </p>
      <Link href="/" className="sk-story-back sk-hand-subhead">
        {back}
      </Link>
    </footer>
  );
}
```

- [ ] **Step 7: Story CSS**

Append to `app/globals.css`:

```css
/* --- the story page ---------------------------------------------------------
   Four short pages of the same sketchbook. */

.sk-story-title { padding-top: var(--space-8); max-width: 48rem; }
.sk-story-kicker { color: var(--color-ochre); }
.sk-story-title h1 { margin-top: var(--space-3); transform: rotate(-1.5deg); }
.sk-story-title h1 .who { color: var(--color-terracotta); }
.sk-story-standfirst { margin-top: var(--space-5); max-width: 36rem; }

.sk-story-chapter { padding-top: var(--space-9); scroll-margin-top: var(--space-5); }

.sk-story-body { margin-top: var(--space-5); }
.sk-story-prose { max-width: 36rem; color: var(--color-ink); }
.sk-story-prose p + p { margin-top: var(--space-4); }
.sk-story-prose strong { font-weight: 600; }
.sk-story-aside { margin-top: var(--space-6); }

@media (min-width: 768px) {
  .sk-story-body--two {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: var(--space-8);
    align-items: start;
  }
  .sk-story-aside { margin-top: 0; }
}

/* facts: a dashed ruled list */
.sk-facts { margin: 0; max-width: 32rem; }
.sk-facts-row {
  display: flex;
  gap: var(--space-4);
  align-items: baseline;
  padding: var(--space-2) 0;
  border-top: 1px dashed var(--color-rule-clay);
}
.sk-facts-row:last-child { border-bottom: 1px dashed var(--color-rule-clay); }
.sk-facts-key {
  flex: none;
  min-width: 7rem;
  font-family: var(--font-hand);
  font-weight: 700;
  font-size: var(--text-hand-small);
  letter-spacing: 0.02em;
  color: var(--color-terracotta);
}
.sk-facts-value { margin: 0; }

/* timeline: knots on a thread */
.sk-thread {
  position: relative;
  list-style: none;
  margin: var(--space-6) 0 0 var(--space-2);
  padding: 0 0 0 var(--space-7);
  max-width: 40rem;
}
.sk-thread::before {
  content: "";
  position: absolute;
  left: 6px;
  top: 6px;
  bottom: 6px;
  width: var(--frame-stroke);
  background: var(--color-umber);
  border-radius: 2px;
  transform: rotate(0.6deg);
}
.sk-thread-knot { position: relative; padding-bottom: var(--space-5); }
.sk-thread-knot::before {
  content: "";
  position: absolute;
  left: calc(var(--space-7) * -1 + 1px);
  top: 9px;
  width: 10px;
  height: 10px;
  border: var(--frame-stroke) solid var(--color-umber);
  background: var(--color-paper);
  border-radius: var(--radius-hand-circle);
}
.sk-thread-when {
  font-family: var(--font-hand);
  font-weight: 700;
  font-size: var(--text-hand-small);
  letter-spacing: 0.03em;
  color: var(--color-terracotta);
}
.sk-thread-title { margin-top: 2px; }
.sk-thread-line { margin-top: var(--space-1); color: var(--color-ink-soft); max-width: 32rem; }

/* the photograph */
.sk-story-photo { margin: 0; }
.sk-story-photo-caption { text-align: center; color: var(--color-ink-soft); margin-top: var(--space-3); }

/* the chant */
.sk-chant { margin-top: var(--space-7); }
.sk-chant-lines { display: inline-block; transform: rotate(-1.5deg); }
.sk-chant-gloss { margin-top: var(--space-3); color: var(--color-ink-soft); max-width: 32rem; }

/* closing */
.sk-story-closing {
  text-align: center;
  margin-top: var(--space-10);
  padding: var(--space-7) 0 var(--space-9);
  border-top: 2px dashed var(--color-rule-clay);
}
.sk-story-closing-lines span {
  display: block;
  margin-top: var(--space-2);
  font-weight: 500;
  color: var(--color-ink-soft);
  font-size: 0.72em;
}
.sk-story-back {
  display: inline-block;
  margin-top: var(--space-6);
  color: var(--color-teal);
  border-bottom: 2px solid var(--color-teal);
}
```

- [ ] **Step 8: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing. (Nothing renders these yet; Task 4 wires them.)

- [ ] **Step 9: Commit**

```bash
git add components/sketchbook/story app/globals.css
git commit -m "Add the story page's building blocks

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: The story page, the deletions, the docs

**Files:**
- Create: `components/sketchbook/story/StoryPage.tsx`
- Modify: `app/ganesh-chaturthi/page.tsx` (replace entirely), `README.md`, `docs/design-system.md`
- Delete: `components/story/Figure.tsx`, `FormsStrip.tsx`, `Part.tsx`, `PartPoster.tsx`, `Reveal.tsx`, `Section.tsx`, `Timeline.tsx`, `TimelineSpine.tsx`, `components/SiteHeader.tsx`, `components/SiteFooter.tsx`

**Interfaces:**
- Consumes everything Tasks 1–3 produce. `data/timeline.ts` imports `Moment` from `components/story/TimelineSpine` — that import must move: add `export type Moment = { when: string; title: string; body: string; href?: string; portrait?: string }` to the top of `data/timeline.ts` and drop the import, so the data file survives the deletion.

- [ ] **Step 1: `components/sketchbook/story/StoryPage.tsx`**

```tsx
import { DoodleField } from "@/components/sketchbook/DoodleField";
import { HandNav } from "@/components/sketchbook/HandNav";
import { Toran } from "@/components/sketchbook/Toran";
import { Chant } from "@/components/sketchbook/story/Chant";
import { FactsList } from "@/components/sketchbook/story/FactsList";
import { StoryChapter } from "@/components/sketchbook/story/StoryChapter";
import { StoryClosing } from "@/components/sketchbook/story/StoryClosing";
import { StoryPhoto } from "@/components/sketchbook/story/StoryPhoto";
import { TimelineThread } from "@/components/sketchbook/story/TimelineThread";
import { story } from "@/data/story";

/** The story, as four short pages of the sketchbook. */
export function StoryPage() {
  const [one, two, three, four] = story.chapters;

  return (
    <div className="room-sketch">
      <Toran />
      <div className="sk-wall">
        <HandNav current="story" />

        <header className="sk-story-title sk-has-doodles">
          <DoodleField seed="story-title" count={4} />
          <p className="sk-story-kicker sk-hand-note">{story.kicker}</p>
          <h1 className="sk-hand-display">
            {story.title[0]}
            <br />
            {story.title[1].split(" ").slice(0, -1).join(" ")}{" "}
            <span className="who">{story.title[1].split(" ").slice(-1)}</span>
          </h1>
          <p className="sk-story-standfirst sk-serif-lead">{story.standfirst}</p>
        </header>

        <StoryChapter {...one} aside={<FactsList facts={story.facts} />} />

        <StoryChapter {...two}>
          <TimelineThread moments={story.moments} />
        </StoryChapter>

        <StoryChapter {...three} aside={<StoryPhoto slot="lalbaugcha-raja" note={story.photoNote} />} />

        <StoryChapter {...four}>
          <Chant lines={story.chant.lines} gloss={story.chant.gloss} />
        </StoryChapter>

        <StoryClosing lines={story.closing.lines} back={story.closing.back} />
      </div>
    </div>
  );
}
```

Note: `TimelineThread` and `Chant` render inside the prose column (as `children`), after the chapter's paragraphs; `.sk-story-prose` has `max-width: 36rem`, so the thread inherits that width, which is what the mockup showed.

- [ ] **Step 2: Rewrite `app/ganesh-chaturthi/page.tsx`**

```tsx
import type { Metadata } from "next";
import { StoryPage } from "@/components/sketchbook/story/StoryPage";

export const metadata: Metadata = {
  title: "The Story · Why we bring Ganpati home",
  description:
    "The story of Ganesh Chaturthi: its ancient roots, the public Ganeshotsav of Maharashtra, Mumbai's mill neighbourhoods, the beloved Lalbaugcha Raja, and the meaning of visarjan.",
};

/** The story, told in the same sketchbook as the drawings. */
export default function GaneshChaturthi() {
  return <StoryPage />;
}
```

- [ ] **Step 3: Keep `data/timeline.ts` standalone, then delete the old components**

In `data/timeline.ts` replace `import type { Moment } from "@/components/story/TimelineSpine";` with:

```ts
export type Moment = {
  when: string;
  title: string;
  body: string;
  href?: string;
  /** A photograph slot, shown small beside the entry. */
  portrait?: string;
};
```

Then:

```bash
git rm -r components/story
git rm components/SiteHeader.tsx components/SiteFooter.tsx
```

`grep -rn "components/story\|SiteHeader\|SiteFooter" app components lib data` — expected: no output.

- [ ] **Step 4: Docs**

`README.md`: in the route table, make the `/ganesh-chaturthi` row read `| \`/ganesh-chaturthi\` | **The Story** — four short pages in the same sketchbook: why he comes home, how the festival travelled, Lalbaugcha Raja, and visarjan. One photograph, credited. |`. Replace any paragraph that still describes the story as "the dark room" (a darkened room, cream type, brass marks, the timeline spine) with two sentences: the story is a page of the sketchbook, its copy lives in `data/story.ts`, the six timeline moments are drawn from `data/timeline.ts`. Remove the "How it fits together" rows for deleted components if they are listed. Run `grep -n -i "dark room\|TimelineSpine\|SiteHeader\|SiteFooter\|PartPoster" README.md` — expected: no output.

`docs/design-system.md`: add `--color-leaf` (`#8a9a5b`, "mango leaves in the toran") to the colour table; under Shape and depth add a line "`.sk-toran`: the garland along the top of every page, 56px on phones, 74px from 768px, static"; note the story classes `.sk-story-*`, `.sk-facts`, `.sk-thread`, `.sk-chant` under a short "## Story page" heading.

- [ ] **Step 5: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing; `npm run build` succeeds listing `/`, `/api/likes`, `/ganesh-chaturthi`. Against the dev server on port 3000:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/ganesh-chaturthi
curl -s http://localhost:3000/ganesh-chaturthi > /tmp/story.html
grep -c 'class="sk-toran"' /tmp/story.html      # 1
grep -c 'class="sk-story-chapter' /tmp/story.html # 4
grep -c 'sk-thread-knot' /tmp/story.html          # 6
grep -c 'CC BY-SA' /tmp/story.html                # 1
grep -c 'back to the drawings' /tmp/story.html    # 2 (nav + closing)
grep -c 'sk-facts-row' /tmp/story.html            # 5
```

In the browser (if available), at 375, 900 and 1440: toran across the top on both `/` and `/ganesh-chaturthi`, nav below it, four chapters, the photo beside chapter III from 768px and above its text on the phone, the thread with six knots, the chant, the closing link works, no horizontal scroll, no console errors.

- [ ] **Step 6: Commit**

```bash
git add components/sketchbook/story/StoryPage.tsx app/ganesh-chaturthi/page.tsx data/timeline.ts README.md docs/design-system.md
git commit -m "Rebuild the story as four pages of the sketchbook; retire the old story components

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

(The `git rm` deletions from Step 3 are already staged and land in this commit.)

---


### Task 4b: The viewer opens in place, through a portal

User-reported regression: clicking a work scrolls the page to the bottom and only then shows the viewer. Cause: Task 1 appended `.room-sketch { position: relative; }` at the end of `app/globals.css`; `SketchViewer`'s root carries both `sk-viewer` and `room-sketch`, the two single-class rules have equal specificity, and the later one now wins, so the viewer is `position: relative` in normal flow at the end of `.sk-wall`, and `useLightbox`'s `focus()` scrolls to it.

**Files:**
- Modify: `app/globals.css`, `lib/useLightbox.ts`, `components/sketchbook/Sketchbook.tsx`

- [ ] **Step 1: Fix the cascade**

In `app/globals.css`, delete the line `.room-sketch { position: relative; }` from the "the toran" block, and add `position: relative;` as the first declaration inside the ORIGINAL `.room-sketch { ... }` rule (the one that starts around line 411 with the `--color-paper` remaps). `grep -n "^\.room-sketch {" app/globals.css` must show exactly one rule and `grep -c "position: relative; }" app/globals.css` must not match a `.room-sketch` one-liner any more.

- [ ] **Step 2: Focus without scrolling**

In `lib/useLightbox.ts` change `dialogRef.current?.focus();` to `dialogRef.current?.focus({ preventScroll: true });`.

- [ ] **Step 3: Render the viewer through a portal**

In `components/sketchbook/Sketchbook.tsx` add `import { createPortal } from "react-dom";` and replace

```tsx
          {openAt !== null && (
            <SketchViewer works={order} index={openAt} onClose={() => setOpenAt(null)} onMove={setOpenAt} />
          )}
```

with

```tsx
          {openAt !== null &&
            createPortal(
              <SketchViewer works={order} index={openAt} onClose={() => setOpenAt(null)} onMove={setOpenAt} />,
              document.body,
            )}
```

`openAt` is only ever non-null after a click, so `document` exists whenever this branch runs; React context (the likes provider) crosses the portal, so the heart inside the viewer keeps working.

- [ ] **Step 4: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing; `npm run build` succeeds. In the browser on `/` (dev server on port 3000; start one only if nothing listens): scroll to the middle of chapter I, note `window.scrollY`, click a work's frame; via `javascript_tool`: `({ y: window.scrollY, fixed: getComputedStyle(document.querySelector('.sk-viewer')).position, parent: document.querySelector('.sk-viewer').parentElement.tagName })` → `y` unchanged, `fixed: "fixed"`, `parent: "BODY"`. Press Escape: focus returns to the work's button. Like a work inside the viewer: the count changes on the page too. If no Browser tools, say so and rely on `curl` + a `grep -n "createPortal" components/sketchbook/Sketchbook.tsx`.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css lib/useLightbox.ts components/sketchbook/Sketchbook.tsx
git commit -m "Open the viewer in place: fix the cascade, portal to body, focus without scrolling

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Retire the dead CSS and the dark-room layout

After Task 4 nothing uses the lit-gallery or dark-room styles. Remove them, and the story route's stale layout wrapper.

**Files:**
- Delete: `app/ganesh-chaturthi/layout.tsx`
- Modify: `app/globals.css`, `README.md`

- [ ] **Step 1: Delete the layout wrapper**

`git rm app/ganesh-chaturthi/layout.tsx`. The route inherits the root layout; `StoryPage` already renders `.room-sketch` itself.

- [ ] **Step 2: Find dead rules**

For every class selector in `app/globals.css`, check whether the class name appears in any `.tsx`/`.ts` file under `app/`, `components/`, `lib/` (as a class string, a template piece, or a `className` fragment). Use:

```bash
grep -o '^\.[a-zA-Z][a-zA-Z0-9_-]*' app/globals.css | sort -u | sed 's/^\.//' | while read c; do
  if ! grep -rq -- "$c" app components lib --include=*.tsx --include=*.ts; then echo "DEAD: $c"; fi
done
```

Classes only toggled at runtime (`is-in`, `is-on`, `is-thump`, `no-scroll`, `sk-frame--b`, `sk-note--right`, `sk-note--left`, `sk-tape--r`, `sk-desk-study--left`, `sk-desk-study--right`, `sk-story-body--two`, `sk-toran-flower--s`, `sk-viewer-arrow--prev`) appear in code as strings too, so the grep finds them; if any of those shows as DEAD, look for it by hand before deleting. Expected DEAD (delete their rules, including any `@media` copies and comments): `u-wall`, `u-label`, `u-display`, `u-numeral`, `plate-mat`, `plate`, `plate-meta`, `reveal`, `viewer`, `viewer-plate`, `rail`, `gallery`, `u-prose`, `u-lead`, `u-ruled`, `u-chant`, `story-anchor`, `room-dark`, `u-display-caps`, `tilt-a`, `tilt-b`. Keep `.no-scroll`, the `viewer-in` and `viewer-plate-in` keyframes (the sketch viewer uses them), and every `sk-*` rule that has a user.

Also remove the now-unused `:root` variables `--header-h` and `--rail-h` (and their `@media` copy) if nothing references them (`grep -rn "header-h\|rail-h" app components lib`).

- [ ] **Step 3: README**

Change the sentence "The desk, the header, the footer, the chapter heads and the page metadata all derive from the data" (around line 154) to "The desk, the nav, the chapter heads, the story door and the page metadata all derive from the data".

- [ ] **Step 4: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing; `npm run build` succeeds. Re-run the dead-class loop: it prints nothing (or only runtime-toggled classes you verified by hand and list in the report). `wc -l app/globals.css` before and after in the report. In the browser (or via curl `grep -c`), `/` and `/ganesh-chaturthi` render as before: 110 works, toran, story chapters 4; no console errors. If Browser tools exist, screenshot both pages at desktop.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css README.md
git commit -m "Retire the lit-gallery and dark-room styles; the story no longer needs its own layout

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

(The `git rm` from Step 1 is already staged and lands in this commit.)

---

## Self-review notes

- **Spec coverage.** Content (T2), title page and chapters (T3, T4), facts list, thread, photo with credit and note, chant, closing (T3), toran on both pages (T1), nav label (T1), story door credit (T1), deletions (T4), docs (T4), motion via `useArrival`/`useParallax`/`DoodleField` (T3), responsive two-column from 768px (T3 CSS), accessibility (h1/h2/ol, aria-hidden toran) (T1, T3, T4), testing commands (T4 step 5).
- **Deviation.** `data/story.ts` carries its own six one-line moments (shortened from `data/timeline.ts`) rather than selecting the long entries at runtime, because the page needs one sentence each; `data/timeline.ts` is kept intact with its own `Moment` type.
- **Type consistency.** `Fact` and `Moment` from `data/story.ts` are what `FactsList` and `TimelineThread` import; `StoryChapter` spreads `StoryChapterCopy` (`numeral, title, tagline, paragraphs`) which matches its props; `HandNav`'s `current` values are `"home" | "story"`.
