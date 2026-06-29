// Validación interna: cada producto debe tener un campo `proveedor` cuyo valor
// exista en utils/paymentTerms.js (PAYMENT_TERMS). Así el carrito siempre puede
// mostrar las condiciones de pago del proveedor seleccionado.
//
// - proveedor desconocido (typo / no registrado)  -> ERROR (corta el build)
// - producto sin proveedor                         -> AVISO (no corta)
//
// Uso: node scripts/validate-proveedores.mjs   (se corre también en el build)
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { KNOWN_PROVEEDORES } from '../utils/paymentTerms.js';

const ROOT = 'public/images/Categorias';

function parseProveedor(text) {
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*proveedor\s*:\s*(.+)\s*$/i);
    if (m) return m[1].trim().toLowerCase();
  }
  return null;
}

async function main() {
  const known = new Set(KNOWN_PROVEEDORES);
  const counts = {};
  const missing = [];
  const unknown = [];
  let total = 0;

  let categories = [];
  try {
    categories = await readdir(ROOT, { withFileTypes: true });
  } catch {
    console.error(`No pude leer ${ROOT}`);
    process.exit(1);
  }

  for (const cat of categories) {
    if (!cat.isDirectory()) continue;
    const catPath = join(ROOT, cat.name);
    let products = [];
    try {
      products = await readdir(catPath, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const prod of products) {
      if (!prod.isDirectory()) continue;
      const metaPath = join(catPath, prod.name, 'metadata.txt');
      let text;
      try {
        text = await readFile(metaPath, 'utf8');
      } catch {
        continue;
      }
      total += 1;
      const rel = `${cat.name}/${prod.name}`;
      const prov = parseProveedor(text);
      if (!prov) {
        missing.push(rel);
      } else if (!known.has(prov)) {
        unknown.push(`${rel} -> "${prov}"`);
      } else {
        counts[prov] = (counts[prov] || 0) + 1;
      }
    }
  }

  console.log(`\nValidación de proveedores (${total} productos):`);
  for (const p of KNOWN_PROVEEDORES) console.log(`  ${p}: ${counts[p] || 0}`);

  if (missing.length) {
    console.warn(`\n⚠ ${missing.length} producto(s) SIN proveedor (se coordinan a parte):`);
    missing.forEach((m) => console.warn(`   - ${m}`));
  }

  if (unknown.length) {
    console.error(`\n✗ ${unknown.length} producto(s) con proveedor DESCONOCIDO (no está en paymentTerms.js):`);
    unknown.forEach((u) => console.error(`   - ${u}`));
    console.error('\nAgregá el proveedor a utils/paymentTerms.js o corregí el valor en la metadata.');
    process.exit(1);
  }

  console.log(`\n✓ Sin proveedores desconocidos.\n`);
}

main();
