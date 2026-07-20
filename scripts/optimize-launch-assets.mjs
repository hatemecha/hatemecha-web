import sharp from "sharp";
import path from "path";
import fs from "fs";

const root = process.cwd();
const assets = path.join(root, "public", "assets");

async function makeHomeSm(sourceName, outName) {
  const src = path.join(assets, sourceName);
  const out = path.join(assets, outName);
  const meta = await sharp(src).metadata();
  const w = meta.width ?? 800;
  const targetW = Math.min(900, w);
  await sharp(src)
    .rotate()
    .resize({ width: targetW, withoutEnlargement: true })
    .webp({ quality: 74, effort: 6 })
    .toFile(out);
  const st = fs.statSync(out);
  console.log(outName, `${Math.round(st.size / 1024)}KB`, `${targetW}w`);
}

await makeHomeSm("home1.webp", "home1-sm.webp");
await makeHomeSm("home2.webp", "home2-sm.webp");
await makeHomeSm("home3.webp", "home3-sm.webp");

const barcode = path.join(assets, "barcode-hatemecha.webp");
await sharp(barcode).resize(32, 32, { fit: "cover" }).png().toFile(path.join(assets, "favicon-32.png"));
await sharp(barcode)
  .resize(180, 180, { fit: "cover" })
  .png()
  .toFile(path.join(assets, "apple-touch-icon.png"));
await sharp(barcode).resize(48, 48, { fit: "cover" }).png().toFile(path.join(assets, "favicon.ico"));
console.log("favicons ok");

const ogSvg = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#1a0505"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="48" y="48" width="1104" height="534" fill="none" stroke="#e10600" stroke-width="3"/>
  <text x="600" y="300" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="96" font-weight="900" fill="#e10600" letter-spacing="8">HATEMECHA</text>
  <text x="600" y="380" text-anchor="middle" font-family="Courier New, monospace" font-size="28" fill="#f0ece4" letter-spacing="6">diseño · foto · proyectos</text>
  <text x="600" y="440" text-anchor="middle" font-family="Courier New, monospace" font-size="20" fill="#e10600" letter-spacing="4">Bahía Blanca</text>
</svg>`);

await sharp(ogSvg).webp({ quality: 85 }).toFile(path.join(assets, "og-card.webp"));
console.log("og-card", `${Math.round(fs.statSync(path.join(assets, "og-card.webp")).size / 1024)}KB`);
