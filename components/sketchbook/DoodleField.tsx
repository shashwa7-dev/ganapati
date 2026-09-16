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

function scatter(seed: string, count: number, edges = false): Placed[] {
  const next = rng(seed);
  const out: Placed[] = [];
  for (let i = 0; i < count; i++) {
    // In the margins only the small marks fit; the garland is for the wide pages.
    const kinds = edges ? DOODLE_KINDS.filter((k) => k !== "garland" && k !== "mouse") : DOODLE_KINDS;
    const kind = kinds[Math.floor(next() * kinds.length)];
    // Six in ten sit in the margins; the rest can land anywhere. In edges
    // mode (prose pages) every mark sits OUTSIDE the section, in the page
    // margins beside it; the page clips horizontally so nothing widens it.
    const edge = edges || next() < 0.6;
    const x = edge
      ? next() < 0.5
        ? (edges ? -15 + next() * 6 : -2 + next() * 16)
        : (edges ? 103 + next() * 4 : 84 + next() * 16)
      : 10 + next() * 80;
    const y = 2 + next() * 94;
    const rot = -24 + next() * 48;
    const scale = edges ? 0.7 + next() * 0.3 : 0.8 + next() * 0.5;
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
export function DoodleField({ seed, count, edges = false }: { seed: string; count: number; edges?: boolean }) {
  const ref = useParallax<HTMLDivElement>(-0.03);
  const placed = scatter(seed, count, edges);
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
