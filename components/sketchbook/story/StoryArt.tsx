"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { formatNumber } from "@/lib/format";
import { useParallax } from "@/lib/useParallax";
import type { Artwork } from "@/lib/types";

/**
 * One of the "beyond the brief" drawings beside the story's title: shown
 * frameless, as if drawn on the page, tilted a touch, drifting a little
 * slower than the text.
 */
export function StoryArt({ artwork }: { artwork: Artwork }) {
  const ref = useParallax<HTMLDivElement>(-0.05);
  return (
    <figure ref={ref} className="sk-story-art sk-px" style={{ "--rot": "2deg" } as CSSProperties}>
      <Image
        src={artwork.src}
        alt={artwork.title}
        width={artwork.width}
        height={artwork.height}
        placeholder="blur"
        blurDataURL={artwork.blurDataURL}
        sizes="(min-width: 768px) 380px, 72vw"
        priority
      />
      <figcaption className="sk-story-art-caption sk-hand-small">
        <span className="sk-work-num">No. {formatNumber(artwork.id)}</span>
        {artwork.title}
      </figcaption>
    </figure>
  );
}
