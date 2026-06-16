import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductSlideshow from '/components/ProductSlideshow.jsx';
import { loadManifest, parseMetadata, medSrc, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

// "También te puede interesar" - full-width slideshow on the single-product page.
// Prefers products from the same category, then fills with others.
function RelatedProducts({ category, folder }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    setItems([]);
    (async () => {
      try {
        const manifest = await loadManifest();
        const shuffle = (a) => a.sort(() => Math.random() - 0.5);

        const sameCat = shuffle(
          (manifest[category] || []).filter((f) => f !== folder).map((f) => ({ cat: category, folder: f }))
        );
        let pool = sameCat;
        if (pool.length < 8) {
          const others = [];
          for (const c of Object.keys(manifest)) {
            if (c === category || c === 'Mundial') continue;
            for (const f of manifest[c]) others.push({ cat: c, folder: f });
          }
          pool = pool.concat(shuffle(others));
        }
        const picked = pool.slice(0, 8);

        const loaded = await Promise.all(picked.map(async ({ cat, folder: f }) => {
          try {
            const res = await fetch(`/${IMAGES_BASE_FOLDER}/${cat}/${f}/metadata.txt`);
            if (!res.ok) return null;
            const meta = parseMetadata(await res.text());
            const imgs = Array.isArray(meta.images) ? meta.images : [];
            if (!imgs.length) return null;
            const full = `/${IMAGES_BASE_FOLDER}/${cat}/${f}/${imgs[0]}`;
            return {
              key: `${cat}-${f}`,
              src: medSrc(full),
              full,
              eyebrow: cat,
              title: meta.title || f,
              description: meta.subtitle || '',
              cta: 'Ver producto',
              onClick: () => navigate(`/producto/${encodeURIComponent(cat)}/${encodeURIComponent(f)}`),
            };
          } catch { return null; }
        }));

        if (alive) setItems(loaded.filter(Boolean));
      } catch (e) {
        console.error('Error loading related products:', e);
      }
    })();
    return () => { alive = false; };
  }, [category, folder, navigate]);

  if (items.length < 3) return null;

  return (
    <section className="catalog-rail-section related-section">
      <div className="featured-container">
        <div className="featured-header">
          <span className="featured-subtitle">Seguí explorando</span>
          <h2 className="featured-title">También te puede interesar</h2>
          <div className="featured-divider"></div>
        </div>

        <ProductSlideshow items={items} autoplay={false} />
      </div>
    </section>
  );
}

export default RelatedProducts;
