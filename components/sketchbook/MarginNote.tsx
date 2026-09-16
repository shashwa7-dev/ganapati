import type { MarginNote } from "@/data/notes";
import { Arrow } from "@/components/sketchbook/doodles";

/** The artist's aside, tucked under a work, pointing back up at it. */
export function MarginNoteBlock({ note }: { note: MarginNote }) {
  return (
    <p className={`sk-note sk-note--${note.side} sk-hand-note`}>
      <Arrow kind={note.arrow} />
      <span style={{ whiteSpace: "pre-line" }}>{note.text}</span>
    </p>
  );
}
