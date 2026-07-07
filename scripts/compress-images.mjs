import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join } from 'path';

const inputDir = 'public/images/Categorias/Nuevos';
const outputDir = 'public/images/Categorias/Nuevos_compressed';
const MAX_WIDTH = 1200;
const QUALITY = 80;

await mkdir(outputDir, { recursive: true });

const files = (await readdir(inputDir)).filter(f => /\.(jpe?g|png|webp)$/i.test(f));

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const inputPath = join(inputDir, file);
  const outputPath = join(outputDir, file);
  const before = (await stat(inputPath)).size;
  totalBefore += before;

  await sharp(inputPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(outputPath);

  const after = (await stat(outputPath)).size;
  totalAfter += after;

  const saved = ((1 - after / before) * 100).toFixed(1);
  console.log(`${file}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (${saved}% reducido)`);
}

console.log(`\nTotal: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}% reducido)`);
console.log(`\nImagenes comprimidas en: ${outputDir}`);
console.log('Para reemplazar las originales, borra la carpeta Nuevos y renombra Nuevos_compressed a Nuevos.');
