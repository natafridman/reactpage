// Clave para ver los cinturones nacionales.
//
// QUE HACE: por defecto el catalogo de cinturones muestra solo los importados.
// Los nacionales quedan tapados hasta que el visitante escribe la clave, y una
// vez acertada queda guardada 72 horas en este navegador.
//
// COMO DEJAR UNO NACIONAL A LA VISTA: agregale el tag `publico` en su
// metadata.txt, junto a los que ya tiene.
//
//     tags: mujer, nacional, publico
//
// OJO: el catalogo no lee los metadata.txt uno por uno, lee el precalculado
// public/catalogo-index.json. Despues de editar un metadata hay que regenerarlo:
//
//     node scripts/generate-catalog-index.mjs
//
// El build ya lo corre solo, asi que en produccion alcanza con desplegar.
//
// OJO, ESTO NO ES SEGURIDAD. Es una cortina, no una caja fuerte. Los productos
// viajan igual al navegador y `public/manifest.json` lista todos los cinturones
// por nombre, asi que cualquiera con la consola abierta los ve, y la clave esta
// en el bundle. Sirve para segmentar y poner friccion, no para esconderle nada
// a alguien que se ponga a buscar. Para eso haria falta que el servidor no
// mande esos productos sin clave valida.

// >>> LA CLAVE VA ACA. Cuatro caracteres alfanumericos, no distingue mayusculas.
export const CLAVE = 'B2NA';

const HORAS = 72;
const STORAGE_KEY = 'b2you-cinturones-clave';

export const LARGO_CLAVE = 4;

const normalizar = (s) => String(s || '').trim().toUpperCase();

/** Un producto esta tapado si es cinturon nacional y NO fue marcado `publico`. */
export function esProtegido(product) {
  if (!product || product.category !== 'Cinturones') return false;
  const tags = (Array.isArray(product.metadata?.tags) ? product.metadata.tags : [])
    .map((t) => String(t).toLowerCase());
  if (!tags.includes('nacional')) return false;
  return !tags.includes('publico');
}

/** true si en este navegador hay una clave acertada que todavia no vencio. */
export function estaDesbloqueado() {
  try {
    const vence = Number(window.localStorage.getItem(STORAGE_KEY));
    if (!vence || Number.isNaN(vence)) return false;
    if (Date.now() >= vence) {
      window.localStorage.removeItem(STORAGE_KEY); // ya vencio, se limpia sola
      return false;
    }
    return true;
  } catch {
    return false; // modo incognito o storage bloqueado: se comporta como sin clave
  }
}

/** Valida la clave y, si esta bien, la guarda por 72hs. Devuelve true/false. */
export function desbloquear(intento) {
  if (normalizar(intento) !== normalizar(CLAVE)) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now() + HORAS * 3600 * 1000));
  } catch {
    // si no se puede guardar, igual se desbloquea para esta visita
  }
  return true;
}

/** Cuando vence, para poder avisarlo. null si no hay clave activa. */
export function venceEn() {
  try {
    const vence = Number(window.localStorage.getItem(STORAGE_KEY));
    return vence && !Number.isNaN(vence) && Date.now() < vence ? vence : null;
  } catch {
    return null;
  }
}

export function olvidarClave() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nada que hacer
  }
}
