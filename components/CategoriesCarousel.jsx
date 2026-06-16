import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlossomCarousel } from '@blossom-carousel/react';
import { loadManifest, parseMetadata, thumbSrc, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

// A draggable rail of product CATEGORIES - each card links into that category.
// Defaults are tuned for the Marcas page ("everything we can make for your brand").
function CategoriesCarousel({
  eyebrow = 'Catálogo',
  title = 'Todo lo que fabricamos',
  intro = 'Elegí los productos que mejor representen a tu marca, todos personalizables.',
}) {
  const navigate = useNavigate();
  const rail = useRef(null);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const manifest = await loadManifest();
        const names = Object.keys(manifest).filter((c) => c !== 'Mundial' && manifest[c]?.length);
        const loaded = await Promise.all(names.map(async (cat) => {
          const folders = manifest[cat];
          const folder = folders[Math.floor(Math.random() * folders.length)];
          try {
            const res = await fetch(`/${IMAGES_BASE_FOLDER}/${cat}/${folder}/metadata.txt`);
            const meta = res.ok ? parseMetadata(await res.text()) : {};
            const imgs = Array.isArray(meta.images) ? meta.images : [];
            const full = imgs.length ? `/${IMAGES_BASE_FOLDER}/${cat}/${folder}/${imgs[0]}` : null;
            return { cat, count: folders.length, src: full ? thumbSrc(full) : null, full };
          } catch {
            return { cat, count: folders.length, src: null, full: null };
          }
        }));
        if (alive) setCats(loaded);
      } catch (e) {
        console.error('Error loading categories rail:', e);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (cats.length < 4) return null;

  return (
    <section className="catalog-rail-section categories-rail-section">
      <div className="featured-container">
        <div className="featured-header">
          <span className="featured-subtitle">{eyebrow}</span>
          <h2 className="featured-title">{title}</h2>
          <p className="featured-intro">{intro}</p>
          <div className="featured-divider"></div>
        </div>

        <div className="rail">
          <BlossomCarousel ref={rail} className="rail-track cat-rail">
            {cats.map((c, i) => (
              <button
                className="category-slide"
                key={`${c.cat}-${i}`}
                onClick={() => navigate(`/productos?categoria=${encodeURIComponent(c.cat)}`)}
              >
                <div className="category-slide-media">
                  {c.src && (
                    <img
                      src={c.src}
                      alt={c.cat}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (c.full && !e.target.dataset.fallback) {
                          e.target.dataset.fallback = '1';
                          e.target.src = c.full;
                        }
                      }}
                    />
                  )}
                  <div className="category-slide-overlay">
                    <span className="category-slide-name">{c.cat}</span>
                    <span className="category-slide-count">{c.count} {c.count === 1 ? 'modelo' : 'modelos'}</span>
                  </div>
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

export default CategoriesCarousel;
