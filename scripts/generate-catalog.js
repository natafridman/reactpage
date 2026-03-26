import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';

// ===== CONFIG =====
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const IMAGES_BASE = path.join(PUBLIC, 'images', 'Categorias');
const LOGO_PATH = path.join(PUBLIC, 'images', 'Branding', 'B2 B2YOU Header Landscape 2.png');
const OUTPUT_PATH = path.join(PUBLIC, 'catalogo-b2you.pdf');

// Fonts
const FONTS_DIR = path.join(__dirname, 'fonts');
const FONT_REGULAR = path.join(FONTS_DIR, 'Inter-Regular.ttf');
const FONT_BOLD = path.join(FONTS_DIR, 'Inter-Bold.ttf');
const FONT_MEDIUM = path.join(FONTS_DIR, 'Inter-Medium.ttf');
const FONT_ITALIC = path.join(FONTS_DIR, 'Inter-MediumItalic.ttf');

// Brand colors
const COGNAC = [122, 79, 72];       // #7A4F48
const COGNAC_DARK = [95, 60, 54];   // darker cognac
const BLACK = [45, 45, 45];         // #2D2D2D
const GRAY = [90, 90, 90];          // #5A5A5A
const LIGHT_GRAY = [163, 163, 163]; // #A3A3A3
const CREAM = [250, 250, 249];      // #FAFAF9
const WHITE = [255, 255, 255];
const BORDER = [229, 229, 229];     // #E5E5E5

// Layout
const PAGE_W = 595.28;  // A4
const PAGE_H = 841.89;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_H = 30;
const USABLE_BOTTOM = PAGE_H - MARGIN - FOOTER_H;

// Product card layout: 2 columns
const COL_GAP = 14;
const CARD_W = (CONTENT_W - COL_GAP) / 2;
const CARD_IMG_H = 130;
const CARD_PAD = 12;

// ===== HELPERS =====

function parseMetadata(text) {
  const metadata = {};
  text.trim().split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const k = key.trim().toLowerCase();
      const v = valueParts.join(':').trim();
      if (k === 'images' || k === 'videos') {
        metadata[k] = v.split(',').map(i => i.trim()).filter(Boolean);
      } else {
        metadata[k] = v;
      }
    }
  });
  return metadata;
}

async function loadProducts() {
  const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'manifest.json'), 'utf-8'));
  const products = [];

  for (const [category, items] of Object.entries(manifest)) {
    for (const productName of items) {
      const productDir = path.join(IMAGES_BASE, category, productName);
      const metaPath = path.join(productDir, 'metadata.txt');

      if (!fs.existsSync(metaPath)) {
        console.warn(`  Skipping ${category}/${productName} — no metadata.txt`);
        continue;
      }

      const meta = parseMetadata(fs.readFileSync(metaPath, 'utf-8'));
      const images = (meta.images || [])
        .map(img => path.join(productDir, img))
        .filter(p => fs.existsSync(p));

      products.push({ category, productName, ...meta, imagePaths: images });
    }
  }
  return products;
}

// Flatten PNG alpha onto a background color, output as JPEG
async function flattenImage(imgPath, maxW, maxH, bgColor = { r: 255, g: 255, b: 255 }) {
  try {
    const buffer = await sharp(imgPath)
      .flatten({ background: bgColor })
      .resize(Math.round(maxW * 2), Math.round(maxH * 2), { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    return buffer;
  } catch {
    return null;
  }
}

// Flatten logo onto cognac background for cover, white for footer
async function prepareLogo(bgColor = { r: 255, g: 255, b: 255 }, maxW = 280, maxH = 120) {
  try {
    const buffer = await sharp(LOGO_PATH)
      .flatten({ background: bgColor })
      .resize(Math.round(maxW * 2), Math.round(maxH * 2), { fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer();
    return buffer;
  } catch {
    return null;
  }
}

// ===== PDF GENERATION =====

async function generate() {
  console.log('Loading products...');
  const products = await loadProducts();
  console.log(`Found ${products.length} products.`);

  // Group by category
  const grouped = {};
  for (const p of products) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }

  const doc = new PDFDocument({ size: 'A4', margin: MARGIN, bufferPages: true });
  const stream = fs.createWriteStream(OUTPUT_PATH);
  doc.pipe(stream);

  // ===== COVER PAGE =====
  // Full cognac background
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(COGNAC);

  // Subtle darker strip at top and bottom
  doc.rect(0, 0, PAGE_W, 60).fill(COGNAC_DARK);
  doc.rect(0, PAGE_H - 60, PAGE_W, 60).fill(COGNAC_DARK);

  // Thin cream lines as accents
  doc.rect(0, 60, PAGE_W, 1).fill([255, 255, 255, 0.3]);
  doc.rect(0, PAGE_H - 61, PAGE_W, 1).fill([255, 255, 255, 0.3]);

  // Logo centered — white logo on cognac background
  const origLogoMeta = await sharp(LOGO_PATH).metadata();
  const negatedLogo = await sharp(LOGO_PATH)
    .negate({ alpha: false })
    .toBuffer();
  const coverLogoBuffer = await sharp({
    create: {
      width: origLogoMeta.width,
      height: origLogoMeta.height,
      channels: 4,
      background: { r: COGNAC[0], g: COGNAC[1], b: COGNAC[2], alpha: 255 }
    }
  })
    .composite([{ input: negatedLogo, blend: 'over' }])
    .jpeg({ quality: 90 })
    .toBuffer();

  const logoAspect = origLogoMeta.width / origLogoMeta.height;
  const logoDispW = 300;
  const logoDispH = logoDispW / logoAspect;
  const logoX = (PAGE_W - logoDispW) / 2;
  doc.image(coverLogoBuffer, logoX, PAGE_H * 0.26, { width: logoDispW });

  // Decorative line above title
  const line1Y = PAGE_H * 0.46;
  doc.moveTo(PAGE_W / 2 - 80, line1Y).lineTo(PAGE_W / 2 + 80, line1Y)
    .lineWidth(0.8).strokeColor(WHITE).stroke();

  // Title
  doc.fontSize(42).font(FONT_BOLD).fillColor(WHITE)
    .text('CATÁLOGO', 0, PAGE_H * 0.48, { align: 'center', width: PAGE_W });

  // Subtitle
  doc.fontSize(13).font(FONT_REGULAR).fillColor(CREAM)
    .text('Accesorios Premium para tu Marca', 0, PAGE_H * 0.55, { align: 'center', width: PAGE_W });

  // Decorative line below subtitle
  const line2Y = PAGE_H * 0.59;
  doc.moveTo(PAGE_W / 2 - 80, line2Y).lineTo(PAGE_W / 2 + 80, line2Y)
    .lineWidth(0.8).strokeColor(WHITE).stroke();

  // Year
  doc.fontSize(12).font(FONT_REGULAR).fillColor([255, 255, 255])
    .text(new Date().getFullYear().toString(), 0, PAGE_H * 0.62, { align: 'center', width: PAGE_W });

  // ===== PRODUCT PAGES =====
  let currentY = 0;
  let currentCategory = '';

  function startNewPage() {
    doc.addPage();
    currentY = MARGIN;
    // Cream background for product pages
    doc.rect(0, 0, PAGE_W, PAGE_H).fill(CREAM);
    // Thin cognac line at top
    doc.rect(0, 0, PAGE_W, 3).fill(COGNAC);
    currentY = MARGIN + 6;
    return currentY;
  }

  function needsNewPage(requiredH) {
    return currentY + requiredH > USABLE_BOTTOM;
  }

  // Draw category header — minSpaceAfter ensures header + first product fit
  function drawCategoryHeader(categoryName, minSpaceAfter = 0) {
    const headerH = 32;
    if (needsNewPage(headerH + 8 + minSpaceAfter)) startNewPage();

    // Cognac pill/banner for category
    const bannerH = 26;
    doc.roundedRect(MARGIN, currentY, CONTENT_W, bannerH, 4).fill(COGNAC);
    doc.fontSize(12).font(FONT_BOLD).fillColor(WHITE)
      .text(categoryName.toUpperCase(), MARGIN + 14, currentY + 7, { width: CONTENT_W - 28 });
    currentY += headerH + 8;
  }

  // Calculate card height based on content
  function estimateCardHeight(product) {
    let h = CARD_PAD;
    h += CARD_IMG_H;
    h += 8; // gap after image
    h += 15; // title (code is on same line)
    if (product.subtitle) h += 13;
    h += 4; // gap before description
    if (product.description) {
      const charsPerLine = Math.floor((CARD_W - CARD_PAD * 2) / 4.2);
      const lines = Math.ceil(product.description.length / charsPerLine);
      h += Math.min(lines, 4) * 10;
    }
    h += CARD_PAD;
    return h;
  }

  // Draw a product card
  async function drawCard(product, x, y, cardH) {
    // White card with subtle shadow
    doc.roundedRect(x + 1, y + 1, CARD_W, cardH, 8).fill([238, 236, 234]);
    doc.roundedRect(x, y, CARD_W, cardH, 8).fill(WHITE);

    let innerY = y + CARD_PAD;
    const innerX = x + CARD_PAD;
    const innerW = CARD_W - CARD_PAD * 2;

    // Image area with rounded top corners
    doc.save();
    doc.roundedRect(innerX, innerY, innerW, CARD_IMG_H, 6).fill([245, 243, 241]);
    doc.restore();

    if (product.imagePaths && product.imagePaths.length > 0) {
      const imgBuffer = await flattenImage(product.imagePaths[0], innerW, CARD_IMG_H, { r: 245, g: 243, b: 241 });
      if (imgBuffer) {
        const meta = await sharp(product.imagePaths[0]).metadata();
        const aspect = meta.width / meta.height;
        let dispW = innerW;
        let dispH = dispW / aspect;
        if (dispH > CARD_IMG_H) {
          dispH = CARD_IMG_H;
          dispW = dispH * aspect;
        }
        const imgX = innerX + (innerW - dispW) / 2;
        doc.image(imgBuffer, imgX, innerY + (CARD_IMG_H - dispH) / 2, { width: dispW });
      }
    }
    innerY += CARD_IMG_H + 4;

    // Cognac accent line
    doc.rect(innerX, innerY, innerW, 2).fill(COGNAC);
    innerY += 6;

    // Title + Code on same line
    const titleText = product.title || product.productName;
    if (product.code) {
      // Code right-aligned
      doc.fontSize(7).font(FONT_REGULAR).fillColor(LIGHT_GRAY)
        .text(product.code, innerX, innerY + 2, { width: innerW, align: 'right', lineBreak: false });
    }
    // Title left-aligned (leave space for code)
    const titleW = product.code ? innerW - 50 : innerW;
    doc.fontSize(10).font(FONT_BOLD).fillColor(BLACK)
      .text(titleText, innerX, innerY, { width: titleW, lineBreak: false });
    innerY += 14;

    // Subtitle
    if (product.subtitle) {
      doc.fontSize(8).font(FONT_ITALIC).fillColor(COGNAC)
        .text(product.subtitle, innerX, innerY, { width: innerW, lineBreak: false });
      innerY += 12;
    }

    // Description
    if (product.description) {
      const maxDescH = 40;
      doc.fontSize(7).font(FONT_REGULAR).fillColor(GRAY)
        .text(product.description, innerX, innerY, {
          width: innerW,
          height: maxDescH,
          ellipsis: true,
          lineGap: 1.5
        });
    }
  }

  // Process categories
  const categories = Object.keys(grouped);

  for (const category of categories) {
    const catProducts = grouped[category];
    currentCategory = category;

    if (currentY === 0) startNewPage();

    // Calculate first row height to ensure header + first row fit together
    const firstLeft = catProducts[0];
    const firstRight = catProducts.length > 1 ? catProducts[1] : null;
    const firstRowH = Math.max(
      estimateCardHeight(firstLeft),
      firstRight ? estimateCardHeight(firstRight) : 0
    );
    drawCategoryHeader(category, firstRowH);

    // Layout products in 2-column grid
    for (let i = 0; i < catProducts.length; i += 2) {
      const left = catProducts[i];
      const right = i + 1 < catProducts.length ? catProducts[i + 1] : null;
      const leftH = estimateCardHeight(left);
      const rightH = right ? estimateCardHeight(right) : 0;
      const rowH = Math.max(leftH, rightH);

      if (needsNewPage(rowH)) {
        startNewPage();
      }

      await drawCard(left, MARGIN, currentY, rowH);
      if (right) {
        await drawCard(right, MARGIN + CARD_W + COL_GAP, currentY, rowH);
      }
      currentY += rowH + 10;
    }

    currentY += 6;
  }

  // ===== FOOTERS ON ALL PAGES =====
  const range = doc.bufferedPageRange();
  const totalPages = range.count;
  const footerLogoBuffer = await prepareLogo({ r: CREAM[0], g: CREAM[1], b: CREAM[2] }, 60, 14);

  // Disable auto page addition while writing footers
  const origAddPage = doc.addPage.bind(doc);
  doc.addPage = () => doc; // no-op during footer pass

  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);

    if (i === 0) continue; // Skip cover page

    const footerY = PAGE_H - MARGIN - 8;

    // Separator line
    doc.rect(MARGIN, footerY - 8, CONTENT_W, 0.5).fill(BORDER);

    // Logo in footer (left)
    if (footerLogoBuffer) {
      doc.image(footerLogoBuffer, MARGIN, footerY - 2, { height: 12 });
    }

    // Page number (right) — lineBreak false to prevent extra pages
    doc.fontSize(8).font(FONT_REGULAR).fillColor(LIGHT_GRAY)
      .text(`${i} / ${totalPages - 1}`, MARGIN, footerY, {
        width: CONTENT_W, align: 'right', lineBreak: false
      });
  }

  doc.addPage = origAddPage; // restore
  doc.end();

  await new Promise(resolve => stream.on('finish', resolve));
  console.log(`\nCatalog generated: ${OUTPUT_PATH}`);
  console.log(`Total pages: ${totalPages}`);
}

generate().catch(err => {
  console.error('Error generating catalog:', err);
  process.exit(1);
});
