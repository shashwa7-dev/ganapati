import { DoodleField } from "@/components/sketchbook/DoodleField";
import { intro } from "@/data/notes";
import type { Chapter } from "@/lib/collection";

/** A short note from the artist, and the contents written down the side. */
export function IntroNote({ chapters }: { chapters: Chapter[] }) {
  return (
    <section className="sk-intro sk-has-doodles" aria-label="About the collection">
      <DoodleField seed="intro" count={3} />
      <div>
        <h2 className="sk-hand-subhead">{intro.heading}</h2>
        <p className="sk-intro-body sk-serif-lead" style={{ marginTop: "var(--space-3)" }}>
          {intro.body}
        </p>
        <p className="sk-intro-sign sk-hand-note">{intro.signoff}</p>
      </div>

      <nav className="sk-contents sk-hand-note" aria-label="Contents">
        <div className="sk-contents-label">CONTENTS</div>
        {chapters.map((chapter) => (
          <a key={chapter.posture} href={`#part-${chapter.numeral.toLowerCase()}`}>
            <span className="sk-contents-num">{chapter.numeral}</span>
            <span className="sk-contents-title">{chapter.title}</span>
            <span className="sk-contents-count">{chapter.works.length}</span>
          </a>
        ))}
      </nav>
    </section>
  );
}
