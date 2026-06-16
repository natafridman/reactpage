import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlossomCarousel } from '@blossom-carousel/react';
import { loadManifest, parseMetadata, thumbSrc, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

// A draggable product rail (blossom-carousel) that pulls real products from the
// manifest and renders lightweight thumbnails.
function ProductsCarousel() {
  const navigate = useNavigate();
  const rail = useRef(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const manifest = await loadManifest();
        const refs = [];
        for (const cat of Object.keys(manifest)) {
          if (cat === 'Mundial') continue;
          for (const folder of manifest[cat]) refs.push({ cat, folder });
        }
        const picked = refs.sort(() => Math.random() - 0.5).slice(0, 16);
        const loaded = await Promise.all(picked.map(async ({ cat, folder }) => {
          try {
            const res = await fetch(`/${IMAGES_BASE_FOLDER}/${cat}/${folder}/metadata.txt`);
            if (!res.ok) return null;
            const meta = parseMetadata(await res.text());
            const imgs = Array.isArray(meta.images) ? meta.images : [];
            if (!imgs.length) return null;
            const full = `/${IMAGES_BASE_FOLDER}/${cat}/${folder}/${imgs[0]}`;
            return { cat, folder, title: meta.title || folder, src: thumbSrc(full), full };
          } catch { return null; }
        }));
        if (alive) setItems(loaded.filter(Boolean));
      } catch (e) {
        console.error('Error loading catalog rail:', e);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (items.length < 6) return null;

  return (
    <section className="catalog-rail-section">
      <div className="featured-container">
        <div className="featured-header">
          <span className="featured-subtitle">Catálogo</span>
          <h2 className="featured-title">Explorá nuestros productos</h2>
          <p className="featured-intro">
            Bolsos, carteras, cinturones, gorras y mucho más, todo personalizable con tu marca.
          </p>
          <div className="featured-divider"></div>
        </div>

        <div className="rail">
          <BlossomCarousel ref={rail} className="rail-track catalog-rail">
            {items.map((p, i) => (
              <button
                className="catalog-slide"
                key={`${p.cat}-${p.folder}-${i}`}
                onClick={() => navigate(`/producto/${encodeURIComponent(p.cat)}/${encodeURIComponent(p.folder)}`)}
              >
                <div className="catalog-slide-media">
                  <img
                    src={p.src}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (!e.target.dataset.fallback) {
                        e.target.dataset.fallback = '1';
                        e.target.src = p.full;
                      }
                    }}
                  />
                </div>
                <div className="catalog-slide-info">
                  <span className="catalog-slide-cat">{p.cat}</span>
                  <span className="catalog-slide-title">{p.title}</span>
                </div>
              </button>
            ))}
          </BlossomCarousel>

          <div className="rail-controls">
            <button className="rail-nav" onClick={() => rail.current?.prev({ align: 'start' })} aria-label="Anterior">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button className="rail-nav" onClick={() => rail.current?.next({ align: 'start' })} aria-label="Siguiente">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductsCarousel;
