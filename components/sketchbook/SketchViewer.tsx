"use client";

import Image from "next/image";
import { useCallback } from "react";
import { describe, formatNumber } from "@/lib/format";
import { LikeButton } from "@/components/sketchbook/LikeButton";
import { Arrow, CloseDoodle, DownloadDoodle } from "@/components/sketchbook/doodles";
import { useLightbox } from "@/lib/useLightbox";
import type { Artwork } from "@/lib/types";

/** A page pulled out of the sketchbook: one work, large, with its notes. */
export function SketchViewer({
  works,
  index,
  onClose,
  onMove,
}: {
  works: Artwork[];
  index: number;
  onClose: () => void;
  onMove: (next: number) => void;
}) {
  const move = useCallback(
    (delta: 1 | -1) => onMove((index + delta + works.length) % works.length),
    [index, works.length, onMove],
  );
  const { dialogRef, onTouchStart, onTouchEnd } = useLightbox({ onClose, onMove: move });
  const artwork = works[index];
  if (!artwork) return null;

  const offerings = artwork.offerings.length ? artwork.offerings.join(" · ") : "No offering shown";

  const fileName = `ganapati-no-${formatNumber(artwork.id)}-${artwork.slug}.avif`;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`No. ${formatNumber(artwork.id)}, ${artwork.title}`}
      tabIndex={-1}
      className="sk-viewer room-sketch"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="sk-viewer-top sk-hand-note">
        <span>
          {index + 1} of {works.length}
        </span>
        <div className="sk-viewer-actions">
          <a
            href={artwork.src}
            download={fileName}
            className="sk-viewer-action"
            aria-label={`Download No. ${formatNumber(artwork.id)}`}
            title="Download"
          >
            <DownloadDoodle />
          </a>
          <button type="button" onClick={onClose} className="sk-viewer-action sk-viewer-close" aria-label="Close" title="Close">
            <CloseDoodle />
          </button>
        </div>
      </div>

      <div className="sk-viewer-stage">
        <figure key={artwork.id} className="sk-viewer-sheet">
          <div className="sk-frame">
            <span className="sk-tape" />
            <span className="sk-tape sk-tape--r" />
            <Image
              src={artwork.src}
              alt={`${artwork.title}. ${describe(artwork)}`}
              width={artwork.width}
              height={artwork.height}
              placeholder="blur"
              blurDataURL={artwork.blurDataURL}
              sizes="(min-width: 768px) 720px, 92vw"
              quality={88}
              priority
              className="sk-viewer-img"
              style={{ objectFit: "contain" }}
            />
          </div>
          <figcaption className="sk-viewer-caption">
            <div className="sk-viewer-title">
              <span className="sk-work-num" style={{ fontSize: "var(--text-hand-note)" }}>
                No. {formatNumber(artwork.id)}
              </span>
              <span className="sk-hand-subhead">{artwork.title}</span>
              <LikeButton id={artwork.id} />
            </div>
            <p className="sk-viewer-meta sk-hand-note">
              {artwork.material.toLowerCase()} · {artwork.trunk.toLowerCase()} trunk · {artwork.palette.toLowerCase()}
            </p>
            <p className="sk-viewer-offerings sk-serif-body">{offerings}</p>
          </figcaption>
        </figure>
      </div>

      <div className="sk-viewer-nav">
        <button type="button" onClick={() => move(-1)} className="sk-viewer-arrow sk-viewer-arrow--prev" aria-label="Previous">
          <Arrow kind="swoop" />
        </button>
        <button type="button" onClick={() => move(1)} className="sk-viewer-arrow" aria-label="Next">
          <Arrow kind="swoop" />
        </button>
      </div>
    </div>
  );
}
