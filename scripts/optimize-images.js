/* Compression des images sources (hero, logo) en conservant les noms de fichiers.
   Usage : node scripts/optimize-images.js */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "public", "images");
const jobs = [
  { file: "hero-home.png", width: 1600 },
  { file: "hero-chauffeurs.png", width: 1600 },
  { file: "hero-conseils.png", width: 1600 },
  { file: "hero-offres-emploi.png", width: 1600 },
  { file: "hero-carte-chauffeurs.png", width: 1600 },
  { file: "hero-trouver-chauffeur.png", width: 1600 },
  { file: "logo.png", width: 512 },
  { file: "logo-badge.png", width: 512 },
];

(async () => {
  for (const { file, width } of jobs) {
    const p = path.join(dir, file);
    if (!fs.existsSync(p)) continue;
    const before = fs.statSync(p).size;
    const buf = await sharp(p)
      .resize({ width, withoutEnlargement: true })
      .png({ palette: true, quality: 80, compressionLevel: 9, effort: 8 })
      .toBuffer();
    if (buf.length < before) fs.writeFileSync(p, buf);
    console.log(file, Math.round(before / 1024) + "KB ->", Math.round(Math.min(before, buf.length) / 1024) + "KB");
  }
})();
