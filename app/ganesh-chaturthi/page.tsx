import type { Metadata } from "next";
import { StoryPage } from "@/components/sketchbook/story/StoryPage";

export const metadata: Metadata = {
  title: "The Story · Why we bring Ganpati home",
  description:
    "The story of Ganesh Chaturthi: its ancient roots, the public Ganeshotsav of Maharashtra, Mumbai's mill neighbourhoods, the beloved Lalbaugcha Raja, and the meaning of visarjan.",
};

/** The story, told in the same sketchbook as the drawings. */
export default function GaneshChaturthi() {
  return <StoryPage />;
}
