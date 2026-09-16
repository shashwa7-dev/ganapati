import sharp from "sharp";
import plates from "../data/plates.json" with { type: "json" };
const OUT = process.argv[2];
const ids = process.argv.slice(3).map(Number);
const tiles = [];
for (const id of ids) {
  const p = plates.find((x) => x.id === id);
  const img = sharp(`public${p.src}`);
  const { width, height } = await img.metadata();
  const top = Math.round(height * 0.18), h = Math.round(height * 0.50);
  const buf = await img.extract({ left: 0, top, width, height: h }).resize({ width: 1000 }).toBuffer();
  tiles.push({ id, buf, h: (await sharp(buf).metadata()).height });
}
const L = 44;
const totalH = tiles.reduce((s, t) => s + t.h + L + 8, 0);
const comps = []; let y = 0;
for (const t of tiles) {
  comps.push({ input: Buffer.from(`<svg width="1000" height="${L}"><text x="6" y="33" font-family="Helvetica" font-size="34" font-weight="bold" fill="#b00">No. ${String(t.id).padStart(3,"0")}</text></svg>`), left: 0, top: y });
  comps.push({ input: t.buf, left: 0, top: y + L });
  y += t.h + L + 8;
}
await sharp({ create: { width: 1000, height: totalH, channels: 3, background: "#fff" } })
  .composite(comps).jpeg({ quality: 92 }).toFile(OUT);
console.log("ok");
