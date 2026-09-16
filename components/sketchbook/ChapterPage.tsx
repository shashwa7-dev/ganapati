"use client";

import type { CSSProperties, ReactNode } from "react";
import { formatNumber } from "@/lib/format";
import { PinnedWork } from "@/components/sketchbook/PinnedWork";
import { DoodleField, doodleCount } from "@/components/sketchbook/DoodleField";
import { noteFor, tagline } from "@/data/notes";
import type { Chapter } from "@/lib/collection";
import type { Artwork } from "@/lib/types";

// Per-column drift speeds: 0 lifts gently, 1 sinks slowly against the page, 2 lifts most.
const SPEEDS = [0.06, -0.04, 0.1];
const OFFSETS = ["0px", "var(--space-8)", "var(--space-5)"];

/** One column of the wall. Its works carry the drift; the column only carries its offset. */
function Column({ offset, children }: { offset: string; children: ReactNode }) {
  return (
    <div className="sk-col" style={{ "--col-offset": offset } as CSSProperties}>
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
    <section id={`part-${chapter.numeral.toLowerCase()}`} className="sk-chapter sk-has-doodles" aria-labelledby={`part-${chapter.numeral.toLowerCase()}-title`}>
      <DoodleField seed={chapter.posture} count={doodleCount(chapter.works.length)} />
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
          <Column key={c} offset={OFFSETS[c]}>
            {works.map((work, i) => (
              <PinnedWork
                key={work.id}
                artwork={work}
                index={i * 3 + c}
                order={chapter.works.indexOf(work)}
                note={noteFor(work.id)}
                onOpen={() => onOpen(work)}
                parallax={SPEEDS[c]}
              />
            ))}
          </Column>
        ))}
      </div>
    </section>
  );
}
