import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlossomCarousel } from '@blossom-carousel/react';
import { thumbSrc, medSrc, buildCartItem } from '/utils/productUtils.js';
import { flyToCart } from '/utils/flyToCart.js';
import { useCart } from '/context/CartContext.jsx';
import QtyStepper from '/components/QtyStepper.jsx';

function ProductCard({ product, staggerIndex = 0 }) {
  const navigate = useNavigate();
  const { items, addItem, increment, decrement } = useCart();
  const { metadata, category, productFolder, availableImages } = product;
  const cardRef = useRef(null);
  const mediaRef = useRef(null);
  const carousel = useRef(null);
  const dragRef = useRef({ x: 0, y: 0, moved: false });
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);
  // Indices de las imagenes que ya tienen la version grande lista en cache.
  const [sharp, setSharp] = useState(() => new Set());

  const IMAGES_BASE_FOLDER = '/images/Categorias';
  const productPath = `${IMAGES_BASE_FOLDER}/${category}/${productFolder}`;
  const imageList = (Array.isArray(metadata.images) ? metadata.images : availableImages) || [];
  const productUrl = `/producto/${encodeURIComponent(category)}/${encodeURIComponent(productFolder)}`;
  const multi = imageList.length > 1;

  const cartItem = buildCartItem(product);
  const qty = items.find((i) => i.key === cartItem.key)?.qty || 0;

  const addToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(cartItem);
    flyToCart(e.currentTarget);
  };

  // Reveal on scroll into view.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // La miniatura mide 280px y el recuadro de la tarjeta 285x356, asi que se
  // ampliaba un 27% (mas en pantallas retina) y se veia blanda. Se muestra igual
  // primero, porque pesa ~3 KB y pinta al instante, y en cuanto la imagen entra
  // en pantalla se cambia por la variante .med de 1200px. El cambio se hace
  // recien cuando la grande termino de bajar, asi no hay parpadeo; si falla,
  // simplemente se queda la miniatura.
  useEffect(() => {
    const root = mediaRef.current;
    if (!root) return;
    const targets = [...root.querySelectorAll('img[data-idx]')];
    if (!targets.length) return;

    const upgrade = (el) => {
      const idx = Number(el.dataset.idx);
      const full = el.dataset.full;
      if (!full) return;
      const big = new Image();
      big.onload = () => setSharp((prev) => (prev.has(idx) ? prev : new Set(prev).add(idx)));
      big.src = medSrc(full);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          upgrade(e.target);
        }
      },
      // Arranca antes de que la tarjeta llegue al borde: para cuando el ojo la
      // alcanza, la version nitida ya esta.
      { rootMargin: '400px' }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [imageList.length, productFolder]);

  const getRail = () => mediaRef.current?.querySelector('.bc-card-rail');

  // Track the active image from scroll position (slides are 100% wide).
  useEffect(() => {
    if (!multi) return;
    const el = getRail();
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (el.clientWidth) setActive(Math.round(el.scrollLeft / el.clientWidth));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [multi, imageList.length]);

  const goToImg = (i, e) => {
    e.preventDefault();
    e.stopPropagation();
    const el = getRail();
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };
  const prev = (e) => { e.preventDefault(); e.stopPropagation(); carousel.current?.prev({ align: 'start' }); };
  const next = (e) => { e.preventDefault(); e.stopPropagation(); carousel.current?.next({ align: 'start' }); };

  // Distinguish a click (navigate) from a drag (browse images).
  const onDown = (e) => { dragRef.current = { x: e.clientX, y: e.clientY, moved: false }; };
  const onMove = (e) => {
    if (Math.abs(e.clientX - dragRef.current.x) > 6 || Math.abs(e.clientY - dragRef.current.y) > 6) {
      dragRef.current.moved = true;
    }
  };
  const goToProduct = (e) => {
    if (e.button === 1 || e.ctrlKey || e.metaKey) return; // allow open-in-new-tab
    if (dragRef.current.moved) { e.preventDefault(); return; } // it was a drag
    e.preventDefault();
    navigate(productUrl);
  };

  const renderImg = (file, i = 0) => (
    <img
      data-idx={i}
      data-full={`${productPath}/${file}`}
      src={sharp.has(i) ? medSrc(`${productPath}/${file}`) : thumbSrc(`${productPath}/${file}`)}
      alt={metadata.title}
      loading="lazy"
      decoding="async"
      draggable="false"
      onError={(e) => {
        if (!e.target.dataset.fallback) {
          e.target.dataset.fallback = '1';
          e.target.src = `${productPath}/${file}`;
        }
      }}
    />
  );

  return (
    <div
      ref={cardRef}
      className={`product-card ${visible ? 'card-visible' : ''}`}
      style={{ '--stagger': staggerIndex }}
      data-folder={productFolder}
    >
      <div
        className="product-card-image"
        ref={mediaRef}
        onPointerDownCapture={onDown}
        onPointerMoveCapture={onMove}
      >
        {multi ? (
          <BlossomCarousel ref={carousel} className="bc-card-rail">
            {imageList.map((file, i) => (
              <a key={i} href={productUrl} className="card-slide" onClick={goToProduct}>
                {renderImg(file, i)}
              </a>
            ))}
          </BlossomCarousel>
        ) : (
          <a href={productUrl} className="card-slide card-slide-single" onClick={goToProduct}>
            {renderImg(imageList[0] || 'hero.jpg', 0)}
          </a>
        )}

        {multi && (
          <>
            <button className="card-img-nav card-img-prev" onClick={prev} aria-label="Imagen anterior">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button className="card-img-nav card-img-next" onClick={next} aria-label="Imagen siguiente">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <div className="card-img-dots">
              {imageList.map((_, i) => (
                <span
                  key={i}
                  className={`card-dot ${i === active ? 'active' : ''}`}
                  onClick={(e) => goToImg(i, e)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="product-card-info">
        <a href={productUrl} className="product-card-info-text" onClick={goToProduct}>
          <h3 className="product-card-title">{metadata.title || productFolder}</h3>
          <p className="product-card-subtitle">{metadata.subtitle || category}</p>
        </a>
        {/* Sin precio ni codigo de articulo a la vista: el precio se cotiza y el
            codigo es interno. Igual viaja al carrito y al mensaje de WhatsApp. */}
        <div className="product-card-buy">
          {qty === 0 ? (
            <button
              type="button"
              className="product-card-add"
              onClick={addToCart}
              aria-label={`Agregar ${metadata.title || productFolder} al carrito`}
            >
              {/* WhatsApp y no carrito, a proposito, y solo aca. En la tarjeta
                  el boton esta solo, asi que el icono cuenta a donde termina el
                  pedido. En la ficha de producto va carrito, porque al lado
                  esta "Pedi cotizacion" y con el mismo icono quedaban dos
                  botones identicos haciendo cosas distintas. */}
              <svg width="15" height="15" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16.004 0C7.165 0 0 7.163 0 16.001c0 2.82.736 5.573 2.137 7.998L.074 31.79a.5.5 0 0 0 .612.613l7.89-2.066A15.93 15.93 0 0 0 16.004 32C24.837 32 32 24.837 32 16.001 32 7.163 24.837 0 16.004 0zm0 29.333a13.27 13.27 0 0 1-6.87-1.907.5.5 0 0 0-.426-.05l-5.47 1.432 1.43-5.393a.5.5 0 0 0-.054-.432A13.28 13.28 0 0 1 2.667 16C2.667 8.636 8.638 2.667 16.004 2.667c7.364 0 13.33 5.969 13.33 13.334 0 7.364-5.966 13.332-13.33 13.332zm7.327-9.96c-.4-.2-2.366-1.167-2.733-1.3-.366-.133-.633-.2-.9.2s-1.033 1.3-1.266 1.567c-.233.267-.467.3-.867.1s-1.69-.623-3.22-1.987c-1.19-1.062-1.993-2.374-2.227-2.774s-.025-.617.175-.817c.18-.18.4-.467.6-.7.2-.233.267-.4.4-.667s.067-.5-.033-.7c-.1-.2-.9-2.167-1.233-2.967-.325-.778-.655-.673-.9-.685l-.767-.013a1.47 1.47 0 0 0-1.067.5c-.367.4-1.4 1.367-1.4 3.334s1.433 3.867 1.633 4.133c.2.267 2.823 4.31 6.84 6.043.955.413 1.7.659 2.281.844.959.305 1.832.262 2.522.159.77-.115 2.367-.968 2.7-1.902.333-.934.333-1.734.233-1.902-.1-.167-.367-.267-.767-.467z" />
              </svg>
              Agregar
            </button>
          ) : (
            <QtyStepper
              variant="card"
              qty={qty}
              label={metadata.title || productFolder}
              onDecrement={() => decrement(cartItem.key)}
              onIncrement={(srcEl) => { increment(cartItem.key); flyToCart(srcEl); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
