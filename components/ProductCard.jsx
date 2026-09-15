import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { thumbSrc, medSrc, buildCartItem } from '/utils/productUtils.js';
import { COLOR_GROUPS, productColors } from '/utils/colors.js';
import { flyToCart } from '/utils/flyToCart.js';
import { useCart } from '/context/CartContext.jsx';
import QtyStepper from '/components/QtyStepper.jsx';

// Una sola foto por tarjeta, la primera del producto. Antes cada tarjeta era un
// carrusel con flechas y puntitos: en una grilla de 40 productos eso es mucho
// ruido, obliga a decidir en cada tarjeta y carga cientos de imagenes. La grilla
// muestra la mejor foto y el resto se ve en la ficha.
function ProductCard({ product, staggerIndex = 0 }) {
  const navigate = useNavigate();
  const { items, addItem, increment, decrement } = useCart();
  const { metadata, category, productFolder, availableImages } = product;
  const cardRef = useRef(null);
  const imgRef = useRef(null);
  const [visible, setVisible] = useState(false);
  // La miniatura (280px) entra al instante; cuando la tarjeta se acerca a la
  // pantalla se cambia por la de 1200px, que es la que se ve nitida.
  const [sharp, setSharp] = useState(false);

  const IMAGES_BASE_FOLDER = '/images/Categorias';
  const productPath = `${IMAGES_BASE_FOLDER}/${category}/${productFolder}`;
  const imageList = (Array.isArray(metadata.images) ? metadata.images : availableImages) || [];
  const file = imageList[0] || 'hero.jpg';
  const fullPath = `${productPath}/${file}`;
  const productUrl = `/producto/${encodeURIComponent(category)}/${encodeURIComponent(productFolder)}`;

  const cartItem = buildCartItem(product);
  const qty = items.find((i) => i.key === cartItem.key)?.qty || 0;

  const addToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(cartItem);
    flyToCart(e.currentTarget);
  };

  // Aparecer al entrar en pantalla.
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

  // Cambio a la version grande recien cuando termino de bajar, asi no parpadea;
  // si falla, se queda la miniatura.
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    setSharp(false);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const big = new Image();
        big.onload = () => setSharp(true);
        big.src = medSrc(fullPath);
      },
      // Arranca antes de que la tarjeta llegue al borde: para cuando el ojo la
      // alcanza, la version nitida ya esta.
      { rootMargin: '400px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [fullPath]);

  const goToProduct = (e) => {
    if (e.button === 1 || e.ctrlKey || e.metaKey) return; // abrir en pestaña nueva
    e.preventDefault();
    navigate(productUrl);
  };

  const colores = productColors(product).slice(0, 5);

  return (
    <div
      ref={cardRef}
      className={`product-card ${visible ? 'card-visible' : ''}`}
      style={{ '--stagger': staggerIndex }}
      data-folder={productFolder}
    >
      <a href={productUrl} className="product-card-image" onClick={goToProduct} tabIndex={-1} aria-hidden="true">
        <img
          ref={imgRef}
          src={sharp ? medSrc(fullPath) : thumbSrc(fullPath)}
          alt={metadata.title || productFolder}
          loading="lazy"
          decoding="async"
          draggable="false"
          onError={(e) => {
            if (!e.target.dataset.fallback) {
              e.target.dataset.fallback = '1';
              e.target.src = fullPath;
            }
          }}
        />
      </a>

      <div className="product-card-info">
        <a href={productUrl} className="product-card-info-text" onClick={goToProduct}>
          <h3 className="product-card-title">{metadata.title || productFolder}</h3>
          <p className="product-card-subtitle">{metadata.subtitle || category}</p>
          {/* Colores disponibles (derivados del contenido), como puntitos bajo el subtitulo. */}
          {colores.length > 0 && (
            <span
              className="product-card-colors"
              aria-label={`Colores: ${colores.map((k) => COLOR_GROUPS.find((g) => g.key === k)?.label).join(', ')}`}
            >
              {colores.map((k) => {
                const g = COLOR_GROUPS.find((x) => x.key === k);
                return <span key={k} className="product-card-color" style={{ background: g?.swatch }} title={g?.label} />;
              })}
            </span>
          )}
        </a>
        {/* Sin precio ni codigo de articulo a la vista: el precio se cotiza y el
            codigo es interno. Igual viaja al carrito y al mensaje de WhatsApp. */}
        {/* Ver el comentario en ProductSection: sin esto Clarity tapa el texto
            del boton con puntitos en las grabaciones. */}
        <div className="product-card-buy" data-clarity-unmask="true">
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
