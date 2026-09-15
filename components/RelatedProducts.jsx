import { useEffect, useState } from 'react';
import ProductCard from '/components/ProductCard.jsx';
import { loadManifest, parseMetadata, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

// "También te puede interesar": una fila con las mismas tarjetas del catalogo.
// Antes era un pase de diapositivas de una tarjeta gigante con puntitos; la
// tienda de referencia muestra simplemente cuatro productos como en la grilla,
// que ademas es lo que el visitante ya sabe leer.
// Con `explore` (pie del catalogo) muestra productos de OTRAS categorias.
function RelatedProducts({ category, folder, explore = false }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    setItems([]);
    (async () => {
      try {
        const manifest = await loadManifest();
        const shuffle = (a) => a.sort(() => Math.random() - 0.5);

        const others = [];
        for (const c of Object.keys(manifest)) {
          if (c === category) continue;
          for (const f of manifest[c]) others.push({ cat: c, folder: f });
        }

        let pool;
        if (explore) {
          pool = shuffle(others);
        } else {
          pool = shuffle(
            (manifest[category] || []).filter((f) => f !== folder).map((f) => ({ cat: category, folder: f }))
          );
          if (pool.length < 4) pool = pool.concat(shuffle(others));
        }
        const picked = pool.slice(0, 4);

        const loaded = await Promise.all(picked.map(async ({ cat, folder: f }) => {
          try {
            const res = await fetch(`/${IMAGES_BASE_FOLDER}/${cat}/${f}/metadata.txt`);
            if (!res.ok) return null;
            const meta = parseMetadata(await res.text());
            const imgs = Array.isArray(meta.images) ? meta.images : [];
            if (!imgs.length) return null;
            // La misma forma que usa la grilla, asi la tarjeta es identica.
            return { metadata: meta, category: cat, productFolder: f, availableImages: imgs };
          } catch { return null; }
        }));

        if (alive) setItems(loaded.filter(Boolean));
      } catch (e) {
        console.error('Error loading related products:', e);
      }
    })();
    return () => { alive = false; };
  }, [category, folder, explore]);

  if (items.length < 3) return null;

  return (
    <section className="related-section">
      <div className="related-inner">
        <h2 className="related-title">{explore ? 'Seguí explorando' : 'También te puede interesar'}</h2>
        <div className="related-grid">
          {items.map((p) => (
            <ProductCard key={`${p.category}/${p.productFolder}`} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default RelatedProducts;
