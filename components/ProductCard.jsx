import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlossomCarousel } from '@blossom-carousel/react';
import { thumbSrc, formatPrice, quoteWhatsappUrl } from '/utils/productUtils.js';

function ProductCard({ product }) {
  const navigate = useNavigate();
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
  const quoteUrl = quoteWhatsappUrl(metadata, productFolder);

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
    <div ref={cardRef} className={`product-card ${visible ? 'card-visible' : ''}`}>
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
          <a
            className="product-card-wa"
            href={quoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Pedí cotización por WhatsApp"
            aria-label={`Pedí cotización de ${metadata.title || productFolder} por WhatsApp`}
          >
            <svg width="15" height="15" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16.004 0C7.165 0 0 7.163 0 16.001c0 2.82.736 5.573 2.137 7.998L.074 31.79a.5.5 0 0 0 .612.613l7.89-2.066A15.93 15.93 0 0 0 16.004 32C24.837 32 32 24.837 32 16.001 32 7.163 24.837 0 16.004 0zm0 29.333a13.27 13.27 0 0 1-6.87-1.907.5.5 0 0 0-.426-.05l-5.47 1.432 1.43-5.393a.5.5 0 0 0-.054-.432A13.28 13.28 0 0 1 2.667 16C2.667 8.636 8.638 2.667 16.004 2.667c7.364 0 13.33 5.969 13.33 13.334 0 7.364-5.966 13.332-13.33 13.332z"/>
            </svg>
            Cotizar
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
