// ===== CONFIGURATION =====
export const IMAGES_BASE_FOLDER = 'images/Categorias';

// ===== MANIFEST CACHE =====
let manifestCache = null;

// ===== LOAD MANIFEST =====
export async function loadManifest() {
  if (manifestCache) return manifestCache;

  const response = await fetch('/manifest.json');
  manifestCache = await response.json();
  return manifestCache;
}

// ===== THUMBNAIL HELPERS =====
// Map a full image path to its generated sidecar webp variant in the sibling
// `.thumbs` folder. `thumbSrc` => ~280px (cards/bubbles), `medSrc` => ~1200px
// (list-view hero/gallery). The original stays untouched for the full-screen modal.
function variantSrc(fullPath, suffix) {
  if (!fullPath) return fullPath;
  const i = fullPath.lastIndexOf('/');
  const dir = fullPath.slice(0, i);
  const file = fullPath.slice(i + 1);
  const base = file.replace(/\.(jpe?g|png|webp|gif)$/i, '');
  return `${dir}/.thumbs/${base}${suffix}.webp`;
}

export function thumbSrc(fullPath) {
  return variantSrc(fullPath, '');
}

export function medSrc(fullPath) {
  return variantSrc(fullPath, '.med');
}

// ===== PRICE + WHATSAPP HELPERS =====
const ARS = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

// Master switch for showing prices anywhere on the site. Prices stay in each
// product's metadata; this only controls whether they are exposed to the UI.
// Set to true to show prices again.
export const SHOW_PRICES = false;

// Prefer the retail price; fall back to the wholesale price (labelled "por mayor");
// finally a "Consultá precio" chip so a price slot is never left blank.
// When SHOW_PRICES is off, every product reads as "Consultá precio".
export function formatPrice(metadata) {
  if (!SHOW_PRICES) return { display: 'Consultá precio', note: '', consult: true };
  const min = metadata && metadata.price_minorista;
  const may = metadata && metadata.price_mayorista;
  if (min && Number(min) > 0) return { display: ARS.format(Number(min)), note: '', consult: false };
  if (may && Number(may) > 0) return { display: ARS.format(Number(may)), note: 'por mayor', consult: false };
  return { display: 'Consultá precio', note: '', consult: true };
}

// Numeric price (retail preferred, then wholesale); null when none is set or
// when prices are hidden (so the cart shows "a confirmar" instead of a number).
export function priceValue(metadata) {
  if (!SHOW_PRICES) return null;
  const min = metadata && metadata.price_minorista;
  const may = metadata && metadata.price_mayorista;
  if (min && Number(min) > 0) return Number(min);
  if (may && Number(may) > 0) return Number(may);
  return null;
}

export function formatARS(n) {
  return ARS.format(Number(n) || 0);
}

export const WA_NUMBER = '5491178279281';

export function whatsappUrl(text) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

// Pre-filled WhatsApp quote link for a specific product.
export function quoteWhatsappUrl(metadata, fallbackName) {
  const title = (metadata && metadata.title) || fallbackName || 'un producto';
  const code = metadata && metadata.code ? ` (${metadata.code})` : '';
  return whatsappUrl(`Hola B2YOU, quiero pedir una cotización de "${title}"${code}. ¿Me pasan precio y mínimo de pedido?`);
}

// Build a compact, serializable cart line from a product object (as passed to
// ProductCard / ProductSection). Stored in localStorage by the cart.
export function buildCartItem(product) {
  const { metadata = {}, category, productFolder, availableImages } = product;
  const imgs = (Array.isArray(metadata.images) ? metadata.images : availableImages) || [];
  const first = imgs[0] || 'hero.jpg';
  return {
    key: `${category}/${productFolder}`,
    title: metadata.title || productFolder,
    code: metadata.code || '',
    category,
    productFolder,
    image: thumbSrc(`/${IMAGES_BASE_FOLDER}/${category}/${productFolder}/${first}`),
    price: priceValue(metadata),
  };
}

// Build the WhatsApp order message listing every cart line. No payment is taken;
// this just hands the order to a human on WhatsApp.
export function cartWhatsappUrl(items, total) {
  const lines = items.map((it, i) => {
    const code = it.code ? ` (${it.code})` : '';
    const sub = it.price != null ? ` - ${ARS.format(it.price * it.qty)}` : ' - a confirmar';
    return `${i + 1}. ${it.title}${code} x${it.qty}${sub}`;
  });
  let msg = `Hola B2YOU, quiero hacer este pedido:\n\n${lines.join('\n')}`;
  if (total > 0) msg += `\n\nTotal estimado: ${ARS.format(total)}`;
  if (items.some((it) => it.price == null)) {
    msg += `\n\n(Hay productos con precio a confirmar.)`;
  }
  msg += `\n\n¿Me confirman disponibilidad y el mínimo de pedido?`;
  return whatsappUrl(msg);
}

// ===== GET CATEGORY FROM URL =====
export function getCategoryFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('categoria');
}

// ===== PARSE METADATA FILE =====
export function parseMetadata(text) {
  const metadata = {};
  const lines = text.trim().split('\n');
  
  lines.forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const normalizedKey = key.trim().toLowerCase();
      const rawValue = valueParts.join(':').trim();
      
      if (normalizedKey === 'images' || normalizedKey === 'videos' || normalizedKey === 'tags') {
        metadata[normalizedKey] = rawValue
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);
      } else {
        metadata[normalizedKey] = rawValue;
      } 
    }
  });
  
  return metadata;
}

// ===== GET AVAILABLE IMAGES IN A PRODUCT FOLDER =====
export async function getAvailableImages(productPath) {
  try {
    const response = await fetch(productPath);
    if (!response.ok) return [];
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a');
    
    const images = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('/') && href !== '../') {
        const lower = href.toLowerCase();
        if (imageExtensions.some(ext => lower.endsWith(ext))) {
          images.push(href);
        }
      }
    });
    
    return images;
    
  } catch (error) {
    console.error(`Error obteniendo imágenes de ${productPath}:`, error);
    return [];
  }
}