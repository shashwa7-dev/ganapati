# Sketchbook Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the site its mark (a hand-drawn Ganesha face as favicon and header logo), an initial-load splash that ends in a burst of marigold confetti, a flute that keeps playing across routes, and doodles that are no longer clipped at section edges.

**Architecture:** The mark is one SVG drawn twice: a standalone `app/icon.svg` (Next's icon file convention) and an inline `Logo` component styled by tokens. The flute's `<audio>` and state move into a `FluteProvider` mounted in the root layout, which Next keeps alive across client navigations; the header button becomes a context consumer. `Splash` and `Confetti` are client components in the root layout: the splash shows once per browser session and hands off to a short canvas confetti burst. The doodle layer switches to visible overflow.

**Tech Stack:** Next.js 16.3.5 (App Router, `app/icon.svg` convention), React 19, TypeScript 5, Tailwind CSS 4 tokens, canvas 2D. No new dependencies.

**Spec:** the user's requests of 2026-09-15 (this plan is the design; approved in chat: mark v4 with the mukut, splash + confetti, flute persistence, unclipped doodles).

## Global Constraints

- No new runtime dependencies.
- Colours in components and CSS come from tokens (`--color-umber`, `--color-terracotta`, `--color-sindoor`, `--color-turmeric`, `--color-leaf`, `--color-paper-clay`, `--color-mat-clay`, `--color-umber-soft`). The only file allowed hex literals is `app/icon.svg`, which is a standalone asset and cannot read CSS variables.
- Nothing autoplays audio; the flute starts only from the button.
- Every animation has a reduced-motion fallback: the splash becomes a short static card and the confetti is skipped.
- The splash must never trap: it leaves after at most 3.2s even if `load` never fires.
- A dev server may be listening on port 3000 (the controller's). Check with `lsof -iTCP:3000 -sTCP:LISTEN`; if none, start `npx next dev -p 3000 > /tmp/ganesh-dev.log 2>&1 &` for checks and stop it after. Never run two.
- One commit per task, ending with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. Stage only the task's files.

---

## File map

| Path | Responsibility | Task |
| --- | --- | --- |
| `components/sketchbook/Logo.tsx` | Inline mark, token-coloured | 1 |
| `app/icon.svg` | Favicon (standalone) | 1 |
| `app/favicon.ico` | Deleted | 1 |
| `components/sketchbook/HandNav.tsx` | Logo before the wordmark | 1 |
| `lib/flute.tsx` | `FluteProvider`, `useFlute` (owns the `<audio>`) | 2 |
| `components/sketchbook/FluteToggle.tsx` | Consumer of the context | 2 |
| `app/layout.tsx` | Wraps children in `FluteProvider`; renders `Splash` | 2, 3 |
| `components/sketchbook/Splash.tsx` | Once-per-session load screen, with the chant | 3 |
| `components/sketchbook/Confetti.tsx` | Canvas burst | 3 |
| `app/globals.css` | `.sk-logo`, `.sk-nav-brand` tweak, `.sk-splash*`, `.sk-confetti`, doodle overflow | 1, 3, 4 |
| `README.md`, `docs/design-system.md` | Mark, splash, flute persistence | 4 |

---

### Task 1: The mark: favicon and header logo

**Files:**
- Create: `components/sketchbook/Logo.tsx`, `app/icon.svg`
- Delete: `app/favicon.ico`
- Modify: `components/sketchbook/HandNav.tsx`, `app/globals.css` (append)

**Interfaces:**
- Produces: `Logo({ className?: string }): JSX.Element` (an inline SVG, `aria-hidden`, sized by CSS; default class `sk-logo`).

- [ ] **Step 1: `app/icon.svg`** (standalone; hex allowed here)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#f4ead8"/>
  <g fill="none" stroke="#3b2a20" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 21 Q32 17 42 21"/>
    <path d="M22 21 L25 11 L29 17 L32 5 L35 17 L39 11 L42 21"/>
    <path d="M22 24 C 22 16, 42 16, 42 24 C 43 34, 39 40, 32 42 C 25 40, 21 34, 22 24 Z"/>
    <path d="M22 27 C 12 23, 8 33, 14 41 C 17 44, 21 42, 22 38"/>
    <path d="M42 27 C 52 23, 56 33, 50 41 C 47 44, 43 42, 42 38"/>
    <path d="M32 42 C 33 48, 31 55, 25 56 C 20 56, 19 50, 24 49"/>
  </g>
  <circle cx="32" cy="5" r="2.2" fill="#f0c75e" stroke="#3b2a20" stroke-width="1.4"/>
  <circle cx="28" cy="30" r="1.9" fill="#3b2a20"/>
  <circle cx="36" cy="30" r="1.9" fill="#3b2a20"/>
  <path d="M32 23 l 0 5" stroke="#c9453a" stroke-width="3.2" stroke-linecap="round"/>
</svg>
```

Then `git rm app/favicon.ico`. (Next serves `app/icon.svg` as the icon automatically and injects the `<link rel="icon">`; see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md`.)

- [ ] **Step 2: `components/sketchbook/Logo.tsx`**

```tsx
/**
 * The mark: a hand-drawn Ganesha face, the same drawing as the favicon,
 * coloured by the tokens so it sits on any sketchbook surface.
 */
export function Logo({ className = "sk-logo" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <g className="sk-logo-ink">
        <path d="M22 21 Q32 17 42 21" />
        <path d="M22 21 L25 11 L29 17 L32 5 L35 17 L39 11 L42 21" />
        <path d="M22 24 C 22 16, 42 16, 42 24 C 43 34, 39 40, 32 42 C 25 40, 21 34, 22 24 Z" />
        <path d="M22 27 C 12 23, 8 33, 14 41 C 17 44, 21 42, 22 38" />
        <path d="M42 27 C 52 23, 56 33, 50 41 C 47 44, 43 42, 42 38" />
        <path d="M32 42 C 33 48, 31 55, 25 56 C 20 56, 19 50, 24 49" />
      </g>
      <circle className="sk-logo-jewel" cx="32" cy="5" r="2.2" />
      <circle className="sk-logo-eye" cx="28" cy="30" r="1.9" />
      <circle className="sk-logo-eye" cx="36" cy="30" r="1.9" />
      <path className="sk-logo-tilak" d="M32 23 l 0 5" />
    </svg>
  );
}
```

- [ ] **Step 3: CSS** (append to `app/globals.css`)

```css
/* --- the mark --------------------------------------------------------------- */

.sk-logo { display: block; width: 34px; height: 34px; flex: none; }
.sk-logo-ink { fill: none; stroke: var(--color-umber); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.sk-logo-jewel { fill: var(--color-turmeric); stroke: var(--color-umber); stroke-width: 1.4; }
.sk-logo-eye { fill: var(--color-umber); }
.sk-logo-tilak { fill: none; stroke: var(--color-sindoor); stroke-width: 3.2; stroke-linecap: round; }

/* the brand is the mark plus the word; only the word is underlined */
.sk-nav-brand { display: inline-flex; align-items: center; gap: var(--space-2); border-bottom: 0; }
.sk-nav-brand span { border-bottom: 2px solid var(--color-terracotta); line-height: 1; }
```

- [ ] **Step 4: `HandNav.tsx`**

Import `Logo` from `@/components/sketchbook/Logo` and change the brand link to:

```tsx
      <Link href="/" className="sk-nav-brand">
        <Logo />
        <span>Ganapati</span>
      </Link>
```

- [ ] **Step 5: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing; `npm run build` succeeds. With the dev server: `curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:3000/icon.svg` → `200 image/svg+xml`; `curl -s http://localhost:3000/ | grep -o '<link rel="icon"[^>]*>'` shows `/icon.svg`; `curl -s http://localhost:3000/ | grep -c 'class="sk-logo"'` → 1, and the same on `/ganesh-chaturthi`. In the browser: the tab shows the face; the header shows the mark before "Ganapati" with the underline under the word only.

- [ ] **Step 6: Commit**

```bash
git add app/icon.svg components/sketchbook/Logo.tsx components/sketchbook/HandNav.tsx app/globals.css
git commit -m "Give the sketchbook its mark: favicon and header logo

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

(`app/favicon.ico` was staged for deletion by `git rm` and lands in this commit.)

---

### Task 2: The flute lives in the root layout

**Files:**
- Create: `lib/flute.tsx`
- Modify: `components/sketchbook/FluteToggle.tsx`, `app/layout.tsx`

**Interfaces:**
- Produces: `FluteProvider({ children })`, `useFlute(): { playing: boolean; toggle: () => void }`.

- [ ] **Step 1: `lib/flute.tsx`**

```tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type FluteContextValue = { playing: boolean; toggle: () => void };

const FluteContext = createContext<FluteContextValue | null>(null);

/**
 * Owns the one <audio> for the whole site. Mounted in the root layout, which
 * Next keeps alive across client navigations, so the track carries on from
 * the drawings to the story and back. Nothing plays until the visitor asks.
 */
export function FluteProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(async () => {
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
  }, []);

  const value = useMemo(() => ({ playing, toggle }), [playing, toggle]);

  return (
    <FluteContext.Provider value={value}>
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
      {children}
    </FluteContext.Provider>
  );
}

export function useFlute(): FluteContextValue {
  const ctx = useContext(FluteContext);
  if (!ctx) throw new Error("useFlute must be used inside <FluteProvider>");
  return ctx;
}
```

- [ ] **Step 2: `FluteToggle.tsx`** — replace the file with:

```tsx
"use client";

import { FluteDoodle } from "@/components/sketchbook/doodles";
import { useFlute } from "@/lib/flute";

/** The header's play/pause button. The waveform is always there; it only moves while the track does. */
export function FluteToggle() {
  const { playing, toggle } = useFlute();

  return (
    <div className="sk-flute" data-playing={playing ? "" : undefined}>
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

- [ ] **Step 3: `app/layout.tsx`**

Import `FluteProvider` from `@/lib/flute` and change the body to:

```tsx
      <body className="min-h-full">
        <FluteProvider>{children}</FluteProvider>
      </body>
```

- [ ] **Step 4: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing; `npm run build` succeeds. `curl -s http://localhost:3000/ | grep -c '<audio'` → 1 and `curl -s http://localhost:3000/ganesh-chaturthi | grep -c '<audio'` → 1 (rendered once by the layout, so a page never has two). In the browser: on `/` click "play the flute", confirm the label flips; click the "the story" link (client navigation); on the story page `document.querySelector('audio').paused` is `false` and the button reads "pause the flute"; click "← back to the drawings"; still playing. Without Browser tools, say so.

- [ ] **Step 5: Commit**

```bash
git add lib/flute.tsx components/sketchbook/FluteToggle.tsx app/layout.tsx
git commit -m "Keep the flute playing across routes: audio lives in the root layout

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: The splash and the confetti

**Files:**
- Create: `components/sketchbook/Splash.tsx`, `components/sketchbook/Confetti.tsx`
- Modify: `app/layout.tsx`, `app/globals.css` (append)

**Interfaces:**
- Consumes: `Logo` (Task 1).
- Produces: `Splash(): JSX.Element | null`, `Confetti({ duration?: number }): JSX.Element | null`.

- [ ] **Step 1: `components/sketchbook/Confetti.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number; y: number; vx: number; vy: number;
  r: number; rot: number; vr: number;
  kind: "marigold" | "petal" | "leaf";
  color: string;
};

const COUNT = 150;

/** Reads a colour token off the root so the canvas paints with the same palette as the page. */
function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * A short shower of marigolds, petals and mango leaves, drawn on a canvas
 * over everything and gone in a few seconds. Skipped under reduced motion.
 */
export function Confetti({ duration = 2800 }: { duration?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = {
      turmeric: token("--color-turmeric"),
      terracotta: token("--color-terracotta"),
      sindoor: token("--color-sindoor"),
      leaf: token("--color-leaf"),
      ink: token("--color-umber"),
    };

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    const particles: Particle[] = Array.from({ length: COUNT }, () => {
      const roll = Math.random();
      const kind: Particle["kind"] = roll < 0.55 ? "marigold" : roll < 0.85 ? "petal" : "leaf";
      const color =
        kind === "leaf" ? colors.leaf : Math.random() < 0.6 ? colors.turmeric : Math.random() < 0.5 ? colors.terracotta : colors.sindoor;
      return {
        x: Math.random() * w,
        y: -20 - Math.random() * h * 0.6,
        vx: (Math.random() - 0.5) * 1.6,
        vy: 2 + Math.random() * 3,
        r: kind === "marigold" ? 3 + Math.random() * 4 : 4 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.15,
        kind,
        color,
      };
    });

    const start = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      const t = now - start;
      const fade = t > duration - 600 ? Math.max(0, (duration - t) / 600) : 1;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = fade;
      for (const p of particles) {
        p.x += p.vx + Math.sin((t + p.r * 100) / 400) * 0.4;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > h + 20) continue;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (p.kind === "marigold") {
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 0.45, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.ellipse(0, 0, p.r * 0.45, p.r, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
      if (t < duration) raf = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, [duration]);

  return <canvas ref={ref} className="sk-confetti" aria-hidden="true" />;
}
```

- [ ] **Step 2: `components/sketchbook/Splash.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Confetti } from "@/components/sketchbook/Confetti";
import { Logo } from "@/components/sketchbook/Logo";

const KEY = "ganapati:splash";
const MIN_MS = 1400;
const MAX_MS = 3200;
const LEAVE_MS = 600;
const CONFETTI_MS = 2800;

type Phase = "shown" | "leaving" | "confetti" | "done";

/**
 * The first thing a visitor sees, once per browser session: the mark draws
 * itself on clay paper, the name writes on, and the sheet lifts away into a
 * shower of marigolds. Leaves when the page has loaded, never before MIN_MS
 * and never after MAX_MS. Reduced motion: a short static card, no confetti.
 */
export function Splash() {
  const [phase, setPhase] = useState<Phase>("shown");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* no storage: show it this once */
    }
    if (seen) {
      setPhase("done");
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const min = reduced ? 600 : MIN_MS;
    const started = performance.now();
    let loaded = document.readyState === "complete";
    let timer = 0;
    let cancelled = false;

    const leave = () => {
      if (cancelled) return;
      setPhase("leaving");
      window.setTimeout(() => {
        if (cancelled) return;
        if (reduced) {
          setPhase("done");
          return;
        }
        setPhase("confetti");
        window.setTimeout(() => !cancelled && setPhase("done"), CONFETTI_MS);
      }, LEAVE_MS);
    };

    const maybeLeave = () => {
      if (!loaded) return;
      const elapsed = performance.now() - started;
      window.clearTimeout(timer);
      timer = window.setTimeout(leave, Math.max(0, min - elapsed));
    };

    const onLoad = () => {
      loaded = true;
      maybeLeave();
    };
    window.addEventListener("load", onLoad);
    maybeLeave();
    const cap = window.setTimeout(() => {
      loaded = true;
      leave();
    }, MAX_MS);

    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
      window.clearTimeout(timer);
      window.clearTimeout(cap);
    };
  }, []);

  if (phase === "done") return null;
  if (phase === "confetti") return <Confetti duration={CONFETTI_MS} />;

  return (
    <div className={`sk-splash room-sketch ${phase === "leaving" ? "sk-splash--leaving" : ""}`} role="status" aria-label="Loading Ganapati">
      <div className="sk-splash-card">
        <Logo className="sk-logo sk-splash-logo" />
        <p className="sk-splash-name sk-hand-display">Ganapati</p>
        <p className="sk-splash-line sk-hand-note">the sketchbook</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `app/layout.tsx`** — render the splash first inside the body:

```tsx
      <body className="min-h-full">
        <FluteProvider>
          <Splash />
          {children}
        </FluteProvider>
      </body>
```

with `import { Splash } from "@/components/sketchbook/Splash";`.

- [ ] **Step 4: CSS** (append to `app/globals.css`)

```css
/* --- the splash and the confetti ------------------------------------------- */

.sk-splash {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  min-height: 0;
  transition: opacity 600ms var(--ease-gallery), transform 600ms var(--ease-gallery);
}

.sk-splash--leaving { opacity: 0; transform: translateY(-2%); pointer-events: none; }

.sk-splash-card { text-align: center; display: grid; justify-items: center; gap: var(--space-3); }

.sk-splash-logo { width: clamp(96px, 18vw, 160px); height: auto; }

/* the mark draws itself */
.sk-splash-logo .sk-logo-ink path {
  stroke-dasharray: 220;
  stroke-dashoffset: 220;
  animation: sk-draw 900ms var(--ease-gallery) forwards;
}
.sk-splash-logo .sk-logo-ink path:nth-child(2) { animation-delay: 120ms; }
.sk-splash-logo .sk-logo-ink path:nth-child(3) { animation-delay: 240ms; }
.sk-splash-logo .sk-logo-ink path:nth-child(4) { animation-delay: 380ms; }
.sk-splash-logo .sk-logo-ink path:nth-child(5) { animation-delay: 380ms; }
.sk-splash-logo .sk-logo-ink path:nth-child(6) { animation-delay: 520ms; }
.sk-splash-logo .sk-logo-eye,
.sk-splash-logo .sk-logo-jewel,
.sk-splash-logo .sk-logo-tilak { opacity: 0; animation: sk-appear 300ms var(--ease-gallery) 900ms forwards; }

@keyframes sk-draw { to { stroke-dashoffset: 0; } }
@keyframes sk-appear { to { opacity: 1; } }

/* the name writes on after the mark */
.sk-splash-name { margin: 0; transform: rotate(-1.5deg); clip-path: inset(0 100% 0 0); animation: sk-write-on 700ms var(--ease-gallery) 700ms forwards; }
.sk-splash-line { margin: 0; color: var(--color-ink-soft); opacity: 0; animation: sk-appear 400ms var(--ease-gallery) 1300ms forwards; }

@keyframes sk-write-on { to { clip-path: inset(0 0 0 0); } }

.sk-confetti {
  position: fixed;
  inset: 0;
  z-index: 90;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .sk-splash-logo .sk-logo-ink path { stroke-dashoffset: 0; animation: none; }
  .sk-splash-logo .sk-logo-eye, .sk-splash-logo .sk-logo-jewel, .sk-splash-logo .sk-logo-tilak { opacity: 1; animation: none; }
  .sk-splash-name { clip-path: none; animation: none; }
  .sk-splash-line { opacity: 1; animation: none; }
}
```

- [ ] **Step 5: Verify**

`npx tsc --noEmit` clean; `npm test` 9 passing; `npm run build` succeeds. `curl -s http://localhost:3000/ | grep -c 'class="sk-splash'` → 1 (server renders the shown state). In the browser: open `/` in a fresh session (`sessionStorage.clear()` then reload): the mark draws itself, "Ganapati" writes on, the sheet lifts away between 1.4s and 3.2s, confetti falls for about 2.8s and the canvas is gone afterwards (`document.querySelector('.sk-confetti') === null` after 4s); reload again: no splash (`document.querySelector('.sk-splash') === null` within 200ms). Navigate to the story and back: no splash. Under reduced-motion emulation: a static card that leaves after about 0.6s, no confetti. Without Browser tools, say so.

- [ ] **Step 6: Commit**

```bash
git add components/sketchbook/Splash.tsx components/sketchbook/Confetti.tsx app/layout.tsx app/globals.css
git commit -m "Open with a splash: the mark draws itself, then a shower of marigolds

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Unclipped doodles, docs, verification

**Files:**
- Modify: `app/globals.css`, `README.md`, `docs/design-system.md`

- [ ] **Step 1: Doodles may cross section edges**

In `app/globals.css`, in the `.sk-doodles { ... }` rule, change `overflow: hidden;` to `overflow: visible;`. Horizontal clipping still happens at the page level (`.room-sketch { overflow-x: clip }`), so nothing can widen the page.

- [ ] **Step 2: Docs**

`README.md`: in the paragraph describing the homepage, add one sentence: "The tab icon and the header mark are the same hand-drawn face (`app/icon.svg`, `components/sketchbook/Logo.tsx`). On the first visit of a session a short splash draws the mark and ends in a shower of marigolds; the flute in the header keeps playing across pages because its audio lives in the root layout." `docs/design-system.md`: under Motion add `sk-draw`, `sk-write-on`, `sk-appear` (splash) and note the confetti canvas; under a new "## The mark" heading, two lines on `Logo` classes (`.sk-logo-ink`, `-eye`, `-jewel`, `-tilak`).

- [ ] **Step 3: Verify**

`npx tsc --noEmit`; `npm test`; `npm run build`. In the browser at 1440 and 375: `document.documentElement.scrollWidth <= innerWidth` on both pages; at least one `.sk-doodle` whose bounding rect crosses its section's top or bottom edge (report the numbers); the header mark and favicon present on both pages; flute persists across a client navigation; splash once per session. No console errors.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css README.md docs/design-system.md
git commit -m "Let doodles cross section edges; document the mark, splash and flute

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 5: Work 41 returns; the collection is 108 again

The user supplied a corrected drawing for work 41 (previously excluded for an anatomical error). Ids are the position in the sorted `originals/` list, where `generation-1.jpg` is id 1 and `generation-1 (N).jpg` is id N+1, so work 41 is `originals/generation-1 (40).jpg` (the held-out copy sits in `review/extra-feet/041-generation-1 (40).jpg`). The pipeline reads only `.jpg`/`.jpeg`, so the AVIF is converted first.

**Files:**
- Modify: `originals/generation-1 (40).jpg` (git-ignored source; overwritten), `data/excluded.ts`, `data/plates.json`, `public/images/ganesha-041.avif` (new), `README.md`

- [ ] **Step 1: Put the fixed drawing in the id-41 slot**

```bash
node -e 'require("sharp")("/Users/shashwattirpathi/Downloads/041-generation-1 (40).avif").rotate().jpeg({ quality: 95, chromaSubsampling: "4:4:4" }).toFile("originals/generation-1 (40).jpg").then(i => console.log("wrote", i.width, i.height))'
```

Expected: `wrote 1125 1398`. (The previous original is already preserved in `review/extra-feet/`; `originals/` is git-ignored.)

- [ ] **Step 2: Lift the exclusion**

In `data/excluded.ts`, remove the `{ id: 41, ... }` line so `excluded` is an empty array (`export const excluded: Exclusion[] = [];`), and update the comment above it to say the array is empty because the one held-out work was redrawn on 2026-09-16. Leave the "more than four arms" list and everything else untouched.

- [ ] **Step 3: Run the pipeline**

```bash
npm run images
```

Expected last lines: `Wrote 108 plates to public/images and data/plates.json`. Then:

```bash
node -e 'const p=require("./data/plates.json");console.log(p.length, p.find(x=>x.id===41)?.src)'
git status --short public/images data | head
```

Expected: `108 /images/ganesha-041.avif`; `git status` shows `public/images/ganesha-041.avif` as new and `data/plates.json` modified. If other `public/images/*.avif` files show as modified, the encoder is not byte-stable: report the count and continue (they are re-encodes of the same sources).

- [ ] **Step 4: Counts follow the data**

`grep -rn "107" README.md data components lib app --include=*.md --include=*.ts --include=*.tsx` — change any figure that states the current number of works to 108 (README says "(107 plates)"); leave any 107 that is not a count. `data/notes.ts` derives its numbers from `total`, so no change there.

- [ ] **Step 5: Verify**

`npx tsc --noEmit`; `npm test` 9 passing; `npm run build`. With the dev server: `curl -s http://localhost:3000/ | grep -o 'and eight' | head -1` → `and eight` (the hero title now reads "One hundred / and eight Ganeshas"); `grep -c 'figure class="sk-work'`-style count → 111 (108 + 3 on the desk; use the exact class attribute as rendered); `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/images/ganesha-041.avif` → 200. In the browser, if available: work 41 appears in chapter II (Standing) between 40 and 42 with its caption.

- [ ] **Step 6: Commit**

```bash
git add data/excluded.ts data/plates.json public/images README.md
git commit -m "Work 41 returns, redrawn; the collection is 108 again

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---
