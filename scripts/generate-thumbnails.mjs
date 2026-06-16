// Generate lightweight sibling thumbnails for every product image, WITHOUT touching originals.
// For  <dir>/<name>.<ext>  emit:
//   <dir>/.thumbs/<name>.webp       (~280px  — bubbles & product cards)
//   <dir>/.thumbs/<name>.med.webp   (~1200px — list-view hero & gallery; modal still opens the original)
// Incremental: skips outputs that are newer than their source. Safe to run on every build.
import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = 'public/images/Categorias';
const THUMB_W = 280;
const MED_W = 1200;
const THUMB_Q = 72;
const MED_Q = 80;
const IMG_RE = /\.(jpe?g|png|webp)$/i;

let made = 0, skipped = 0, failed = 0, bytesBefore = 0, bytesAfter = 0;

async function mtime(p) {
  try { return (await stat(p)).mtimeMs; } catch { return 0; }
}

async function variant(src, out, width, quality, srcMtime) {
  // Incremental: skip if output exists and is newer than the source.
  if (await mtime(out) >= srcMtime && srcMtime > 0) { skipped++; return; }
  try {
    await sharp(src, { failOn: 'none' })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toFile(out);
    made++;
    bytesAfter += (await stat(out)).size;
  } catch (e) {
    failed++;
    console.warn(`  ! ${src}: ${e.message}`);
  }
}

async function walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }

  for (const ent of entries) {
    if (ent.name === '.thumbs') continue;            // never recurse into thumbs
    const full = join(dir, ent.name);
    if (ent.isDirectory()) { await walk(full); continue; }
    if (!IMG_RE.test(ent.name)) continue;

    const srcMtime = await mtime(full);
    bytesBefore += (await stat(full)).size;
    const base = ent.name.replace(IMG_RE, '');
    const thumbsDir = join(dir, '.thumbs');
    await mkdir(thumbsDir, { recursive: true });
    await variant(full, join(thumbsDir, `${base}.webp`), THUMB_W, THUMB_Q, srcMtime);
    await variant(full, join(thumbsDir, `${base}.med.webp`), MED_W, MED_Q, srcMtime);
  }
}

const t0 = Date.now();
await walk(ROOT);
const mb = (b) => (b / 1024 / 1024).toFixed(1);
console.log(
  `\nThumbnails: ${made} generated, ${skipped} up-to-date, ${failed} failed in ${((Date.now() - t0) / 1000).toFixed(1)}s.`
);
console.log(`Originals scanned: ${mb(bytesBefore)} MB → new thumb bytes this run: ${mb(bytesAfter)} MB`);
