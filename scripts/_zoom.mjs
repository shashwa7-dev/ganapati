import sharp from "sharp";
const [OUT, file, topPct, heightPct] = process.argv.slice(2);
const img = sharp(file);
const { width, height } = await img.metadata();
const top = Math.round(height * Number(topPct));
const h = Math.min(Math.round(height * Number(heightPct)), height - top);
await img.extract({ left: 0, top, width, height: h })
  .resize({ width: 1400 }).jpeg({ quality: 95 }).toFile(OUT);
console.log("wrote", OUT);
