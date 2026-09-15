import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { medSrc, thumbSrc, quoteWhatsappUrl, buildCartItem } from '/utils/productUtils.js';
import { flyToCart } from '/utils/flyToCart.js';
import { useCart } from '/context/CartContext.jsx';
import QtyStepper from '/components/QtyStepper.jsx';

// Ficha con la estructura de una tienda: a la izquierda las miniaturas y la foto
// grande, a la derecha el nombre, la descripcion y los botones. El nombre ya no
// va dentro de un recuadro encima de la foto (tapaba el producto) y el orden es
// siempre el mismo, sin alternar lado por producto.
function ProductSection({ product, onImageClick, showBackLink = false, onReturn }) {
  const navigate = useNavigate();
  const { items, addItem, increment, decrement } = useCart();
  const { metadata, category, productFolder, availableImages } = product;
  const [copied, setCopied] = useState(false);
  // null = lo que se muestra al abrir (el video si hay, si no la primera foto)
  const [activa, setActiva] = useState(null);
  // 1 = la nueva entra desde la derecha, -1 desde la izquierda
  const [sentido, setSentido] = useState(1);
  const rielRef = useRef(null);
  const [flechas, setFlechas] = useState(false);
  // Alto comun de las miniaturas, en proporcion (alto/ancho). Se calcula abajo,
  // cuando se conocen las fotos del producto.
  const [altoMiniatura, setAltoMiniatura] = useState(1.25);

  // Las flechas del riel solo aparecen si hay mas miniaturas de las que entran.
  useEffect(() => {
    const el = rielRef.current;
    if (!el) return undefined;
    const medir = () => setFlechas(el.scrollHeight - el.clientHeight > 4 || el.scrollWidth - el.clientWidth > 4);
    medir();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null;
    ro && ro.observe(el);
    window.addEventListener('resize', medir);
    return () => { ro && ro.disconnect(); window.removeEventListener('resize', medir); };
    // El alto de la miniatura se define despues de medir las fotos, asi que hay
    // que volver a preguntar si sobran: el observer mira el tamaño del riel, que
    // no cambia, y no el del contenido.
  }, [altoMiniatura, productFolder]);

  function verFoto(i) {
    setSentido(i > (activa === null ? 0 : activa) ? 1 : -1);
    setActiva(i);
    // Que la miniatura elegida quede a la vista DENTRO del riel. Con
    // scrollIntoView el navegador puede terminar desplazando la pagina entera y
    // dejando la ficha debajo del encabezado fijo, asi que se mueve solo el
    // riel. Se usa la posicion real en pantalla y no offsetLeft/offsetTop,
    // que dependen de cual sea el ancestro posicionado.
    const el = rielRef.current;
    const hijo = el && el.children[i];
    if (!el || !hijo) return;
    const m = hijo.getBoundingClientRect();
    const caja = el.getBoundingClientRect();
    if (el.scrollHeight > el.clientHeight + 1) {
      if (m.top < caja.top) el.scrollBy({ top: m.top - caja.top, behavior: 'smooth' });
      else if (m.bottom > caja.bottom) el.scrollBy({ top: m.bottom - caja.bottom, behavior: 'smooth' });
    } else {
      if (m.left < caja.left) el.scrollBy({ left: m.left - caja.left, behavior: 'smooth' });
      else if (m.right > caja.right) el.scrollBy({ left: m.right - caja.right, behavior: 'smooth' });
    }
  }

  // Desplaza el riel una miniatura, en la direccion que corresponda segun este
  // en columna (escritorio) o en fila (telefono).
  function correrRiel(paso) {
    const el = rielRef.current;
    if (!el) return;
    const hijo = el.children[0];
    const salto = hijo ? (el.scrollHeight > el.clientHeight ? hijo.offsetHeight + 10 : hijo.offsetWidth + 10) : 100;
    if (el.scrollHeight > el.clientHeight) el.scrollBy({ top: paso * salto, behavior: 'smooth' });
    else el.scrollBy({ left: paso * salto, behavior: 'smooth' });
  }

  const cartItem = buildCartItem(product);
  const qty = items.find((i) => i.key === cartItem.key)?.qty || 0;

  function handleAddToCart(e) {
    addItem(cartItem);
    flyToCart(e.currentTarget);
  }

  const IMAGES_BASE_FOLDER = '/images/Categorias';
  const productPath = `${IMAGES_BASE_FOLDER}/${category}/${productFolder}`;

  const videoList = Array.isArray(metadata.videos) ? metadata.videos : (metadata.video ? [metadata.video] : []);
  const imageList = Array.isArray(metadata.images) ? metadata.images : availableImages;
  const hasVideo = videoList.length > 0;
  const mostrandoVideo = hasVideo && activa === null;
  const indiceActivo = activa === null ? 0 : activa;
  const fotoPrincipal = imageList[indiceActivo] || imageList[0] || 'hero.jpg';

  // Todas las miniaturas miden lo mismo de alto, y ese alto sale de la foto mas
  // alta del producto: asi esa entra completa y las mas anchas se recortan por
  // los costados, centradas. Se mide sobre las miniaturas de 280px (livianas),
  // no sobre las fotos grandes.
  useEffect(() => {
    if (!imageList.length) return undefined;
    let vivo = true;
    let mayor = 0;
    let faltan = imageList.length;
    const listo = () => {
      if (--faltan === 0 && vivo && mayor > 0) {
        // Un tope por si alguna foto es desproporcionadamente alta: sin el, el
        // riel entraria dos miniaturas y nada mas.
        setAltoMiniatura(Math.min(1.5, Math.max(1, mayor)));
      }
    };
    imageList.forEach((f) => {
      const im = new Image();
      im.onload = () => {
        if (im.naturalWidth) mayor = Math.max(mayor, im.naturalHeight / im.naturalWidth);
        listo();
      };
      im.onerror = listo;
      im.src = thumbSrc(`${productPath}/${f}`);
    });
    return () => { vivo = false; };
  }, [productFolder, imageList.length]);

  function handleShare() {
    const url = `${window.location.origin}/producto/${encodeURIComponent(category)}/${encodeURIComponent(productFolder)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleContact() {
    window.open(quoteWhatsappUrl(metadata, productFolder), '_blank');
  }

  return (
    <section className="product-section" data-product={productFolder}>
      <div className="hero-side">
        {imageList.length > 1 && (
          <div className="gallery-rail" style={{ '--thumb-ratio': altoMiniatura }}>
            {imageList.length > 1 && (
              <button type="button" className="rail-arrow rail-arrow-prev" hidden={!flechas} onClick={() => correrRiel(-1)} aria-label="Ver miniaturas anteriores">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
              </button>
            )}
            <div className="gallery-rail-track" ref={rielRef}>
              {imageList.map((filename, idx) => (
                <button
                  type="button"
                  key={filename}
                  className={`gallery-item${!mostrandoVideo && idx === indiceActivo ? ' is-on' : ''}`}
                  onClick={() => verFoto(idx)}
                  aria-label={`Ver foto ${idx + 1} de ${metadata.title || productFolder}`}
                >
                  <img
                    src={medSrc(`${productPath}/${filename}`)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (!e.target.dataset.fallback) {
                        e.target.dataset.fallback = '1';
                        e.target.src = `${productPath}/${filename}`;
                      }
                    }}
                  />
                </button>
              ))}
            </div>
            {imageList.length > 1 && (
              <button type="button" className="rail-arrow rail-arrow-next" hidden={!flechas} onClick={() => correrRiel(1)} aria-label="Ver más miniaturas">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
            )}
          </div>
        )}

        <div className="hero-image-wrapper">
          {mostrandoVideo ? (
            <video className="hero-image" autoPlay loop muted playsInline>
              <source src={`${productPath}/${videoList[0]}`} type="video/mp4" />
            </video>
          ) : (
            <img
              key={fotoPrincipal}
              src={medSrc(`${productPath}/${fotoPrincipal}`)}
              alt={metadata.title}
              className={`hero-image entra-${sentido > 0 ? 'derecha' : 'izquierda'}`}
              loading="lazy"
              decoding="async"
              onClick={() => onImageClick && onImageClick(`${productPath}/${fotoPrincipal}`, imageList.map((f) => `${productPath}/${f}`))}
              onError={(e) => {
                if (!e.target.dataset.fallback) {
                  e.target.dataset.fallback = '1';
                  e.target.src = `${productPath}/${fotoPrincipal}`;
                }
              }}
            />
          )}
        </div>
      </div>

      <div className="gallery-side">
        {/* Una sola linea de orientacion arriba: de donde venis y en que
            categoria estas. Reemplaza al boton "Volver al catalogo" y al de la
            categoria, que estaban abajo mezclados con las acciones de compra. */}
        {showBackLink && (
          <nav className="product-crumbs" aria-label="Dónde estás">
            <button type="button" onClick={() => (onReturn ? onReturn() : navigate('/productos'))}>Catálogo</button>
            <span aria-hidden="true">/</span>
            <button type="button" onClick={() => navigate(`/productos?categoria=${encodeURIComponent(category)}`)}>{category}</button>
          </nav>
        )}

        <h1 className="product-name">{metadata.title || productFolder}</h1>
        <p className="product-lead">{metadata.subtitle || category}</p>

        {/* Sin precio ni codigo de articulo a la vista, igual que en las
            tarjetas. El codigo sigue viajando en el pedido de WhatsApp. */}
        <div className="description-text">
          <p>{metadata.description || 'Descripcion del producto.'}</p>
        </div>

        {/* data-clarity-unmask: son etiquetas nuestras, no datos de nadie. Sin
            esto Clarity las tapa con puntitos en las grabaciones y no se
            entiende que boton toco la gente. Los campos de formulario siguen
            enmascarados siempre, eso Clarity no lo deja cambiar. */}
        <div className="product-actions" data-clarity-unmask="true">
          {qty === 0 ? (
            <button
              className="share-btn add-cart-btn"
              onClick={handleAddToCart}
              aria-label={`Agregar ${metadata.title || productFolder} al pedido`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="btn-text">Agregar al pedido</span>
            </button>
          ) : (
            <QtyStepper
              variant="section"
              qty={qty}
              label={metadata.title || productFolder}
              onDecrement={() => decrement(cartItem.key)}
              onIncrement={(srcEl) => { increment(cartItem.key); flyToCart(srcEl); }}
            />
          )}
          <button className="share-btn contact-btn" onClick={handleContact} title="Pedí cotización por WhatsApp">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16.004 0C7.165 0 0 7.163 0 16.001c0 2.82.736 5.573 2.137 7.998L.074 31.79a.5.5 0 0 0 .612.613l7.89-2.066A15.93 15.93 0 0 0 16.004 32C24.837 32 32 24.837 32 16.001 32 7.163 24.837 0 16.004 0zm0 29.333a13.27 13.27 0 0 1-6.87-1.907.5.5 0 0 0-.426-.05l-5.47 1.432 1.43-5.393a.5.5 0 0 0-.054-.432A13.28 13.28 0 0 1 2.667 16C2.667 8.636 8.638 2.667 16.004 2.667c7.364 0 13.33 5.969 13.33 13.334 0 7.364-5.966 13.332-13.33 13.332zm7.327-9.96c-.4-.2-2.366-1.167-2.733-1.3-.366-.133-.633-.2-.9.2s-1.033 1.3-1.266 1.567c-.233.267-.467.3-.867.1s-1.69-.623-3.22-1.987c-1.19-1.062-1.993-2.374-2.227-2.774s-.025-.617.175-.817c.18-.18.4-.467.6-.7.2-.233.267-.4.4-.667s.067-.5-.033-.7c-.1-.2-.9-2.167-1.233-2.967-.325-.778-.655-.673-.9-.685l-.767-.013a1.47 1.47 0 0 0-1.067.5c-.367.4-1.4 1.367-1.4 3.334s1.433 3.867 1.633 4.133c.2.267 2.823 4.31 6.84 6.043.955.413 1.7.659 2.281.844.959.305 1.832.262 2.522.159.77-.115 2.367-.968 2.7-1.902.333-.934.333-1.734.233-1.902-.1-.167-.367-.267-.767-.467z"/>
            </svg>
            <span className="btn-text">Pedí cotización</span>
          </button>
          <button className="share-btn icon-btn" onClick={handleShare} title={copied ? 'Link copiado' : 'Compartir'} aria-label="Compartir">
            {copied ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            )}
            <span className="btn-text">{copied ? 'Link copiado' : 'Compartir'}</span>
          </button>
</div>
      </div>
    </section>
  );
}

export default ProductSection;
