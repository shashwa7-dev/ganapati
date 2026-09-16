"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { describe, formatNumber } from "@/lib/format";
import { LikeButton } from "@/components/sketchbook/LikeButton";
import { MarginNoteBlock } from "@/components/sketchbook/MarginNote";
import type { MarginNote } from "@/data/notes";
import { useArrival } from "@/lib/useArrival";
import { useParallax } from "@/lib/useParallax";
import type { Artwork } from "@/lib/types";

/** Cycles that keep the wall from ever falling into a grid. */
export const FRAME_CYCLE: ("a" | "b")[] = ["a", "b", "a", "a", "b", "b", "a", "b"];
export const ROTATE_CYCLE = [-2, 2.5, -1, 3, -3, 1.5, 4, -1.5];
export const WIDTH_CYCLE = ["100%", "78%", "88%", "92%", "70%", "96%", "84%"];

export type PinnedWorkProps = {
  artwork: Artwork;
  /** Position within its column or run; drives the cycles and the stagger. */
  index: number;
  onOpen: () => void;
  eager?: boolean;
  /** Override the cycles when a caller wants a specific look (the hero does). */
  frame?: "a" | "b";
  rotate?: number;
  width?: string;
  /** Show the material · trunk line under the title. */
  withMeta?: boolean;
  note?: MarginNote;
  sizes?: string;
  /** Catalogue position within the chapter; drives phone ordering. */
  order?: number;
  /** Scroll parallax speed for this work; 0 (default) registers nothing. */
  parallax?: number;
};

export function PinnedWork({
  artwork,
  index,
  onOpen,
  eager = false,
  frame = FRAME_CYCLE[index % FRAME_CYCLE.length],
  rotate = ROTATE_CYCLE[index % ROTATE_CYCLE.length],
  width = WIDTH_CYCLE[index % WIDTH_CYCLE.length],
  withMeta = index % 3 === 0,
  note,
  sizes = "(min-width: 768px) 30vw, 92vw",
  order = 0,
  parallax = 0,
}: PinnedWorkProps) {
  const ref = useArrival<HTMLDivElement>();
  const pxRef = useParallax<HTMLElement>(parallax);
  const hangRight = index % 2 === 1;

  const figureStyle = {
    "--w": width,
    "--ms": hangRight ? "auto" : "0",
    "--me": hangRight ? "0" : "auto",
    "--i": order,
  } as CSSProperties;

  const swingStyle = {
    "--rot": `${rotate}deg`,
    "--reveal-delay": `${(index % 3) * 110}ms`,
  } as CSSProperties;

  const label = `Open No. ${formatNumber(artwork.id)}, ${artwork.title}`;

  return (
    <figure ref={pxRef} className="sk-work sk-px" style={figureStyle}>
      <div ref={ref} className="sk-swing" style={swingStyle}>
        <button type="button" onClick={onOpen} className="sk-work-frame" aria-label={label}>
          <div className={`sk-frame ${frame === "b" ? "sk-frame--b" : ""}`}>
            <span className="sk-tape" />
            {index % 3 !== 1 && <span className="sk-tape sk-tape--r" />}
            <Image
              src={artwork.src}
              alt={`${artwork.title}. ${describe(artwork)}`}
              width={artwork.width}
              height={artwork.height}
              placeholder="blur"
              blurDataURL={artwork.blurDataURL}
              sizes={sizes}
              priority={eager}
              loading={eager ? undefined : "lazy"}
            />
          </div>
        </button>

        <figcaption className="sk-work-caption sk-write">
          {/* Mouse convenience only: the frame button above is the accessible control. */}
          <button
            type="button"
            onClick={onOpen}
            className="sk-work-title sk-hand-caption"
            tabIndex={-1}
            aria-hidden="true"
          >
            <span className="sk-work-num">No. {formatNumber(artwork.id)}</span>
            <span className="text-ink">{artwork.title}</span>
            {withMeta && (
              <span className="sk-work-meta sk-hand-small">
                {artwork.material.toLowerCase()} · {artwork.trunk.toLowerCase()} trunk
              </span>
            )}
          </button>
          <LikeButton id={artwork.id} />
        </figcaption>

        {note && <MarginNoteBlock note={note} />}
      </div>
    </figure>
  );
}
