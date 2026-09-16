/**
 * Turns the raw `originals/` exports into web-ready plates in `public/images/`
 * and emits `data/plates.json` (stable ids + blur placeholders).
 *
 * Run: node scripts/prepare-images.mjs
 */
import { readdir, mkdir, writeFile, copyFile, rm } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ORIGINALS = "originals";
const OUT_DIR = path.join("public", "images");
const REVIEW_DIR = "review";
const MAX_WIDTH = 1500;
const QUALITY = 55; // AVIF quality, roughly equivalent to JPEG 82

/** Orders raw exports so ids stay stable across runs. */
function sortKey(name) {
  const numbered = name.match(/^generation-1 \((\d+)\)\.jpg$/i);
  if (numbered) return [1, Number(numbered[1]), name];
  if (/^generation-1\.jpg$/i.test(name)) return [0, 0, name];
  return [2, 0, name]; // timestamped exports trail the numbered run
}

const files = (await readdir(ORIGINALS))
  .filter((f) => /\.jpe?g$/i.test(f))
  .sort((a, b) => {
    const [ga, na, sa] = sortKey(a);
    const [gb, nb, sb] = sortKey(b);
    return ga - gb || na - nb || sa.localeCompare(sb);
  });

// Exclusions are read straight from the TypeScript source, so there is one
// list rather than two that can drift apart.
const excludeSrc = await readFile("data/excluded.ts", "utf8");
const excludedIds = new Set(
  [...excludeSrc.matchAll(/\{ id: (\d+), reason: "([a-z-]+)"/g)].map((m) => Number(m[1])),
);
const reasonById = new Map(
  [...excludeSrc.matchAll(/\{ id: (\d+), reason: "([a-z-]+)"/g)].map((m) => [Number(m[1]), m[2]]),
);
const armsIds = new Set(
  (excludeSrc.match(/moreThanFourArms: number\[\] = \[([\s\S]*?)\]/)?.[1] ?? "")
    .split(",").map((x) => Number(x.trim())).filter(Boolean),
);

await mkdir(OUT_DIR, { recursive: true });
await mkdir("data", { recursive: true });
await rm(REVIEW_DIR, { recursive: true, force: true });

const review = [];
const plates = [];
for (const [i, file] of files.entries()) {
  const n = String(i + 1).padStart(3, "0");
  const slug = `ganesha-${n}`;
  const id = i + 1;

  // Held-out works are copied for review rather than published.
  const flagged = excludedIds.has(id) || armsIds.has(id);
  if (flagged) {
    const folder = path.join(REVIEW_DIR, reasonById.get(id) ?? "extra-arms");
    await mkdir(folder, { recursive: true });
    await copyFile(path.join(ORIGINALS, file), path.join(folder, `${n}-${file}`));
    review.push({ id, file: `${n}-${file}`, reason: reasonById.get(id) ?? "extra-arms" });
  }
  if (excludedIds.has(id)) {
    process.stdout.write(`\r${i + 1}/${files.length} (held out: ${n})`);
    continue;
  }
  const src = path.join(ORIGINALS, file);
  const image = sharp(src).rotate();
  const { width, height } = await image.metadata();

  await image
    .resize({ width: Math.min(MAX_WIDTH, width), withoutEnlargement: true })
    .avif({ quality: QUALITY, effort: 4 })
    .toFile(path.join(OUT_DIR, `${slug}.avif`));

  // Kept as JPEG on purpose: a 14px data URI that every browser can decode.
  const blur = await sharp(src)
    .resize({ width: 14 })
    .jpeg({ quality: 40 })
    .toBuffer();

  plates.push({
    id,
    slug,
    src: `/images/${slug}.avif`,
    origin: file,
    width,
    height,
    blurDataURL: `data:image/jpeg;base64,${blur.toString("base64")}`,
  });
  process.stdout.write(`\r${i + 1}/${files.length}`);
}

await writeFile("data/plates.json", JSON.stringify(plates, null, 2) + "\n");

if (review.length > 0) {
  const lines = review
    .sort((a, b) => a.reason.localeCompare(b.reason) || a.id - b.id)
    .map((r) => `${r.reason.padEnd(12)} No. ${String(r.id).padStart(3, "0")}  ${r.file}`);
  await writeFile(path.join(REVIEW_DIR, "MANIFEST.txt"), lines.join("\n") + "\n");
}

console.log(`\nWrote ${plates.length} plates to ${OUT_DIR} and data/plates.json`);
console.log(`Held out of the collection: ${files.length - plates.length}`);
console.log(`Copied to ${REVIEW_DIR}/ for review: ${review.length}`);
