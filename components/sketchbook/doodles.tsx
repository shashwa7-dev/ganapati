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
