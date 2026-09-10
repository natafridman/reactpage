// Colores de producto derivados del contenido: el catalogo no tiene un campo
// estructurado de color, pero las descripciones ("Disponible en Suela, Negra"),
// titulos, tags y nombres de archivo (BARI_Negra_1.jpeg) lo dicen. Se agrupan en
// una docena de familias con su muestra, para el filtro por color de la tienda.
import { normalizeText } from '/utils/productUtils.js';

export const COLOR_GROUPS = [
  { key: 'negro', label: 'Negro', swatch: '#1f1f1f', words: ['negro', 'negra', 'black'] },
  { key: 'marron', label: 'Marrón', swatch: '#5a3a26', words: ['marron', 'chocolate', 'tabaco', 'cafe', 'moka'] },
  { key: 'suela', label: 'Suela', swatch: '#b5773f', words: ['suela', 'camel', 'cognac', 'habano', 'tostado', 'caramelo', 'miel'] },
  { key: 'beige', label: 'Beige', swatch: '#d9c6a5', light: true, words: ['beige', 'natural', 'crema', 'arena', 'nude', 'hueso'] },
  { key: 'blanco', label: 'Blanco', swatch: '#f4f4f2', light: true, words: ['blanco', 'blanca', 'white'] },
  { key: 'gris', label: 'Gris', swatch: '#8a8a8a', words: ['gris', 'peltre', 'taupe', 'plomo'] },
  { key: 'azul', label: 'Azul', swatch: '#2f4a7a', words: ['azul', 'celeste', 'turquesa', 'marino', 'navy'] },
  { key: 'verde', label: 'Verde', swatch: '#4f6b3a', words: ['verde', 'oliva', 'militar'] },
  { key: 'rojo', label: 'Rojo', swatch: '#9a2a2a', words: ['rojo', 'roja', 'bordo', 'vino'] },
  { key: 'rosa', label: 'Rosa', swatch: '#d98fa6', light: true, words: ['rosa', 'fucsia', 'lila', 'violeta'] },
  { key: 'metal', label: 'Metalizado', light: true, swatch: 'linear-gradient(135deg, #cfcfcf, #8f8f8f 45%, #e6d3a3)', words: ['plateado', 'plateada', 'plata', 'dorado', 'dorada', 'oro', 'bronce', 'cobre', 'tornasol'] },
  { key: 'animal', label: 'Animal print', swatch: 'radial-gradient(circle at 30% 30%, #2a2018 0 22%, transparent 24%), radial-gradient(circle at 70% 65%, #2a2018 0 20%, transparent 22%), #c9a26b', words: ['animal print', 'leopardo'] },
];

const WORD_INDEX = COLOR_GROUPS.flatMap((g) => g.words.map((w) => [w, g.key]));

// Texto donde buscar: descripcion, titulo, subtitulo, tags y nombres de archivo
// (con _ y - como espacios, sin extension).
function haystack(p) {
  const m = p.metadata || {};
  const tags = Array.isArray(m.tags) ? m.tags.join(' ') : '';
  const files = (p.availableImages || [])
    .map((f) => String(f).replace(/\.[a-z0-9]+$/i, '').replace(/[_\-().]+/g, ' '))
    .join(' ');
  const raw = [m.description, m.title, m.subtitle, tags, files].filter(Boolean).join(' ');
  const norm = String(normalizeText(raw) || raw).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ');
  return ' ' + norm + ' ';
}

// Familias de color presentes en un producto, en el orden de COLOR_GROUPS.
export function productColors(p) {
  const hay = haystack(p);
  const found = new Set();
  for (const [w, key] of WORD_INDEX) {
    if (hay.includes(' ' + w + ' ')) found.add(key);
  }
  return COLOR_GROUPS.map((g) => g.key).filter((k) => found.has(k));
}
