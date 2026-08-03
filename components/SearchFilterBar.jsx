import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// Belt sub-categories. Two axes: género (hombre/mujer) y origen (importado/nacional).
// Filtering uses OR within an axis and AND across axes (see App.jsx).
export const BELT_FILTERS = [
  { key: 'hombre', label: 'Hombre', axis: 'genero' },
  { key: 'mujer', label: 'Mujer', axis: 'genero' },
  { key: 'importado', label: 'Importado', axis: 'origen' },
  { key: 'nacional', label: 'Nacional', axis: 'origen' },
  { key: 'urbano', label: 'Urbano', axis: 'estilo' },
  { key: 'vestir', label: 'Vestir', axis: 'estilo' },
];

// Los dos ejes, con nombre. En la barra de arriba el titulo se oculta y queda
// una linea separando los grupos; en la columna lateral se muestra, que es lo
// que hace entendible por que "Hombre" y "Nacional" se pueden marcar juntos.
const BELT_AXES = [
  { key: 'genero', label: 'Género' },
  { key: 'origen', label: 'Origen' },
  { key: 'estilo', label: 'Estilo' },
];

function SearchFilterBar({
  searchInput,
  onSearchChange,
  showFilters,
  selectedTags,
  onToggleTag,
  onClearFilters,
  resultCount,
  viewMode,
  onViewModeChange,
  headerHidden = false,
  category = null,
  claveOk = false,
}) {
  const scope = useRef(null);
  const countRef = useRef(null);
  const prevCount = useRef(resultCount);
  const filtersRef = useRef(null);
  const [pegada, setPegada] = useState(false);

  // ¿La barra ya esta clavada arriba, o todavia va bajando con la pagina?
  // Importa porque solo se la esconde cuando esta clavada: si se la esconde
  // mientras todavia esta en el medio de la pagina, se corre su propio alto
  // desde donde este y el salto queda en mitad de la vista.
  // `offsetTop` es posicion de maquetado, asi que no lo afecta el `transform`
  // que la esconde y se puede leer aunque este corrida.
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const TOPE = 75; // el mismo `top` que tiene en el CSS
    let raf = 0;
    const medir = () => {
      raf = 0;
      setPegada(window.scrollY + TOPE >= el.offsetTop);
    };
    const alScrollear = () => { if (!raf) raf = requestAnimationFrame(medir); };
    medir();
    window.addEventListener('scroll', alScrollear, { passive: true });
    window.addEventListener('resize', alScrollear);
    return () => {
      window.removeEventListener('scroll', alScrollear);
      window.removeEventListener('resize', alScrollear);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // En telefono los filtros van en un renglon que se arrastra y el ultimo se
  // desvanece contra el borde. Cuando ya no queda nada para correr, se saca ese
  // desvanecido: si no, el ultimo chip se ve apagado sin motivo.
  useEffect(() => {
    const el = filtersRef.current;
    if (!el) return;
    const sync = () => {
      const fin = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      el.classList.toggle('is-scroll-end', fin);
    };
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [showFilters]);

  // Entrada del buscador. Los chips de filtro no se animan a proposito: son
  // controles, y moverse al entrar o al pasar el mouse los hacia dificiles de
  // apuntar.
  useGSAP(() => {
    gsap.from('.toolbar-search', { y: 22, autoAlpha: 0, duration: 0.6, ease: 'power3.out' });
  }, { scope, dependencies: [showFilters] });

  // Animate the result counter whenever it changes.
  useGSAP(() => {
    const el = countRef.current;
    if (!el) return;
    const obj = { v: prevCount.current };
    gsap.to(obj, {
      v: resultCount,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.v); },
    });
    prevCount.current = resultCount;
  }, { dependencies: [resultCount], scope });

  const hasFilters = selectedTags.length > 0;
  const filtering = Boolean(searchInput) || hasFilters;

  const viewToggle = onViewModeChange ? (
    <div className="toolbar-view">
      <button
        className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
        onClick={() => onViewModeChange('list')}
        title="Vista detallada"
        aria-label="Vista detallada"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>
      <button
        className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
        onClick={() => onViewModeChange('grid')}
        title="Vista grilla"
        aria-label="Vista grilla"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
        </svg>
      </button>
    </div>
  ) : null;

  return (
    <div className={`product-toolbar${headerHidden && pegada ? ' is-tucked' : ''}`} ref={scope}>
      {/* Envoltorio necesario para el modo columna: el elemento de la grilla se
          estira a lo alto de la fila y este de adentro es el que queda fijo al
          hacer scroll. Sin el, `position: sticky` no tiene recorrido. En la
          barra de arriba es `display: contents` y no cambia nada. */}
      <div className="toolbar-inner">
      <div className="product-toolbar-top">
        <div className="toolbar-search">
          <svg className="toolbar-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="toolbar-search-input"
            placeholder="Buscar…"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar productos"
          />
          {searchInput && (
            <button
              className="toolbar-search-clear"
              onClick={() => onSearchChange('')}
              aria-label="Limpiar búsqueda"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {viewToggle}
      </div>

      {showFilters && (
        <div className="toolbar-filters" role="group" aria-label="Filtrar cinturones" ref={filtersRef}>
          <span className="toolbar-filters-label">Filtrar</span>
          {BELT_AXES.map((axis) => (
            <div className={`toolbar-axis toolbar-axis--${axis.key}`} key={axis.key}>
              <span className="toolbar-axis-label">{axis.label}</span>
              {BELT_FILTERS
                .filter((f) => f.axis === axis.key)
                // Sin la clave, "Nacional" no se ofrece: filtrarlo llevaba a un
                // "Sin coincidencias" y ademas anunciaba que hay productos ahi.
                .filter((f) => claveOk || f.key !== 'nacional')
                .map((f) => {
                const active = selectedTags.includes(f.key);
                return (
                  <button
                    key={f.key}
                    className={`toolbar-chip toolbar-chip--${f.axis} ${active ? 'active' : ''}`}
                    onClick={() => onToggleTag(f.key)}
                    aria-pressed={active}
                  >
                    <span className="toolbar-chip-check" aria-hidden="true">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                    <span className="toolbar-chip-label">{f.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
          {hasFilters && (
            <button className="toolbar-chip-clear" onClick={onClearFilters} aria-label="Limpiar filtros">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Siempre visible. Dentro de una categoria dice de que son ("321
          Cinturones"), que es mas util que un "productos" generico. Al filtrar
          pasa a "resultados", porque ahi ya no es el total de la categoria. */}
      <div className={`toolbar-meta ${filtering ? 'is-active' : ''}`}>
        <span className="toolbar-count" ref={countRef}>{resultCount}</span>
        <span className="toolbar-count-label">
          {filtering
            ? (resultCount === 1 ? 'resultado' : 'resultados')
            : category || (resultCount === 1 ? 'producto' : 'productos')}
        </span>
      </div>
      </div>
    </div>
  );
}

export default SearchFilterBar;
