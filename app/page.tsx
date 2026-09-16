import type { Metadata } from "next";
import { Sketchbook } from "@/components/sketchbook/Sketchbook";
import { LEAD_ID, artworkById, chapters, hangingOrder, total } from "@/lib/collection";
import { inWordsCapitalised } from "@/lib/words";

export const metadata: Metadata = {
  title: "Ganapati",
  description: `${inWordsCapitalised(total)} forms of Ganesha, drawn one at a time and hung in the artist's own sketchbook.`,
};

/** The front door: the sketchbook. The full catalogue view stays at /gallery. */
export default function Home() {
  return <Sketchbook chapters={chapters} order={hangingOrder} lead={artworkById(LEAD_ID)} />;
}
