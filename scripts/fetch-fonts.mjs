// Descarga Fraunces e Inter desde Google Fonts y las deja servidas por el
// propio dominio.
//
// Por que: index.html traia un <link rel="stylesheet"> a fonts.googleapis.com,
// que BLOQUEA el primer pintado y encima obliga a resolver DNS y negociar TLS
// con un tercero antes de que se vea nada. Sirviendolas desde el mismo origen
// se ahorra ese viaje completo.
//
// Se pide el CSS con user-agent de navegador moderno para que Google devuelva
// woff2 variable (un solo archivo cubre todos los pesos) en vez de ttf por peso.
// Solo se guardan los subsets latin y latin-ext: el sitio es en espanol y
// vietnamese, cyrillic y greek serian peso muerto.
//
// No corre en el build. Las fuentes no cambian; se ejecuta a mano si hace falta:
//   node scripts/fetch-fonts.mjs

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'fonts');
const OUT_CSS = path.join(ROOT, 'fonts.css');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const URL_CSS =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,600&family=Inter:wght@300;400;500;600&display=swap';

const css = await (await fetch(URL_CSS, { headers: { 'User-Agent': UA } })).text();

const faces = css
  .split('@font-face')
  .slice(1)
  .map((b) => ({
    family: (b.match(/font-family: '([^']+)'/) || [])[1],
    style: (b.match(/font-style: (\w+)/) || [])[1],
    weight: (b.match(/font-weight: ([\d ]+)/) || [])[1],
    stretch: (b.match(/font-stretch: ([^;]+);/) || [])[1],
    url: (b.match(/url\((https:[^)]+)\)/) || [])[1],
    range: (b.match(/unicode-range:([^;]+);/) || [])[1],
  }))
  .filter((f) => f.url && /U\+0000|U\+0100/.test(f.range || ''));

await mkdir(OUT_DIR, { recursive: true });

// Fraunces e Inter son variables: varios pesos comparten el mismo woff2, asi que
// se descarga una sola vez por URL y se reusa en cada @font-face.
const localName = new Map();
for (const f of faces) {
  if (localName.has(f.url)) continue;
  const subset = /U\+0100/.test(f.range) ? 'latin-ext' : 'latin';
  const name = `${f.family.toLowerCase()}-${f.style}-${subset}.woff2`;
  const bytes = Buffer.from(await (await fetch(f.url, { headers: { 'User-Agent': UA } })).arrayBuffer());
  await writeFile(path.join(OUT_DIR, name), bytes);
  localName.set(f.url, name);
  console.log(`  ${(bytes.length / 1024).toFixed(1).padStart(6)} KB  ${name}`);
}

const rules = faces.map((f) => {
  const lines = [
    `  font-family: '${f.family}';`,
    `  font-style: ${f.style};`,
    `  font-weight: ${f.weight};`,
    f.stretch ? `  font-stretch: ${f.stretch};` : null,
    `  font-display: swap;`,
    `  src: url('/fonts/${localName.get(f.url)}') format('woff2');`,
    `  unicode-range:${f.range};`,
  ].filter(Boolean);
  return `@font-face {\n${lines.join('\n')}\n}`;
});

const header = `/* Generado por scripts/fetch-fonts.mjs. No editar a mano.
   Fuentes servidas desde el propio dominio para no bloquear el primer pintado
   con un pedido a fonts.googleapis.com. */\n\n`;

await writeFile(OUT_CSS, header + rules.join('\n\n') + '\n', 'utf8');

console.log(`\n✅ ${localName.size} archivos en public/fonts/, ${faces.length} reglas @font-face en fonts.css`);
