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
  // Mientras carga, la seccion igual ocupa su lugar. Si devuelve null, al
  // entrar a un producto la pagina se acorta de golpe y se vuelve a estirar
  // 60ms despues: eso es el "todo se mueve y se acomoda" que se ve al entrar.
  const [cargando, setCargando] = useState(true);
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
    setCargando(true);
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
      } finally {
        if (alive) setCargando(false);
      }
    })();
    return () => { alive = false; };
  }, [category, folder, explore]);

  if (!cargando && items.length < 3) return null;

  const titulo = explore ? 'Seguí explorando' : 'También te puede interesar';

  // El hueco reservado mientras llegan los datos: la misma fila, con tarjetas
  // vacias del mismo alto (foto 4:5 + el texto de abajo). Queda invisible, pero
  // ocupa el lugar exacto, asi que cuando llegan los productos no salta nada.
  if (cargando) {
    return (
      <section className="related-section" aria-hidden="true">
        <div className="related-inner">
          <div className="related-head">
            <h2 className="related-title">{titulo}</h2>
          </div>
          <div className="related-rail-wrap">
            <div className="related-rail">
              {Array.from({ length: 4 }, (_, i) => (
                <div className="related-hueco" key={i}>
                  <span className="related-hueco-foto" />
                  <span className="related-hueco-texto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="related-section">
      <div className="related-inner">
        <div className="related-head">
          <h2 className="related-title">{titulo}</h2>
        </div>
        {/* Las flechas van a los costados de la fila, con el mismo trazo suelto
            que las del riel de miniaturas: sin circulo ni borde. */}
        <div className="related-rail-wrap">
          {puede.izq && (
            <button type="button" className="rail-arrow related-arrow related-arrow-prev" onClick={() => correr(-1)} aria-label="Ver anteriores">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}
          <div className="related-rail" ref={rielRef}>
            {items.map((p) => (
              <ProductCard key={`${p.category}/${p.productFolder}`} product={p} />
            ))}
          </div>
          {puede.der && (
            <button type="button" className="rail-arrow related-arrow related-arrow-next" onClick={() => correr(1)} aria-label="Ver siguientes">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default RelatedProducts;
