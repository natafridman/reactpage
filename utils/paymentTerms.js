// Condiciones de pago por proveedor, mostradas en el pop-up del carrito.
// La clave es el valor del campo `proveedor` de cada metadata.txt de producto.
// Mantener en sync con catalogos-originales/CONDICIONES-DE-PAGO.md.
export const PAYMENT_TERMS = {
  javera: {
    name: 'Javera',
    note: 'Marcas: Zaphir · Basilea · Joup',
    terms: [
      'Precios + IVA (no incluyen IVA).',
      'Hay descuentos disponibles; los precios de lista figuran sin descuento aplicado.',
      'Mínimo de compra por artículo (varía: 1 a 6 unidades).',
      'Se maneja por unidad por bulto (24 / 48 / 60 según el producto).',
      'Colores surtidos: cada artículo trae los colores con una cantidad sugerida por color.',
    ],
  },
  saxs: {
    name: 'SAXS',
    note: 'Carteras · mayorista',
    terms: [
      'El precio depende de la forma de pago: más barato en efectivo; sube al financiar a 30, 60, 90 o 120 días.',
      '5% de descuento en la primera compra.',
      '10% de descuento a partir de las 50 unidades.',
      'Contacto: Instagram @SAXS.ARG.',
    ],
  },
  aston: {
    name: 'Aston Accesorios',
    note: 'Cinturones, billeteras, bolsos, mochilas, gorras y más',
    terms: [
      'Cinturones: se compran por curva de talles y por color (una curva surtida por cada color).',
      'Línea de cuero vacuno: precio preferencial por compras de más de 50 unidades; precios sin IVA.',
      'Resto de productos: precio por cantidad (pedido chico de 8u vs. volumen +64u).',
      'Forma de pago y plazos a coordinar. Contacto: WhatsApp +54 9 11 3093-0771 · @astonaccesorios.',
    ],
  },
};

// Normaliza un valor de proveedor de la metadata a la clave del registro.
export function normalizeProveedor(value) {
  return String(value || '').toLowerCase().trim();
}

// Devuelve los términos de un proveedor, o null si no está registrado.
export function termsFor(proveedor) {
  const key = normalizeProveedor(proveedor);
  return key && PAYMENT_TERMS[key] ? { key, ...PAYMENT_TERMS[key] } : null;
}

// Lista de claves de proveedores con términos definidos.
export const KNOWN_PROVEEDORES = Object.keys(PAYMENT_TERMS);
