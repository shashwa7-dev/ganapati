/**
 * Downloads the story page's photographs from Wikimedia Commons, keeping the
 * author and licence of each one, and writes them to public/photographs/.
 *
 * Every image here is freely licensed. Run: node scripts/fetch-photographs.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const API = "https://commons.wikimedia.org/w/api.php";
const OUT = path.join("public", "photographs");
const WIDTH = 1600;

/** slot -> Commons file, plus the caption and alt text we want to show. */
const WANTED = [
  { slot: "home", file: "File:Ganesh Chaturthi 2021.jpg",
    caption: "Ganpati at home",
    alt: "A Ganesha murti installed at home for Ganesh Chaturthi, with lamps, fruit, a kalash and a plate of modak." },
  { slot: "welcome", file: "File:Ganesh chaturthi puja 01.jpg",
    caption: "Garlanded and welcomed",
    alt: "A Ganesha murti garlanded with marigold and jasmine during Ganesh Chaturthi." },
  { slot: "darshan", file: "File:Lalbaugcha Raja just outside its Pandal at Lalgaug, Mumbai.JPG",
    caption: "Lalbaugcha Raja, outside the pandal at Lalbaug",
    alt: "The Lalbaugcha Raja idol outside its pandal in Lalbaug, Mumbai." },
  { slot: "tilak", file: "File:Bal Gangadhar Tilak crop.jpg",
    caption: "Lokmanya Bal Gangadhar Tilak",
    alt: "Portrait photograph of Lokmanya Bal Gangadhar Tilak." },
  { slot: "lalbaugcha-raja", file: "File:Lalbaugh Ganesha.jpg",
    caption: "Lalbaugcha Raja",
    alt: "The Lalbaugcha Raja murti, crowned and richly ornamented, seated before a carved backdrop." },
  { slot: "raja-alt", file: "File:Lalbaugcha Raja.jpg",
    caption: "Lalbaugcha Raja during Ganeshotsav",
    alt: "The Lalbaugcha Raja idol garlanded during Ganeshotsav in Mumbai." },
  { slot: "procession", file: "File:Lalbaugcha Raja on its way for viserjan.JPG",
    caption: "On the way to visarjan",
    alt: "Lalbaugcha Raja carried through the streets of Mumbai on the way to immersion." },
  { slot: "murti", file: "File:Ganesh clay images.jpg",
    caption: "Clay murtis, waiting",
    alt: "Rows of unpainted clay Ganesha murtis drying in a workshop." },
  { slot: "visarjan", file: "File:Ganesh Visarjan at Futala by Chetan Gole.jpg",
    caption: "Visarjan at Futala lake, Nagpur",
    alt: "Devotees carrying a Ganesha idol into the water at Futala lake for visarjan." },
  { slot: "modak", file: "File:उकडीचे मोदक२.jpg",
    caption: "Ukadiche modak",
    alt: "A plate of steamed ukadiche modak, the sweet offered to Ganesha." },
];

function strip(html) {
  const text = (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  // Commons often nests the same name twice ("Unknown author Unknown author").
  const doubled = text.match(/^(.+?)\s*\1$/);
  return doubled ? doubled[1].trim() : text;
}

async function info(files) {
  const url = new URL(API);
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", files.join("|"));
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size|extmetadata");
  url.searchParams.set("format", "json");
  const res = await fetch(url, { headers: { "User-Agent": "ganapati-story/1.0" } });
  const data = await res.json();
  const out = new Map();
  for (const page of Object.values(data.query.pages)) {
    const ii = page.imageinfo?.[0];
    if (!ii) continue;
    const meta = ii.extmetadata ?? {};
    out.set(page.title, {
      artist: strip(meta.Artist?.value) || "Unknown",
      license: strip(meta.LicenseShortName?.value) || "See source",
      source: ii.descriptionurl,
    });
  }
  return out;
}

await mkdir(OUT, { recursive: true });
const meta = await info(WANTED.map((w) => w.file));
const records = [];

for (const want of WANTED) {
  const m = meta.get(want.file);
  if (!m) {
    console.warn(`  skipped (no info): ${want.file}`);
    continue;
  }
  const name = want.file.replace(/^File:/, "");
  const src = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=${WIDTH}`;
  const res = await fetch(src, { headers: { "User-Agent": "ganapati-story/1.0" } });
  if (!res.ok) {
    console.warn(`  skipped (${res.status}): ${want.file}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());

  const image = sharp(buf).rotate();
  const { width, height } = await image.metadata();
  await image.avif({ quality: 55, effort: 4 }).toFile(path.join(OUT, `${want.slot}.avif`));

  const blur = await sharp(buf).resize({ width: 14 }).jpeg({ quality: 40 }).toBuffer();

  records.push({
    slot: want.slot,
    src: `/photographs/${want.slot}.avif`,
    width, height,
    alt: want.alt,
    caption: want.caption,
    credit: `${m.artist} · ${m.license}`,
    source: m.source,
    blurDataURL: `data:image/jpeg;base64,${blur.toString("base64")}`,
  });
  console.log(`  ok  ${want.slot}  ${width}x${height}  ${m.license}`);
}

await writeFile("data/photographs.generated.json", JSON.stringify(records, null, 2) + "\n");
console.log(`\nWrote ${records.length} photographs.`);
