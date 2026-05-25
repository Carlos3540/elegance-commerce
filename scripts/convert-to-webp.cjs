const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const files = [
  'src/assets/logo.png',
  'src/assets/logo-2x.jpeg',
  'src/assets/logo-4x.jpeg',
];

async function run() {
  for (const f of files) {
    const abs = path.resolve(f);
    if (!fs.existsSync(abs)) {
      console.warn(`Skipping missing file: ${f}`);
      continue;
    }
    const out = abs.replace(path.extname(abs), '.webp');
    try {
      await sharp(abs)
        .webp({ quality: 80 })
        .toFile(out);
      console.log(`Converted ${f} -> ${out}`);
    } catch (err) {
      console.error(`Error converting ${f}:`, err);
    }
  }
}

run();
