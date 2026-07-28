// Meta Pixel: lo que el snippet de index.html no puede cubrir solo.
//
// El codigo base ya hace `init` y el PageView de la primera carga. En una SPA
// eso alcanza para la landing y para nada mas: al navegar de "/" a "/productos"
// no hay recarga, asi que Meta nunca se entera. Este modulo agrega las piezas
// que faltan:
//
//   1. Un PageView por cada cambio de ruta de React Router.
//   2. Un evento Contact cada vez que alguien sale hacia WhatsApp, que es la
//      conversion real del sitio.
//   3. Un evento AddToCart cada vez que se agrega un producto al carrito, con
//      que producto fue. Se llama desde CartContext.jsx, el unico lugar donde
//      un item entra al carrito.
//
// Los enlaces a WhatsApp estan repartidos en unos diez archivos y de dos formas
// distintas: <a href="https://wa.me/..."> y window.open(...) dentro de handlers.
// En vez de tocar cada llamada (y arriesgar que la proxima que se agregue quede
// sin medir) se interceptan las dos formas desde aca.

const WA_HOST = 'wa.me';

function send(...args) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args);
  }
}

export function trackPageView() {
  send('track', 'PageView');
}

export function trackContact(origen) {
  send('track', 'Contact', origen ? { content_name: origen } : undefined);
}

// item es un cart item de buildCartItem() (utils/productUtils.js): trae title,
// code, price y tambien `proveedor`, que nunca sale del sitio (ver
// utils/paymentTerms.js). Por eso esta funcion arma el payload a mano en vez
// de reenviar el objeto entero.
export function trackAddToCart(item) {
  if (!item) return;
  send('track', 'AddToCart', {
    content_name: item.title,
    content_ids: [item.code || item.key],
    content_type: 'product',
    ...(item.price != null ? { value: item.price, currency: 'ARS' } : {}),
  });
}

let instalado = false;

export function installWhatsAppTracking() {
  if (instalado || typeof window === 'undefined') return;
  instalado = true;

  // Enlaces <a href="https://wa.me/...">. En fase de captura para que corra
  // aunque un handler llame a stopPropagation.
  document.addEventListener(
    'click',
    (event) => {
      const link = event.target?.closest?.('a[href]');
      if (link && link.href.includes(WA_HOST)) trackContact('enlace');
    },
    true
  );

  // Handlers que abren WhatsApp con window.open(...). Se envuelve la nativa y
  // se delega siempre, asi que el comportamiento del sitio no cambia.
  const openNativo = window.open;
  window.open = function (url, ...resto) {
    if (typeof url === 'string' && url.includes(WA_HOST)) trackContact('boton');
    return openNativo.call(window, url, ...resto);
  };
}
