/**
 * Works held out of the collection.
 *
 * Excluding by id keeps plate numbering stable: `prepare-images.mjs` still
 * numbers from the full sorted list of originals, so every other work keeps
 * the id its catalogue entry is written against. Nothing is deleted. Each
 * excluded original is copied into `review/<reason>/` so it can be checked.
 *
 * To bring a work back, delete its line and run `npm run images`.
 */
export type Exclusion = { id: number; reason: "extra-feet" | "extra-arms"; note: string };

// Note: work 19 is shown beside the story's title (components/sketchbook/story/
// StoryPage.tsx); excluding it would silently swap that spot to work 1.
export const excluded: Exclusion[] = [
  // Empty since 2026-09-16: the one held-out work (41, four feet) was redrawn
  // and its corrected file put back into `originals/`.
];

/**
 * Works with more than four arms, listed for review but NOT excluded.
 *
 * Multi-armed Ganesha is canonical rather than broken: Heramba Ganapati has
 * ten arms, Mahaganapati ten, and six and eight armed forms are standard. Each
 * of these is copied into `review/extra-arms/` to be looked at. To drop them
 * from the collection, move the ones you want gone into `excluded` above.
 */
export const moreThanFourArms: number[] = [
  26, 38, 50, 53, 56, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 80,
  85, 87, 97, 102, 105,
];

export const excludedIds = new Set(excluded.map((x) => x.id));
