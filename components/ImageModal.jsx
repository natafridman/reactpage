import { useRef, useEffect, useState } from 'react';
import { BlossomCarousel } from '@blossom-carousel/react';
import { medSrc } from '/utils/productUtils.js';

// Large image viewer built as a blossom cover-flow carousel: the centered image
// faces front and scales up while neighbours rotate away in 3D (Chromium gets the
// scroll-driven 3D; other browsers get a clean centered scroller).
function ImageModal({ modalDisplay, modalOpen, imageSrc, allImages, onClose }) {
  const cf = useRef(null);
  const wrapRef = useRef(null);
  const openedRef = useRef(false);

  const images = (Array.isArray(allImages) && allImages.length)
    ? allImages
    : (imageSrc ? [imageSrc] : []);
  const hasMultiple = images.length > 1;

  const [active, setActive] = useState(0);

  const getScroll = () => wrapRef.current?.querySelector('.cf-carousel');

  const centerItem = (idx, behavior = 'auto') => {
    const el = getScroll();
    if (!el) return;
    const item = el.children[idx];
    if (!item) return;
    const left = item.offsetLeft + item.offsetWidth / 2 - el.clientWidth / 2;
    el.scrollTo({ left, behavior });
  };

  // Track which image is centered (for the counter).
  useEffect(() => {
    const el = getScroll();
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = el.scrollLeft + el.clientWidth / 2;
        let best = 0, bestDist = Infinity;
        for (let i = 0; i < el.children.length; i++) {
          const c = el.children[i];
          const cc = c.offsetLeft + c.offsetWidth / 2;
          const d = Math.abs(cc - center);
          if (d < bestDist) { bestDist = d; best = i; }
        }
        setActive(best);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [images.length, modalDisplay]);

  // On open, jump to the clicked image; reset the "opened" latch on close.
  useEffect(() => {
    if (!modalDisplay) { openedRef.current = false; return; }
    if (openedRef.current) return;
    openedRef.current = true;
    const idx = Math.max(0, images.indexOf(imageSrc));
    setActive(idx);
    // Poll until the (just-shown) carousel has a measured width, then center.
    let raf = 0, tries = 0;
    const tryCenter = () => {
      const el = getScroll();
      if (el && el.clientWidth > 0) { centerItem(idx, 'auto'); return; }
      if (tries++ < 40) raf = requestAnimationFrame(tryCenter);
    };
    raf = requestAnimationFrame(tryCenter);
    return () => cancelAnimationFrame(raf);
  }, [modalDisplay, imageSrc]);

  // Keyboard arrows navigate the cover-flow.
  useEffect(() => {
    if (!modalOpen || !hasMultiple) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') cf.current?.next({ align: 'center' });
      if (e.key === 'ArrowLeft') cf.current?.prev({ align: 'center' });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen, hasMultiple]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      id="imageModal"
      className={`modal ${modalOpen ? 'show' : ''}`}
      style={{ display: modalDisplay ? 'flex' : 'none' }}
      onClick={handleBackdropClick}
    >
      <span className="modal-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>
        &times;
      </span>

      {hasMultiple && (
        <button
          className="modal-nav modal-nav-left"
          onClick={(e) => { e.stopPropagation(); cf.current?.prev({ align: 'center' }); }}
          aria-label="Imagen anterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      )}

      <div className="cf-stage" ref={wrapRef} onClick={handleBackdropClick}>
        <BlossomCarousel ref={cf} className="cf-carousel">
          {images.map((src, i) => (
            <div className="cf-item" key={`${src}-${i}`}>
              <div className="cf-card">
                <img
                  src={medSrc(src)}
                  alt={`Imagen ${i + 1}`}
                  draggable="false"
                  onClick={(e) => { e.stopPropagation(); centerItem(i, 'smooth'); }}
                  onError={(e) => {
                    if (!e.target.dataset.fallback) {
                      e.target.dataset.fallback = '1';
                      e.target.src = src;
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </BlossomCarousel>
      </div>

      {hasMultiple && (
        <button
          className="modal-nav modal-nav-right"
          onClick={(e) => { e.stopPropagation(); cf.current?.next({ align: 'center' }); }}
          aria-label="Imagen siguiente"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      )}

      {hasMultiple && (
        <div className="modal-counter">
          {active + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

export default ImageModal;
