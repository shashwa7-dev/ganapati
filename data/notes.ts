import type { Posture } from "@/lib/types";
import { inWords } from "@/lib/words";
import { total } from "@/lib/collection";

/**
 * Everything handwritten on the homepage, in one place, so the copy can be
 * changed without opening a component. Lower-case and conversational: it is
 * the artist talking in the margin, not a label.
 */

export type NoteSide = "left" | "right";
export type ArrowKind = "swoop" | "hook" | "curl";

export type MarginNote = {
  /** The work this note sits under. Unknown ids are ignored. */
  id: number;
  text: string;
  side: NoteSide;
  arrow: ArrowKind;
};

const count = inWords(total);

export const desk = {
  studyLeft: 38,
  studyRight: 56,
  scrollHint: `scroll down, I drew all ${total} of him ↓`,
};

export const intro = {
  heading: "A note before you go in",
  body:
    `One figure, drawn ${count} times. I kept the same rules every time: an elephant's head, a round belly, a broken tusk, and something sweet within reach. Everything else was allowed to change. What came out is sorted into six parts, mostly by what he's doing with his legs.`,
  signoff: "— sorted by posture, then by whatever felt right",
};

export function tagline(posture: Posture, count: number): string {
  const n = inWords(count);
  switch (posture) {
    case "Sitting":
      return `${n} ways of sitting down`;
    case "Standing":
      return `${n} of them, all upright, all on time`;
    case "Dancing":
      return `${n} of them, none sitting still`;
    case "Ceremonial":
      return `${n} evenings of lamps and garlands`;
    case "Meditative":
      return `${n} times I tried to draw quiet`;
    case "Overflow":
      return `${n} that didn't follow the brief. kept them anyway.`;
  }
}

export const notes: MarginNote[] = [
  // I · The Seated Forms
  { id: 3, text: "the first throne. I got carried away with the gold.", side: "right", arrow: "swoop" },
  { id: 6, text: "ukadiche modak. steamed, the proper kind.", side: "left", arrow: "hook" },
  { id: 12, text: "the mouse is guarding the kalash. or drinking from it.", side: "right", arrow: "curl" },
  { id: 29, text: "the ears took longer than the rest of him", side: "left", arrow: "swoop" },
  { id: 100, text: "drew the grain first, then found him inside it", side: "right", arrow: "hook" },
  { id: 108, text: "no. 108. the last one. I put everything in.", side: "left", arrow: "curl" },
  // II · The Standing Forms
  { id: 40, text: "bronze gone green, the way old temple bells do", side: "right", arrow: "swoop" },
  { id: 44, text: "one diya. that's all the light he needed.", side: "left", arrow: "hook" },
  { id: 50, text: "two inks only. ultramarine, and the paper.", side: "right", arrow: "curl" },
  { id: 54, text: "the mouse is carrying the incense. of course he is.", side: "left", arrow: "swoop" },
  { id: 99, text: "the lotus stem is longer than he is tall", side: "right", arrow: "hook" },
  // III · Movement
  { id: 38, text: "my favourite of the lot, honestly", side: "right", arrow: "swoop" },
  { id: 61, text: "the lamp is the only light source, so everything else went dark", side: "left", arrow: "hook" },
  { id: 63, text: "one arm goes off the page. I let it.", side: "right", arrow: "curl" },
  { id: 64, text: "has a mouse. look closely.", side: "left", arrow: "swoop" },
  { id: 97, text: "drawn on a linen scrap, then traced", side: "right", arrow: "hook" },
  // IV · Ceremony
  { id: 20, text: "this is what the room looks like at nine on the first night", side: "left", arrow: "curl" },
  { id: 32, text: "the marigold garland is heavier than it looks", side: "right", arrow: "swoop" },
  { id: 58, text: "the pandal, the lights, everyone. had to draw all of it.", side: "left", arrow: "hook" },
  { id: 80, text: "everything on the plate at once. modak, diya, mala, marigold.", side: "right", arrow: "curl" },
  // V · Stillness
  { id: 4, text: "the quietest one. paper and rust, nothing else.", side: "left", arrow: "swoop" },
  { id: 26, text: "tried to draw stillness with only straight lines", side: "right", arrow: "hook" },
  { id: 89, text: "eyes closed. first time I drew him not looking back.", side: "left", arrow: "curl" },
  { id: 94, text: "the mouse is also meditating. or asleep.", side: "right", arrow: "swoop" },
  // VI · Beyond the Brief
  { id: 19, text: "how few circles can he be? this many.", side: "left", arrow: "hook" },
  { id: 33, text: "what if he were a building", side: "right", arrow: "curl" },
  { id: 88, text: "pen never left the paper", side: "left", arrow: "swoop" },
  { id: 95, text: "one stroke. took forty tries.", side: "right", arrow: "hook" },
];

const byId = new Map(notes.map((note) => [note.id, note]));

export function noteFor(id: number): MarginNote | undefined {
  return byId.get(id);
}

export const door = {
  heading: "Why 108?\nWhy him?",
  body:
    "The festival, the clay, the ten days, the goodbye at the sea. The drawings make more sense once you've read this bit.",
  photoCaption: "Lalbaugcha Raja, a photograph, not a drawing",
  storyLink: "read the story →",
};

export const signoff = {
  left: `drawn ${count} times, hung once`,
  right: "Ganapati Bappa Morya ✦",
  credit: { text: "all artwork generated by", name: "shopos.ai", href: "https://shopos.ai/" },
};
