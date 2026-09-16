"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ChapterPage } from "@/components/sketchbook/ChapterPage";
import { Desk } from "@/components/sketchbook/Desk";
import { HandNav } from "@/components/sketchbook/HandNav";
import { IntroNote } from "@/components/sketchbook/IntroNote";
import { SignOff } from "@/components/sketchbook/SignOff";
import { SketchViewer } from "@/components/sketchbook/SketchViewer";
import { StoryDoor } from "@/components/sketchbook/StoryDoor";
import { Toran } from "@/components/sketchbook/Toran";
import { desk } from "@/data/notes";
import type { Chapter } from "@/lib/collection";
import { LikesProvider } from "@/lib/likes";
import type { Artwork } from "@/lib/types";

/** The homepage, composed. Owns which work (if any) is open full-screen. */
export function Sketchbook({
  chapters,
  order,
  lead,
}: {
  chapters: Chapter[];
  order: Artwork[];
  lead: Artwork;
}) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const total = order.length;
  const byId = (id: number) => order.find((work) => work.id === id) ?? order[0];
  const openWork = (artwork: Artwork) => setOpenAt(order.findIndex((work) => work.id === artwork.id));

  return (
    <LikesProvider>
      <div className="room-sketch">
        <Toran />
        <div className="sk-wall">
          <HandNav current="home" />
          <Desk lead={lead} studies={[byId(desk.studyLeft), byId(desk.studyRight)]} total={total} onOpen={openWork} />
          <IntroNote chapters={chapters} />
          {chapters.map((chapter) => (
            <ChapterPage key={chapter.posture} chapter={chapter} onOpen={openWork} />
          ))}
          <StoryDoor />
          <SignOff />
          {openAt !== null &&
            createPortal(
              <SketchViewer works={order} index={openAt} onClose={() => setOpenAt(null)} onMove={setOpenAt} />,
              document.body,
            )}
        </div>
      </div>
    </LikesProvider>
  );
}
