// One-off: inject a `tags:` line into each Cinturones metadata.txt.
// Tags: gender (hombre/mujer) + origin (importado/nacional). A belt can have several.
// Origin heuristic: genuine "Cuero"/Gamuza => nacional, "Simil Cuero" => importado.
// Gender heuristic: decorative/novelty pieces => mujer; classic leather => unisex.
// All of this lives in editable metadata.txt files - adjust any `tags:` line freely.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'public', 'images', 'Categorias', 'Cinturones');

// Normalize keys so accents (ñ) never break the lookup.
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const RAW = {
  'Cinturon Argolla': ['hombre', 'mujer', 'nacional'],
  'Cinturon Ancho': ['hombre', 'mujer', 'nacional'],
  'Cinturon Basico': ['hombre', 'mujer', 'nacional'],
  'Cinturon Bordado Tachas': ['mujer', 'importado'],
  'Cinturon Corazon': ['mujer', 'importado'],
  'Cinturon Graneado': ['hombre', 'mujer', 'nacional'],
  'Cinturon Estrella': ['hombre', 'mujer', 'importado'],
  'Cinturon Clasico': ['hombre', 'mujer', 'nacional'],
  'Cinturon Ancho Texturado': ['hombre', 'mujer', 'importado'],
  'Cinturon Charol': ['mujer', 'hombre', 'nacional'],
  'Cinturon Western Texturado': ['hombre', 'mujer', 'nacional'],
  'Cinturon Western Gamuza': ['hombre', 'mujer', 'nacional'],
  'Cinturon Floral Western': ['mujer', 'hombre', 'importado'],
  'Cinturon Cosido': ['hombre', 'mujer', 'nacional'],
  'Cinturon Gemas Fino': ['mujer', 'importado'],
  'Cinturon Grabado Tachas': ['hombre', 'mujer', 'importado'],
  'Cinturon Hebilla Organica': ['hombre', 'mujer', 'nacional'],
  'Cinturon Mini Tachas': ['hombre', 'mujer', 'importado'],
  'Cinturon Ojales': ['hombre', 'mujer', 'nacional'],
  'Cinturon Vintage': ['hombre', 'mujer', 'nacional'],
  'Cinturon Hebilla Lisa Ancho': ['mujer', 'hombre', 'importado'],
  'Cinturon Ovalado': ['hombre', 'mujer', 'nacional'],
  'Cinturon Gamuza': ['hombre', 'mujer', 'nacional'],
  'Cinturon Gemas': ['mujer', 'importado'],
  'Cinturon Vestir': ['hombre', 'mujer', 'nacional'],
  'Cinturon Ojales Metalicos': ['hombre', 'mujer', 'importado'],
  'Cinturon Estampado Tachas': ['hombre', 'mujer', 'importado'],
  'Cinturon Liso': ['hombre', 'mujer', 'nacional'],
  'Cinturon Pasador Fino': ['hombre', 'mujer', 'importado'],
  'Cinturon Hebilla Lisa': ['hombre', 'mujer', 'importado'],
  'Cinturon Trenzado': ['hombre', 'mujer', 'nacional'],
  'Cinturon Moderno': ['hombre', 'mujer', 'nacional'],
  'Cinturon Reversible': ['hombre', 'mujer', 'nacional'],
  'Cinturon Tachas': ['hombre', 'mujer', 'nacional'],
  'Cinturon Ojales y Tachas': ['hombre', 'mujer', 'importado'],
  'Cinturon Pelo': ['mujer', 'hombre', 'nacional'],
  'Cinturon Tachas Brillantes': ['mujer', 'importado'],
  'Cinturon Tachas Decorativas': ['hombre', 'mujer', 'importado'],
  'Cinturon Fino Clasico': ['hombre', 'mujer', 'importado'],
  'Cinturon Detalle PU': ['hombre', 'mujer', 'importado'],
  'Cinturon Tachas Pequenas': ['hombre', 'mujer', 'importado'],
  'Cinturon Tachas Ancho': ['mujer', 'hombre', 'importado'],
  'Cinturon Tachas Fino': ['hombre', 'mujer', 'importado'],
  'Cinturon Tachas Clasico': ['hombre', 'mujer', 'importado'],
  'Cinturon Texturado Tachas': ['hombre', 'mujer', 'importado'],
  'Cinturon Tachas y Ojales': ['hombre', 'mujer', 'importado'],
  'Cinturon Pasador Metalico': ['hombre', 'mujer', 'importado'],
};

const MAP = new Map(Object.entries(RAW).map(([k, v]) => [norm(k), v]));

const folders = readdirSync(DIR).filter((f) => statSync(join(DIR, f)).isDirectory());
let done = 0;
const missing = [];

for (const folder of folders) {
  const tags = MAP.get(norm(folder));
  if (!tags) { missing.push(folder); continue; }

  const file = join(DIR, folder, 'metadata.txt');
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { missing.push(folder + ' (no metadata)'); continue; }

  // Drop any existing tags line, keep everything else, then append fresh.
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => !/^\s*tags\s*:/i.test(l));
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  lines.push(`tags: ${tags.join(', ')}`);
  writeFileSync(file, lines.join('\n') + '\n', 'utf8');
  done++;
}

console.log(`Tagged ${done}/${folders.length} belts.`);
if (missing.length) console.log('No tags for:', missing.join(' | '));
