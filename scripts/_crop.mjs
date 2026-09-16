import sharp from "sharp";
import plates from "../data/plates.json" with { type: "json" };
const OUT = process.argv[2];
const ids = process.argv.slice(3).map(Number);
const tiles = [];
for (const id of ids) {
  const p = plates.find((x) => x.id === id);
  const img = sharp(`public${p.src}`);
  const { width, height } = await img.metadata();
  // bottom 38% of the figure, where feet live
  const buf = await img
    .extract({ left: 0, top: Math.round(height * 0.62), width, height: height - Math.round(height * 0.62) })
    .resize({ width: 900 })
    .toBuffer();
  const meta = await sharp(buf).metadata();
  tiles.push({ id, buf, h: meta.height });
}
const LABEL = 44;
const totalH = tiles.reduce((s, t) => s + t.h + LABEL + 8, 0);
const composites = [];
let y = 0;
for (const t of tiles) {
  composites.push({
    input: Buffer.from(`<svg width="900" height="${LABEL}"><text x="6" y="33" font-family="Helvetica" font-size="34" font-weight="bold" fill="#b00">No. ${String(t.id).padStart(3,"0")}</text></svg>`),
    left: 0, top: y,
  });
  composites.push({ input: t.buf, left: 0, top: y + LABEL });
  y += t.h + LABEL + 8;
}
await sharp({ create: { width: 900, height: totalH, channels: 3, background: "#fff" } })
  .composite(composites).jpeg({ quality: 92 }).toFile(OUT);
console.log("wrote", OUT);
