// Optimize client logos for the social-proof wall, WITHOUT touching originals.
// Source logos are 1-2 MB PNGs shown at ~110px; this emits small webp siblings
// (alpha preserved) into public/images/Clientes/.opt/<slug>.webp.
// Incremental: skips outputs newer than their source. Run on every build.
import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const DIR = 'public/images/Clientes';
const OUT = join(DIR, '.opt');
const MAX = 440;          // ~4x the rendered logo height for crisp retina
const QUALITY = 86;
const IMG_RE = /\.(jpe?g|png|webp)$/i;

// filename (without ext) -> url-safe slug
export const slug = (name) =>
  name.replace(IMG_RE, '').trim().toLowerCase().replace(/\s+/g, '-');

async function mtime(p) {
  try { return (await stat(p)).mtimeMs; } catch { return 0; }
}

let made = 0, skipped = 0, failed = 0;

async function run() {
  let entries;
  try { entries = await readdir(DIR, { withFileTypes: true }); } catch { return; }
  await mkdir(OUT, { recursive: true });

  for (const ent of entries) {
    if (!ent.isFile() || !IMG_RE.test(ent.name)) continue;
    const src = join(DIR, ent.name);
    const out = join(OUT, `${slug(ent.name)}.webp`);
    const srcMtime = await mtime(src);
    if (await mtime(out) >= srcMtime && srcMtime > 0) { skipped++; continue; }
    try {
      await sharp(src, { failOn: 'none' })
        // Crop the uniform background border (transparent or near-white) so every
        // logo is tight to its mark; this also removes opaque-canvas boxes.
        .trim({ threshold: 15 })
        .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 4 })
        .toFile(out);
      made++;
    } catch (e) {
      failed++;
      console.warn(`  ! ${src}: ${e.message}`);
    }
  }
  console.log(`Client logos: ${made} optimized, ${skipped} up-to-date, ${failed} failed.`);
}

run();
