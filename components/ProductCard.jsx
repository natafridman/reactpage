import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlossomCarousel } from '@blossom-carousel/react';
import { thumbSrc } from '/utils/productUtils.js';

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

      <a href={productUrl} className="product-card-info" onClick={goToProduct}>
        <h3 className="product-card-title">{metadata.title || productFolder}</h3>
        <p className="product-card-subtitle">{metadata.subtitle || category}</p>
        <span className="product-card-code">{metadata.code || ''}</span>
      </a>
    </div>
  );
}

export default ProductCard;
