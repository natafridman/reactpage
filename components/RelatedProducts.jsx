import { useEffect, useRef, useState } from 'react';
import ProductCard from '/components/ProductCard.jsx';
import { loadManifest, parseMetadata, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

// "También te puede interesar": una fila con las mismas tarjetas del catalogo.
// Antes era un pase de diapositivas de una tarjeta gigante con puntitos; la
// tienda de referencia muestra simplemente cuatro productos como en la grilla,
// que ademas es lo que el visitante ya sabe leer.
// Con `explore` (pie del catalogo) muestra productos de OTRAS categorias.
function RelatedProducts({ category, folder, explore = false }) {
  const [items, setItems] = useState([]);
  const rielRef = useRef(null);
  // Que flecha se puede usar: si no queda nada para ese lado, no se muestra.
  const [puede, setPuede] = useState({ izq: false, der: false });

  function medir() {
    const el = rielRef.current;
    if (!el) return;
    const resto = el.scrollWidth - el.clientWidth;
    setPuede({ izq: el.scrollLeft > 4, der: resto - el.scrollLeft > 4 });
  }

  function correr(paso) {
    const el = rielRef.current;
    if (!el) return;
    const tarjeta = el.children[0];
    const salto = tarjeta ? tarjeta.getBoundingClientRect().width + 28 : el.clientWidth * 0.8;
    el.scrollBy({ left: paso * salto, behavior: 'smooth' });
  }

  useEffect(() => {
    const el = rielRef.current;
    if (!el) return undefined;
    medir();
    el.addEventListener('scroll', medir, { passive: true });
    window.addEventListener('resize', medir);
    return () => { el.removeEventListener('scroll', medir); window.removeEventListener('resize', medir); };
  }, [items.length]);

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
          if (pool.length < 10) pool = pool.concat(shuffle(others));
        }
        const picked = pool.slice(0, 10);

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
        <div className="related-head">
          <h2 className="related-title">{explore ? 'Seguí explorando' : 'También te puede interesar'}</h2>
          <div className="related-arrows">
            <button type="button" onClick={() => correr(-1)} disabled={!puede.izq} aria-label="Ver anteriores">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button type="button" onClick={() => correr(1)} disabled={!puede.der} aria-label="Ver siguientes">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
        <div className="related-rail" ref={rielRef}>
          {items.map((p) => (
            <ProductCard key={`${p.category}/${p.productFolder}`} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default RelatedProducts;
