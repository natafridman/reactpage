import { useEffect, useRef, useState } from 'react';
import { BlossomCarousel } from '@blossom-carousel/react';

// Full-width blossom "slideshow" (one slide at a time, scroll-snap centered) with a
// CSS scroll-driven parallax on the image, autoplay (pauses on interaction), pagination
// dots and prev/next controls. Based on blossom-carousel's advanced slideshow example.
//
// items: [{ key, src, full, eyebrow, title, description, cta, onClick }]
function ProductSlideshow({ items, autoplay = true, interval = 5500 }) {
  const carousel = useRef(null);
  const wrapRef = useRef(null);
  const pausedRef = useRef(false);
  const [active, setActive] = useState(0);

  const getScroll = () => wrapRef.current?.querySelector('.bc-slideshow');

  // Track the active slide from scroll position (slides are 100% wide → index = scrollLeft/clientWidth).
  useEffect(() => {
    const el = getScroll();
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
  }, [items.length]);

  // Autoplay — advances to the next slide, loops back to the first at the end.
  useEffect(() => {
    if (!autoplay || items.length < 2) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const el = getScroll();
      if (!el || !el.clientWidth) return;
      const cur = Math.round(el.scrollLeft / el.clientWidth);
      if (cur >= items.length - 1) el.scrollTo({ left: 0, behavior: 'smooth' });
      else carousel.current?.next({ align: 'center' });
    }, interval);
    return () => clearInterval(id);
  }, [autoplay, interval, items.length]);

  const goTo = (i) => {
    const el = getScroll();
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  return (
    <div
      className="slideshow"
      ref={wrapRef}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onPointerDown={pause}
      onPointerUp={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
    >
      <div className="slideshow-frame">
        <BlossomCarousel ref={carousel} className="bc-slideshow">
          {items.map((it, i) => (
            <div className="product-slide" key={it.key ?? i}>
              <button className="product-slide-card" onClick={it.onClick} tabIndex={i === active ? 0 : -1}>
                <img
                  className="product-slide-img"
                  src={it.src}
                  alt={it.title}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable="false"
                  onError={(e) => {
                    if (it.full && !e.target.dataset.fallback) {
                      e.target.dataset.fallback = '1';
                      e.target.src = it.full;
                    }
                  }}
                />
                <div className="product-slide-shade" />
                <div className="product-slide-info">
                  {it.eyebrow && <span className="product-slide-eyebrow">{it.eyebrow}</span>}
                  <span className="product-slide-title">{it.title}</span>
                  {it.description && <p className="product-slide-desc">{it.description}</p>}
                  {it.cta && (
                    <span className="product-slide-cta">
                      {it.cta}
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </span>
                  )}
                </div>
              </button>
            </div>
          ))}
        </BlossomCarousel>

        <button className="slideshow-nav slideshow-prev" onClick={() => carousel.current?.prev({ align: 'center' })} aria-label="Anterior">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button className="slideshow-nav slideshow-next" onClick={() => carousel.current?.next({ align: 'center' })} aria-label="Siguiente">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div className="slideshow-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`slideshow-dot ${i === active ? 'active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Ir al producto ${i + 1}`}
            aria-current={i === active}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductSlideshow;
