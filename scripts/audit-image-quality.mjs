// Analiza cada imagen de producto y marca candidatas a "se ve mal / pixelada".
//
// Dos señales, porque son causas distintas del mismo sintoma:
//   1. Resolucion nativa baja: si el original es chico, se ve pixelado al
//      mostrarlo en la tarjeta (~280px) o mas grande en el modal (~1200px).
//      Deterministico, cero falsos positivos.
//   2. Desenfoque real (foto movida / fuera de foco): varianza del Laplaciano
//      sobre una copia normalizada a 400px de ancho (normalizar el tamano es
//      necesario porque la varianza escala con la resolucion; sin eso, fotos
//      grandes ganan puntos "de gratis"). Es una heuristica, no una certeza:
//      un bokeh de fondo intencional puede marcar falso positivo, por eso el
//      resultado se usa como lista de candidatas para revisar a ojo, no como
//      veredicto automatico.
//
// Uso: node scripts/audit-image-quality.mjs > /tmp/audit.json

import sharp from 'sharp';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BASE = path.join(ROOT, 'public', 'images', 'Categorias');

const LOW_RES_PX = 700; // lado corto por debajo de esto = candidata por resolucion
const BLUR_VARIANCE = 90; // varianza del laplaciano por debajo de esto = candidata por foco

async function laplacianVariance(filePath) {
  const { data, info } = await sharp(filePath)
    .resize(400, null, { withoutEnlargement: true })
    .grayscale()
    .convolve({ width: 3, height: 3, kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0] })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const n = info.width * info.height;
  let mean = 0;
  for (let i = 0; i < n; i++) mean += data[i];
  mean /= n;
  let variance = 0;
  for (let i = 0; i < n; i++) { const d = data[i] - mean; variance += d * d; }
  return variance / n;
}

const categories = await readdir(BASE, { withFileTypes: true });
const results = [];

for (const catDir of categories) {
  if (!catDir.isDirectory()) continue;
  const catPath = path.join(BASE, catDir.name);
  const products = await readdir(catPath, { withFileTypes: true });

  for (const prodDir of products) {
    if (!prodDir.isDirectory()) continue;
    const prodPath = path.join(catPath, prodDir.name);

    let metaRaw;
    try {
      metaRaw = await readFile(path.join(prodPath, 'metadata.txt'), 'utf8');
    } catch {
      continue;
    }
    const imagesLine = metaRaw.split('\n').find((l) => l.toLowerCase().startsWith('images:'));
    if (!imagesLine) continue;
    const images = imagesLine.split(':').slice(1).join(':').split(',').map((s) => s.trim()).filter(Boolean);

    for (const img of images) {
      const filePath = path.join(prodPath, img);
      let meta;
      try {
        meta = await sharp(filePath).metadata();
      } catch (e) {
        results.push({ category: catDir.name, product: prodDir.name, file: img, error: String(e.message || e) });
        continue;
      }
      const shortSide = Math.min(meta.width || 0, meta.height || 0);
      let variance = null;
      try {
        variance = await laplacianVariance(filePath);
      } catch {
        // some formats (e.g. odd CMYK jpg) can fail the raw pipeline; resolution check still applies
      }

      const lowRes = shortSide > 0 && shortSide < LOW_RES_PX;
      const blurry = variance != null && variance < BLUR_VARIANCE;

      if (lowRes || blurry) {
        results.push({
          category: catDir.name,
          product: prodDir.name,
          file: img,
          width: meta.width,
          height: meta.height,
          shortSide,
          variance: variance != null ? Math.round(variance * 10) / 10 : null,
          lowRes,
          blurry,
        });
      }
    }
  }
}

results.sort((a, b) => (a.shortSide || 9999) - (b.shortSide || 9999));
console.log(JSON.stringify({ total_candidates: results.length, results }, null, 2));
