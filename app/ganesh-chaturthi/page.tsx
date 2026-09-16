import type { Metadata } from "next";
import { StoryPage } from "@/components/sketchbook/story/StoryPage";

const STORY_TITLE = "The Story — Why we bring Ganpati home";
const STORY_DESCRIPTION =
  "The story of Ganesh Chaturthi: its ancient roots, the public Ganeshotsav of Maharashtra, Mumbai's mill neighbourhoods, the beloved Lalbaugcha Raja, and the meaning of visarjan.";

export const metadata: Metadata = {
  title: "The Story",
  description: STORY_DESCRIPTION,
  alternates: { canonical: "/ganesh-chaturthi" },
  // openGraph/twitter are shallow-overwritten (not merged), so restate the shared bits.
  openGraph: {
    type: "article",
    siteName: "Ganapati",
    title: STORY_TITLE,
    description: STORY_DESCRIPTION,
    url: "/ganesh-chaturthi",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: STORY_TITLE,
    description: STORY_DESCRIPTION,
  },
};

/** The story, told in the same sketchbook as the drawings. */
export default function GaneshChaturthi() {
  return <StoryPage />;
}
