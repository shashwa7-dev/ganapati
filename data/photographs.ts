import generated from "@/data/photographs.generated.json";

/**
 * Photographs used on the story page.
 *
 * Every image is freely licensed and carries its author and licence. The file
 * `photographs.generated.json` is written by `npm run photographs`, which
 * fetches them from Wikimedia Commons along with their credits.
 *
 * To use your own photograph instead, drop it into `public/photographs/` and
 * add an entry to `overrides` below. An override wins over the generated one.
 */
export type Photograph = {
  slot: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  credit: string;
  source?: string;
  blurDataURL?: string;
};

const overrides: Photograph[] = [
  // {
  //   slot: "lalbaugcha-raja",
  //   src: "/photographs/lalbaugcha-raja.avif",
  //   width: 1620, height: 2160,
  //   alt: "The Lalbaugcha Raja murti, crowned and garlanded, at darshan.",
  //   caption: "Lalbaugcha Raja",
  //   credit: "Photograph by ...",
  // },
];

const byslot = new Map<string, Photograph>(
  (generated as Photograph[]).map((photo) => [photo.slot, photo]),
);
for (const photo of overrides) byslot.set(photo.slot, photo);

export const photographs = byslot;

export function photo(slot: string): Photograph | undefined {
  return byslot.get(slot);
}
