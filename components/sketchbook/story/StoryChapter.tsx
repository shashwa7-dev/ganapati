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
  wide,
}: {
  numeral: string;
  title: string;
  tagline: string;
  paragraphs: string[];
  aside?: ReactNode;
  children?: ReactNode;
  /** Content that needs the full wall width, rendered under the prose. */
  wide?: ReactNode;
}) {
  const ref = useArrival<HTMLDivElement>();
  const id = `story-${numeral.toLowerCase()}`;

  return (
    <section id={id} className="sk-story-chapter sk-has-doodles" aria-labelledby={`${id}-title`}>
      <DoodleField seed={id} count={2} edges />
      <div className="sk-chapter-head">
        <span className="sk-circle">{numeral}</span>
        <h2 id={`${id}-title`} className="sk-hand-heading">
          {title}
        </h2>
      </div>
      <p className="sk-chapter-tag sk-hand-note">{tagline}</p>

      <div ref={ref} className={`sk-story-body sk-swing ${aside ? "sk-story-body--two" : ""}`}>
        <div className="sk-story-prose sk-serif-lead">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>
              <Inline text={paragraph} />
            </p>
          ))}
          {children}
        </div>
        {aside && <div className="sk-story-aside">{aside}</div>}
      </div>
      {wide && <div className="sk-story-wide">{wide}</div>}
    </section>
  );
}
