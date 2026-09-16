import type { Artwork } from "@/lib/types";

/** Three-digit catalogue number: 61 → "061". */
export function formatNumber(id: number) {
  return String(id).padStart(3, "0");
}

/** The short description under a work: posture, material and trunk. */
export function describe(artwork: Artwork) {
  return [artwork.posture, artwork.material, `${artwork.trunk} trunk`].join(" · ");
}
