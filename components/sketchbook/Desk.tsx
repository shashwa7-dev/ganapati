"use client";

import type { CSSProperties } from "react";
import { PinnedWork } from "@/components/sketchbook/PinnedWork";
import { StarDoodle } from "@/components/sketchbook/doodles";
import { DoodleField } from "@/components/sketchbook/DoodleField";
import { desk } from "@/data/notes";
import { useParallax } from "@/lib/useParallax";
import type { Artwork } from "@/lib/types";
import { inWordsCapitalised } from "@/lib/words";

/**
 * The opening: the title behind, the lead work taped in front, two studies
 * at the edges. Three parallax speeds, read from the motion tokens.
 */
export function Desk({
  lead,
  studies,
  total,
  onOpen,
}: {
  lead: Artwork;
  studies: [Artwork, Artwork];
  total: number;
  onOpen: (artwork: Artwork) => void;
}) {
  const titleRef = useParallax<HTMLHeadingElement>(-0.08);
  const leadRef = useParallax<HTMLDivElement>(0.05);
  const leftRef = useParallax<HTMLDivElement>(0.16);
  const rightRef = useParallax<HTMLDivElement>(0.12);

  // "One hundred and eight" → "One hundred" / "and eight"
  const words = inWordsCapitalised(total);
  const cut = words.indexOf(" and ");
  const first = cut === -1 ? words : words.slice(0, cut);
  const rest = cut === -1 ? "" : words.slice(cut + 1);

  return (
    <section className="sk-desk sk-has-doodles" aria-label="Introduction">
      <DoodleField seed="desk" count={6} />
      <h1 ref={titleRef} className="sk-desk-title sk-hand-display sk-px">
        {first}
        {rest && <span className="and">{rest}</span>}
        <span className="who"> Ganeshas</span>
      </h1>

      <StarDoodle className="sk-desk-star" />

      <div className="sk-desk-stage">
        <div ref={leftRef} className="sk-desk-study sk-desk-study--left sk-px" style={{ "--rot": "-7deg" } as CSSProperties}>
          <PinnedWork artwork={studies[0]} index={1} frame="b" rotate={0} width="100%" withMeta={false} eager onOpen={() => onOpen(studies[0])} sizes="20vw" />
        </div>

        <div ref={leadRef} className="sk-desk-lead sk-px" style={{ "--rot": "1.5deg" } as CSSProperties}>
          <PinnedWork artwork={lead} index={0} frame="a" rotate={0} width="100%" withMeta={false} eager onOpen={() => onOpen(lead)} sizes="(min-width: 768px) 38vw, 92vw" />
        </div>

        <div ref={rightRef} className="sk-desk-study sk-desk-study--right sk-px" style={{ "--rot": "6deg" } as CSSProperties}>
          <PinnedWork artwork={studies[1]} index={2} frame="a" rotate={0} width="100%" withMeta={false} eager onOpen={() => onOpen(studies[1])} sizes="20vw" />
        </div>
      </div>

      <p className="sk-desk-hint sk-hand-note">{desk.scrollHint}</p>
    </section>
  );
}
