import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlossomCarousel } from '@blossom-carousel/react';
import { thumbSrc, formatPrice, buildCartItem } from '/utils/productUtils.js';
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
  const [aspect, setAspect] = useState(null);

  const IMAGES_BASE_FOLDER = '/images/Categorias';
  const productPath = `${IMAGES_BASE_FOLDER}/${category}/${productFolder}`;
  const imageList = (Array.isArray(metadata.images) ? metadata.images : availableImages) || [];
  const productUrl = `/producto/${encodeURIComponent(category)}/${encodeURIComponent(productFolder)}`;
  const multi = imageList.length > 1;
  const price = formatPrice(metadata);

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

  const onFirstLoad = (e) => {
    if (!aspect && e.target.naturalWidth && e.target.naturalHeight) {
      setAspect(e.target.naturalWidth / e.target.naturalHeight);
    }
  };

  const renderImg = (file, i) => (
    <img
      src={thumbSrc(`${productPath}/${file}`)}
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
      onLoad={i === 0 ? onFirstLoad : undefined}
    />
  );

  return (
    <div
      ref={cardRef}
      className={`product-card ${visible ? 'card-visible' : ''}`}
      style={{ '--stagger': staggerIndex }}
    >
      <div
        className="product-card-image"
        ref={mediaRef}
        style={{ aspectRatio: String(aspect || 1) }}
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
          {metadata.code && <span className="product-card-code">{metadata.code}</span>}
        </a>
        <div className="product-card-buy">
          <span className={`product-card-price ${price.consult ? 'is-consult' : ''}`}>
            {price.display}
            {price.note && <em>{price.note}</em>}
          </span>
          {qty === 0 ? (
            <button
              type="button"
              className="product-card-add"
              onClick={addToCart}
              aria-label={`Agregar ${metadata.title || productFolder} al carrito`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
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
