import { mkdir } from "node:fs/promises";
import sharp from "sharp";
import plates from "../data/plates.json" with { type: "json" };

const OUT = process.argv[2];
const TW = 760, TH = 944, PAD = 10, LABEL = 46;
const COLS = 2, ROWS = 2, PER = COLS * ROWS;
await mkdir(OUT, { recursive: true });

const sheetW = COLS * TW + (COLS + 1) * PAD;
const sheetH = ROWS * (TH + LABEL) + (ROWS + 1) * PAD;

for (let s = 0; s * PER < plates.length; s++) {
  const group = plates.slice(s * PER, s * PER + PER);
  const composites = [];
  for (const [i, p] of group.entries()) {
    const col = i % COLS, row = Math.floor(i / COLS);
    const left = PAD + col * (TW + PAD);
    const top = PAD + row * (TH + LABEL + PAD);
    const buf = await sharp(`public${p.src}`)
      .resize({ width: TW, height: TH, fit: "inside" }).toBuffer();
    composites.push({ input: buf, left, top: top + LABEL });
    composites.push({
      input: Buffer.from(
        `<svg width="${TW}" height="${LABEL}"><text x="6" y="34" font-family="Helvetica" font-size="38" font-weight="bold" fill="#000">No. ${String(p.id).padStart(3, "0")}</text></svg>`
      ),
      left, top,
    });
  }
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: "#fff" } })
    .composite(composites).jpeg({ quality: 88 })
    .toFile(`${OUT}/sheet-${String(s + 1).padStart(2, "0")}.jpg`);
}
console.log("sheets:", Math.ceil(plates.length / PER));
