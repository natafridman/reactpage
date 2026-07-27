// Precalcula UN solo JSON con el metadata de todos los productos.
//
// Sin esto, /productos pide un metadata.txt por producto: 103 requests, y la
// grilla no muestra nada hasta que responde el mas lento. Los 103 archivos
// juntos pesan ~43 KB, asi que un unico archivo los reemplaza a todos en un
// solo viaje.
//
// Se ejecuta en el build, antes de vite. El resultado va a public/ para que
// quede servido como estatico.
//
//   node scripts/generate-catalog-index.mjs

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseMetadata } from '../utils/productUtils.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const IMAGES_BASE_FOLDER = 'images/Categorias';
const OUT = path.join(PUBLIC, 'catalogo-index.json');

const manifest = JSON.parse(await readFile(path.join(PUBLIC, 'manifest.json'), 'utf8'));

const index = {};
let productos = 0;
const faltantes = [];

for (const [category, folders] of Object.entries(manifest)) {
  index[category] = [];

  for (const productFolder of folders) {
    const metadataPath = path.join(PUBLIC, IMAGES_BASE_FOLDER, category, productFolder, 'metadata.txt');

    let raw;
    try {
      raw = await readFile(metadataPath, 'utf8');
    } catch {
      // Un producto listado en el manifest sin metadata.txt. Se anota y se
      // sigue: el sitio ya tolera productos ausentes, y frenar el build por
      // esto dejaria el catalogo entero sin publicar.
      faltantes.push(`${category}/${productFolder}`);
      continue;
    }

    const metadata = parseMetadata(raw);
    index[category].push({
      productFolder,
      metadata,
      availableImages: metadata.images || [],
    });
    productos++;
  }
}

await writeFile(OUT, JSON.stringify(index), 'utf8');

const bytes = JSON.stringify(index).length;
console.log(`✅ catalogo-index.json: ${productos} productos, ${Object.keys(index).length} categorias, ${(bytes / 1024).toFixed(1)} KB`);
if (faltantes.length) {
  console.warn(`⚠️  ${faltantes.length} sin metadata.txt: ${faltantes.join(', ')}`);
}
