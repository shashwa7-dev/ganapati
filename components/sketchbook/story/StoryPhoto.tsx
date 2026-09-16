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
      <p className="sk-note sk-note--left sk-hand-note">
        <Arrow kind="hook" />
        <span>{note}</span>
      </p>
      <figcaption className="sk-story-photo-caption sk-hand-small">
        {p.caption} · {p.credit}
      </figcaption>
    </figure>
  );
}
