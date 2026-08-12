// ============================================================================
//  COTIZACIÓN B2YOU  ·  generador de PDF (pdfkit)
//  Uso: node scripts/generate-cotizacion.mjs
//  Para una cotización nueva: cambiá el bloque CONFIG (cliente, N°, fecha, ITEMS).
//  El nombre y la foto salen del catálogo por CÓDIGO. El PRECIO sale de
//  `notas_interno` de cada producto (precios por cantidad / por criterio); esas
//  notas nunca se publican en el sitio, pero acá se usan para cotizar.
// ============================================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const IMAGES_BASE = path.join(PUBLIC, 'images', 'Categorias');
const LOGO_PATH = path.join(PUBLIC, 'images', 'Branding', 'B2 B2YOU Header Landscape 2.png');

// ============================ CONFIG (editar) ==============================
const BUSINESS = {
  name: 'B2YOU',
  tagline: 'Accesorios de cuero personalizados con tu logo, para marcas y empresas',
  whatsapp: '+54 9 11 7827-9281',
  web: 'www.b2you.com.ar',
  email: '',        // completar si querés que salga
  instagram: '',    // ej: @b2you
  cuit: '',         // opcional
};

const QUOTE = {
  number: '1425',
  date: '2026-08-06',       // YYYY-MM-DD
  validityDays: 15,
  ivaNote: 'Precios en pesos argentinos. No incluyen IVA.',
  extraNote: 'Todos los productos se personalizan con tu logo (bordado, grabado o estampado).',
  paymentNote: 'Forma de pago, mínimos y plazo de producción a coordinar.',
  // Aclaración que va ANTES de la tabla (párrafos)
  aclaracion: [
    'Todo lo que mostramos son desarrollos que ya realizamos para otras marcas, que podemos desarrollar a pedido, o que importamos a través de un proveedor en China. Por eso no manejamos stock inmediato.',
    'Los productos importados requieren tiempos de importación. Si se opta por producirlos en cuero nacional (los ítems indicados como "En cuero"), mejoran los plazos de entrega, con valores distintos.',
    'Los cinturones tienen un mínimo de 20 unidades por modelo o variante.',
  ],
  // Escala de los números de las notas internas: 1000 => "250" significa $250.000
  notasScale: 1000,
};

const CLIENT = {
  name: 'Lucas Pons',
  company: '',
  contact: '+54 9 2345 65-8669',
};

// Ítems: { code, qty }. Precio auto desde notas_interno; se puede forzar con precio: N.
const ITEMS = [
  { code: 'BOL-001', qty: 1 },
  { code: 'MAL-001', qty: 1 },
  { code: 'NEC-001', qty: 1 },
  { code: 'BIL-001', qty: 1 },
  { code: 'BIL-003', qty: 1 },
  { code: 'BIL-004', qty: 1 },
  { code: 'TAR-001', qty: 1 },
  { code: 'BIL-007', qty: 1 },
  { code: 'BIL-008', qty: 1 },
  { code: 'BIL-011', qty: 1 },
  { code: 'GOR-002', qty: 1 },
  { code: 'CIN-003', qty: 1 },
  { code: 'CIN-002', qty: 1 },
  { code: 'CIN-007', qty: 1 },
  { code: 'CIN-006', qty: 1 },
  { code: 'CIN-008', qty: 1 },
  { code: 'CIN-004', qty: 1 },
];
// ===========================================================================

const DESKTOP = (() => { const d = path.join(process.env.USERPROFILE || process.env.HOME || ROOT, 'Desktop'); return fs.existsSync(d) ? d : ROOT; })();
const OUTPUT_PATH = path.join(DESKTOP, `B2YOU - Cotizacion ${QUOTE.number}.pdf`);

// Paleta de marca
const COGNAC = '#7A4F48', ESPRESSO = '#281612', BLACK = '#2D2D2D', GRAY = '#5A5A5A';
const LIGHT = '#A3A3A3', CREAM = '#FAFAF9', CREAM_LINE = '#EFEBE7', BORDER = '#E5E5E5', WHITE = '#FFFFFF';

const PAGE_W = 595.28, PAGE_H = 841.89, MARGIN = 42;
const CONTENT_W = PAGE_W - MARGIN * 2;

const ARS = (n) => '$' + Number(n).toLocaleString('es-AR');
const fmtDate = (iso) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
const addDays = (iso, days) => { const dt = new Date(iso + 'T00:00:00'); dt.setDate(dt.getDate() + days); return dt.toISOString().slice(0, 10); };

function parseMeta(txt) {
  const o = {};
  for (const line of txt.split('\n')) { const i = line.indexOf(':'); if (i > 0) o[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim(); }
  return o;
}

// interpreta un número de nota: si es chico se asume en "miles" (config notasScale)
function scaleNum(raw) {
  const n = parseInt(String(raw).replace(/[^\d]/g, ''), 10);
  if (!Number.isFinite(n)) return null;
  return n < 10000 ? n * QUOTE.notasScale : n;
}

// parsea notas_interno -> estructura de precios
function parseNotas(notas) {
  if (!notas) return { none: true };
  if (/^no$/i.test(notas.trim())) return { notQuotable: true };   // "No" => no lo cotizamos por ahora
  const segs = notas.split(';').map((s) => s.trim()).filter(Boolean);
  const tiers = []; let flat = null, condition = null;
  for (const seg of segs) {
    if (seg.includes('->')) {
      const [labelRaw, valRaw] = seg.split('->').map((s) => s.trim());
      const val = scaleNum(valRaw); if (val == null) continue;
      const label = labelRaw.toLowerCase();
      const mMenos = label.match(/menos de\s*(\d+)/);
      const mMas = label.match(/m[aá]s de\s*(\d+)|(\d+)\s*o m[aá]s|desde\s*(\d+)|a partir de\s*(\d+)/);
      if (mMenos) tiers.push({ kind: 'lt', n: +mMenos[1], value: val });
      else if (mMas) tiers.push({ kind: 'gte', n: +(mMas[1] || mMas[2] || mMas[3] || mMas[4]), value: val });
      else condition = { label: labelRaw, value: val };
    } else {
      const n = scaleNum(seg); if (n != null) flat = n;
    }
  }
  return { tiers, flat, condition, none: false };
}

// precio unitario aplicable a la cantidad + nota para mostrar
function priceFor(pi, qty) {
  if (!pi || pi.none) return { price: null };
  if (pi.tiers && pi.tiers.length) {
    let chosen = null;
    for (const t of pi.tiers) { if (t.kind === 'lt' && qty < t.n) chosen = t; if (t.kind === 'gte' && qty >= t.n) chosen = t; }
    if (!chosen) chosen = pi.tiers.find((t) => t.kind === 'lt') || pi.tiers[0];
    return { price: chosen ? chosen.value : null, tiers: pi.tiers };
  }
  if (pi.condition) return { price: pi.condition.value, crit: cap(pi.condition.label) };
  if (pi.flat != null) return { price: pi.flat };
  return { price: null };
}
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

function beltAttrs(tags) {
  const t = (tags || '').toLowerCase();
  const g = t.includes('hombre') && t.includes('mujer') ? 'Unisex' : t.includes('hombre') ? 'Hombre' : t.includes('mujer') ? 'Mujer' : null;
  const o = t.includes('importado') ? 'Importado' : t.includes('nacional') ? 'Nacional' : null;
  return [g, o].filter(Boolean).join(' · ');
}

async function thumb(p) { try { return await sharp(p).resize(240, 240, { fit: 'contain', background: '#fff' }).flatten({ background: '#fff' }).png().toBuffer(); } catch { return null; } }

// ---- catálogo: code -> {cat, folder, name, images} ----
const index = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'catalogo-index.json'), 'utf8'));
const byCode = {};
for (const [cat, items] of Object.entries(index)) for (const p of items) {
  const m = p.metadata || {};
  if (m.code) byCode[m.code] = { cat, folder: p.productFolder, name: m.title || p.productFolder, images: Array.isArray(m.images) ? m.images : (p.availableImages || []) };
}

// ---- resolver ítems (precio desde notas_interno del metadata.txt) ----
const rows = [];
for (const it of ITEMS) {
  const info = byCode[it.code];
  if (!info) { console.warn('  código no encontrado:', it.code); continue; }
  const metaPath = path.join(IMAGES_BASE, info.cat, info.folder, 'metadata.txt');
  const meta = fs.existsSync(metaPath) ? parseMeta(fs.readFileSync(metaPath, 'utf8')) : {};
  const qty = it.qty || 1;
  let price = null, tiers = null, crit = null, status = '';
  if (it.precio != null) { price = it.precio; }
  else {
    const pi = parseNotas(meta.notas_interno);
    if (pi.notQuotable) { status = 'no-cotizable'; }        // "No" => no se cotiza, sin fallback
    else {
      const pr = priceFor(pi, qty); price = pr.price; tiers = pr.tiers || null; crit = pr.crit || null;
      if (price == null && meta.price_minorista) price = Number(meta.price_minorista) || null; // fallback
    }
  }
  const attrs = info.cat === 'Cinturones' ? beltAttrs(meta.tags) : '';
  const imgFile = info.images[0];
  const imgPath = imgFile ? path.join(IMAGES_BASE, info.cat, info.folder, imgFile) : null;
  rows.push({ code: it.code, name: info.name, qty, price, tiers, crit, attrs, status, thumb: imgPath && fs.existsSync(imgPath) ? await thumb(imgPath) : null });
}

// ============================ RENDER ============================
const doc = new PDFDocument({ size: 'A4', margin: MARGIN, bufferPages: true });
doc.pipe(fs.createWriteStream(OUTPUT_PATH));

const FONTS = path.join(__dirname, 'fonts');
doc.registerFont('Inter', path.join(FONTS, 'Inter-Regular.ttf'));
doc.registerFont('Inter-Med', path.join(FONTS, 'Inter-Medium.ttf'));
doc.registerFont('Inter-Bold', path.join(FONTS, 'Inter-Bold.ttf'));
let DISPLAY = 'Inter-Bold', DISPLAY_IT = 'Inter-Med';
try {
  const FR = path.join(ROOT, 'node_modules', '@fontsource', 'fraunces', 'files');
  doc.registerFont('Fraunces', path.join(FR, 'fraunces-latin-600-normal.woff'));
  doc.registerFont('Fraunces-It', path.join(FR, 'fraunces-latin-500-italic.woff'));
  DISPLAY = 'Fraunces'; DISPLAY_IT = 'Fraunces-It';
} catch { /* fallback Inter */ }

const eyebrow = (txt, x, y) => doc.font('Inter-Bold').fontSize(7).fillColor(LIGHT).text(txt.toUpperCase(), x, y, { characterSpacing: 1.5 });

// HEADER
let y = MARGIN;
try { doc.image(LOGO_PATH, MARGIN, y, { width: 132 }); } catch { doc.font(DISPLAY).fontSize(20).fillColor(ESPRESSO).text('B2YOU', MARGIN, y); }
doc.font(DISPLAY_IT).fontSize(26).fillColor(ESPRESSO).text('Cotización', PAGE_W - MARGIN - 230, y - 2, { width: 230, align: 'right' });
doc.font('Inter-Med').fontSize(9).fillColor(GRAY).text(`N° ${QUOTE.number}   ·   ${fmtDate(QUOTE.date)}`, PAGE_W - MARGIN - 230, y + 30, { width: 230, align: 'right' });
y += 52;
doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).lineWidth(1).strokeColor(COGNAC).stroke();
y += 18;

// EMISOR (izq, bajo el logo, sin rótulo) / CLIENTE (der)
const colW = (CONTENT_W - 24) / 2, leftX = MARGIN, rightX = MARGIN + colW + 24;
let ly = y, ry = y;
doc.font('Inter').fontSize(9).fillColor(GRAY).text(BUSINESS.tagline, leftX, ly, { width: colW }); ly = doc.y + 5;
doc.font('Inter').fontSize(9).fillColor(BLACK);
for (const l of [BUSINESS.whatsapp && 'WhatsApp ' + BUSINESS.whatsapp, BUSINESS.web, BUSINESS.email, BUSINESS.instagram, BUSINESS.cuit && 'CUIT ' + BUSINESS.cuit].filter(Boolean)) { doc.text(l, leftX, ly); ly = doc.y + 2; }
doc.font('Inter').fontSize(9).fillColor(GRAY).text('Cliente', rightX, ry); ry = doc.y + 2;
doc.font(DISPLAY).fontSize(14).fillColor(ESPRESSO).text(CLIENT.name || '', rightX, ry, { width: colW }); ry = doc.y + 3;
doc.font('Inter').fontSize(9).fillColor(BLACK);
for (const l of [CLIENT.company, CLIENT.contact].filter(Boolean)) { doc.text(l, rightX, ry, { width: colW }); ry = doc.y + 2; }
doc.font('Inter').fontSize(9).fillColor(GRAY).text(`Válida hasta ${fmtDate(addDays(QUOTE.date, QUOTE.validityDays))}`, rightX, ry + 3, { width: colW });
y = Math.max(ly, ry) + 22;

// Aclaración: texto corriente antes de la tabla (sin caja ni rótulo)
if (QUOTE.aclaracion && QUOTE.aclaracion.length) {
  doc.font('Inter').fontSize(9).fillColor(GRAY);
  for (const p of QUOTE.aclaracion) { doc.text(p, MARGIN, y, { width: CONTENT_W, lineGap: 1.5 }); y = doc.y + 7; }
  y += 8;
}

// TABLA
const cImg = MARGIN, wImg = 74;
const cCode = cImg + wImg, wCode = 46;                        // 116
const cName = cCode + wCode + 6;                              // 168
const wQty = 46, wPrice = 82, wSub = 82;
const cQty = MARGIN + CONTENT_W - (wQty + wPrice + wSub);     // 343.28
const cPrice = cQty + wQty, cSub = cPrice + wPrice;           // 389.28 / 471.28 (cierra en 553.28)
const wName = cQty - cName - 8, ROW_H = 78;                   // 167.28

function tableHeader() {
  doc.rect(MARGIN, y, CONTENT_W, 22).fill(COGNAC);
  doc.font('Inter-Bold').fontSize(8).fillColor(WHITE);
  const ty = y + 7;
  doc.text('IMAGEN', cImg + 6, ty, { width: wImg });
  doc.text('CÓDIGO', cCode, ty, { width: wCode });
  doc.text('PRODUCTO', cName, ty, { width: wName });
  doc.text('CANT.', cQty, ty, { width: wQty, align: 'center' });
  doc.text('PRECIO U.', cPrice, ty, { width: wPrice, align: 'right' });
  doc.text('SUBTOTAL', cSub, ty, { width: wSub - 4, align: 'right' });
  y += 22;
}
tableHeader();

let subtotal = 0, aConfirmar = 0, noCotizable = 0;
for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  if (y + ROW_H > PAGE_H - 140) { doc.addPage(); y = MARGIN; tableHeader(); }
  if (i % 2 === 1) doc.rect(MARGIN, y, CONTENT_W, ROW_H).fill(CREAM);

  // FOTO: matte blanco cuadrado (esquina viva) + borde fino + imagen. La foto
  // salta sobre las filas crema; el borde la define sobre las blancas.
  const F = 66, fx = cImg + 2, fy = y + (ROW_H - F) / 2;
  doc.rect(fx, fy, F, F).fill(WHITE);
  doc.rect(fx, fy, F, F).lineWidth(0.75).strokeColor(BORDER).stroke();
  if (r.thumb) { try { doc.image(r.thumb, fx + 2, fy + 2, { fit: [F - 4, F - 4], align: 'center', valign: 'center' }); } catch { /* */ } }

  doc.font('Inter-Med').fontSize(8.5).fillColor(GRAY).text(r.code, cCode, y + 34, { width: wCode, lineBreak: false });

  // NOMBRE: arriba cuando hay banda de detalle; centrado si es plano puro.
  const hasBand = r.tiers || r.crit || r.attrs;
  doc.font('Inter-Med').fontSize(11).fillColor(ESPRESSO).text(r.name, cName, hasBand ? y + 12 : y + 33, { width: wName, lineBreak: false });

  // DETALLE DE PRECIO (color de marca + barrita cognac en el tramo aplicado).
  if (r.tiers) {
    doc.font('Inter').fontSize(7.5).fillColor(GRAY).text('Precio por unidad:', cName, y + 30, { width: wName, lineBreak: false });
    r.tiers.forEach((t, k) => {
      const ly = y + 42 + k * 12;
      const applied = (t.kind === 'lt' && r.qty < t.n) || (t.kind === 'gte' && r.qty >= t.n);
      const label = t.kind === 'lt' ? `1 a ${t.n - 1} u.` : `${t.n} u. o más`;
      doc.font(applied ? 'Inter-Bold' : 'Inter').fontSize(8.5).fillColor(applied ? COGNAC : GRAY);
      doc.text(label, cName, ly, { width: wName, lineBreak: false });
      doc.text(ARS(t.value) + ' c/u', cName, ly, { width: wName, align: 'right', lineBreak: false });
    });
  } else if (r.crit) {
    doc.font('Inter-Med').fontSize(9.5).fillColor(COGNAC).text(r.crit, cName, y + 34, { width: wName, lineBreak: false });
    if (r.attrs) doc.font('Inter').fontSize(7.5).fillColor(LIGHT).text(r.attrs, cName, y + 50, { width: wName, lineBreak: false });
  } else if (r.attrs) {
    doc.font('Inter').fontSize(8).fillColor(LIGHT).text(r.attrs, cName, y + 34, { width: wName, lineBreak: false });
  }

  // CANT / PRECIO U. / SUBTOTAL (o estado), centrados vertical en y+33.
  doc.font('Inter').fontSize(11).fillColor(BLACK).text(String(r.qty), cQty, y + 33, { width: wQty, align: 'center' });
  if (r.price) {
    const sub = r.price * r.qty; subtotal += sub;
    doc.font('Inter-Med').fontSize(10.5).fillColor(BLACK).text(ARS(r.price), cPrice, y + 33, { width: wPrice, align: 'right' });
    doc.font('Inter-Bold').fontSize(11).fillColor(ESPRESSO).text(ARS(sub), cSub, y + 33, { width: wSub - 4, align: 'right' });
  } else {
    if (r.status === 'no-cotizable') noCotizable++; else aConfirmar++;
    doc.font('Inter').fontSize(11).fillColor(LIGHT).text('-', cPrice, y + 33, { width: wPrice, align: 'right' });
    doc.font('Inter').fontSize(11).fillColor(LIGHT).text('-', cSub, y + 33, { width: wSub - 4, align: 'right' });
  }

  y += ROW_H;
  doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).lineWidth(0.6).strokeColor(BORDER).stroke();
}

// TOTALES
y += 14;
const boxW = 240, boxX = PAGE_W - MARGIN - boxW;
if (y + 76 > PAGE_H - 120) { doc.addPage(); y = MARGIN; }
doc.font('Inter').fontSize(9.5).fillColor(GRAY).text('Subtotal', boxX, y, { width: 120 });
doc.font('Inter-Med').fontSize(9.5).fillColor(BLACK).text(ARS(subtotal), boxX + 120, y, { width: boxW - 120, align: 'right' });
if (noCotizable || aConfirmar) {
  y += 15; doc.font('Inter').fontSize(8.5).fillColor(LIGHT).text('Los ítems con - no están incluidos en el total.', boxX, y, { width: boxW, align: 'right' });
}
y += 20;
doc.rect(boxX, y, boxW, 30).fill(ESPRESSO);
doc.font(DISPLAY).fontSize(11).fillColor(CREAM).text('TOTAL', boxX + 12, y + 9);
doc.font(DISPLAY).fontSize(14).fillColor(WHITE).text(ARS(subtotal), boxX + 12, y + 7, { width: boxW - 24, align: 'right' });
y += 44;

// CONDICIONES (texto corriente, sin caja)
const hasTiers = rows.some((r) => r.tiers && r.tiers.length);
const notes = [
  QUOTE.ivaNote,
  hasTiers ? 'El precio por unidad varía según la cantidad; se aplicó el que corresponde a lo cotizado.' : null,
  noCotizable ? 'Los ítems con - no los cotizamos por el momento.' : null,
  QUOTE.paymentNote, QUOTE.extraNote, `Cotización válida por ${QUOTE.validityDays} días.`,
].filter(Boolean);
const notesH = 24 + notes.length * 13;
if (y + notesH > PAGE_H - 50) { doc.addPage(); y = MARGIN; }
doc.font(DISPLAY).fontSize(12).fillColor(ESPRESSO).text('Condiciones', MARGIN, y);
let ny = y + 19;
doc.font('Inter').fontSize(8.5).fillColor(GRAY);
for (const n of notes) { doc.text('·  ' + n, MARGIN, ny, { width: CONTENT_W }); ny = doc.y + 3; }

// FOOTER: solo el wordmark, sin datos ni paginación
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(range.start + i);
  doc.page.margins.bottom = 0;   // sin esto pdfkit agrega una página por cada texto escrito en la zona del pie
  doc.font(DISPLAY).fontSize(9).fillColor(LIGHT).text(BUSINESS.name, MARGIN, PAGE_H - 30, { width: CONTENT_W, align: 'center' });
}

doc.end();
console.log('Cotización N°', QUOTE.number, '->', OUTPUT_PATH);
console.log(`  ${rows.length} ítems | subtotal ${ARS(subtotal)}${aConfirmar ? ` | ${aConfirmar} a confirmar` : ''}`);
