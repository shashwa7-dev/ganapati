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
/** Never move anything further than this; keeps far-off elements in place. */
const MAX_SHIFT = 120;
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
    const py = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, Math.round(-centre * entry.speed * 10) / 10));
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
    if (!el || speed === 0) return;
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
