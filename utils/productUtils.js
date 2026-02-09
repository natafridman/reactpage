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
      
      if (normalizedKey === 'images' || normalizedKey === 'videos') {
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