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
