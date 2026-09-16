import platesData from "@/data/plates.json";
import { catalogue } from "@/data/catalogue";
import { POSTURES, type Artwork, type Plate, type Posture } from "@/lib/types";

const plates = platesData as Plate[];
const byId = new Map(catalogue.map((entry) => [entry.id, entry]));

/**
 * Every prepared image, in catalogue order. A plate without a curated entry
 * still shows — it just carries neutral defaults until someone describes it.
 */
export const artworks: Artwork[] = plates.map(({ id, ...plate }) => {
  const entry = byId.get(id);
  return {
    id,
    ...plate,
    title: entry?.title ?? "Untitled",
    posture: entry?.posture ?? "Overflow",
    material: entry?.material ?? "Natural Clay",
    trunk: entry?.trunk ?? "Flowing",
    palette: entry?.palette ?? "Undescribed",
    mouse: entry?.mouse ?? false,
    offerings: entry?.offerings ?? [],
  };
});

export type Chapter = {
  numeral: string;
  title: string;
  short: string;
  posture: Posture;
  works: Artwork[];
};

const CHAPTER_TITLES: Record<Posture, { numeral: string; title: string; short: string }> = {
  Sitting: { numeral: "I", title: "The Seated Forms", short: "Seated" },
  Standing: { numeral: "II", title: "The Standing Forms", short: "Standing" },
  Dancing: { numeral: "III", title: "Movement", short: "Movement" },
  Ceremonial: { numeral: "IV", title: "Ceremony", short: "Ceremony" },
  Meditative: { numeral: "V", title: "Stillness", short: "Stillness" },
  Overflow: { numeral: "VI", title: "Beyond the Brief", short: "Beyond" },
};

/** The six parts of the collection, in order, skipping any that are empty. */
export const chapters: Chapter[] = POSTURES.map((posture) => ({
  ...CHAPTER_TITLES[posture],
  posture,
  works: artworks.filter((artwork) => artwork.posture === posture),
})).filter((chapter) => chapter.works.length > 0);

/** The collection in hanging order — what the viewer walks. */
export const hangingOrder: Artwork[] = chapters.flatMap((chapter) => chapter.works);

/** The work that opens the exhibition. Change this id to change the frontispiece. */
export const LEAD_ID = 1;

/** Look up one work by its number, for pages that anchor on a specific plate. */
export function artworkById(id: number) {
  return artworks.find((artwork) => artwork.id === id) ?? artworks[0];
}

export const total = artworks.length;
