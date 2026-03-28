import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { removeBackground } from '@imgly/background-removal-node';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const IMAGES_BASE = path.join(PUBLIC, 'images', 'Categorias');
const CACHE_DIR = path.join(__dirname, '.bg-cache');

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function parseMetadata(text) {
  const metadata = {};
  text.trim().split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const k = key.trim().toLowerCase();
      const v = valueParts.join(':').trim();
      if (k === 'images' || k === 'videos') {
        metadata[k] = v.split(',').map(i => i.trim()).filter(Boolean);
      } else {
        metadata[k] = v;
      }
    }
  });
  return metadata;
}

function cacheKey(imgPath) {
  const stat = fs.statSync(imgPath);
  return path.basename(imgPath).replace(/[^a-zA-Z0-9.]/g, '_') + '_' + stat.size + '.png';
}

async function removeBg(imgPath) {
  const key = cacheKey(imgPath);
  const cachePath = path.join(CACHE_DIR, key);

  if (fs.existsSync(cachePath)) {
    console.log(`  Cached: ${path.basename(imgPath)}`);
    return;
  }

  const ext = path.extname(imgPath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  const blob = new Blob([fs.readFileSync(imgPath)], { type: mime });
  const result = await removeBackground(blob, { output: { format: 'image/png' } });
  const buf = Buffer.from(await result.arrayBuffer());
  fs.writeFileSync(cachePath, buf);
  console.log(`  Done: ${path.basename(imgPath)}`);
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'manifest.json'), 'utf-8'));
  const heroImages = [];

  for (const [category, items] of Object.entries(manifest)) {
    for (const productName of items) {
      const productDir = path.join(IMAGES_BASE, category, productName);
      const metaPath = path.join(productDir, 'metadata.txt');
      if (!fs.existsSync(metaPath)) continue;

      const meta = parseMetadata(fs.readFileSync(metaPath, 'utf-8'));
      const images = (meta.images || [])
        .map(img => path.join(productDir, img))
        .filter(p => fs.existsSync(p));

      if (images.length > 0) {
        heroImages.push({ name: `${category}/${productName}`, path: images[0] });
      }
    }
  }

  console.log(`Processing ${heroImages.length} hero images...\n`);

  for (let i = 0; i < heroImages.length; i++) {
    const img = heroImages[i];
    console.log(`[${i + 1}/${heroImages.length}] ${img.name}`);
    try {
      await removeBg(img.path);
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
    }
  }

  console.log('\nAll done!');
}

main();
