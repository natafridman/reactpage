import { useRef, Fragment } from 'react';
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
}) {
  const scope = useRef(null);
  const countRef = useRef(null);
  const prevCount = useRef(resultCount);

  // Entrance: search field rises in, then chips stagger up.
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.toolbar-search', { y: 22, autoAlpha: 0, duration: 0.6 });
    if (showFilters) {
      tl.from('.toolbar-chip', { y: 16, autoAlpha: 0, stagger: 0.07, duration: 0.5 }, '-=0.32');
    }
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

  // contextSafe so tweens created in handlers are tracked + reverted on unmount.
  const { contextSafe } = useGSAP({ scope });

  const handleChip = contextSafe((key, e) => {
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.86 },
      { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.55)' }
    );
    onToggleTag(key);
  });

  // Magnetic hover: chip drifts toward the cursor, springs back on leave.
  const handleChipMove = contextSafe((e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const mx = e.clientX - (r.left + r.width / 2);
    const my = e.clientY - (r.top + r.height / 2);
    gsap.to(el, { x: mx * 0.25, y: my * 0.32, duration: 0.4, ease: 'power3.out' });
  });

  const handleChipLeave = contextSafe((e) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.4)' });
  });

  const hasFilters = selectedTags.length > 0;

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
    <div className="product-toolbar" ref={scope}>
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
        <div className="toolbar-filters" role="group" aria-label="Filtrar cinturones">
          <span className="toolbar-filters-label">Filtrar</span>
          {BELT_FILTERS.map((f, i) => {
            const prev = BELT_FILTERS[i - 1];
            const newAxis = prev && prev.axis !== f.axis;
            const active = selectedTags.includes(f.key);
            return (
              <Fragment key={f.key}>
                {newAxis && <span className="toolbar-axis-sep" aria-hidden="true" />}
                <button
                  className={`toolbar-chip toolbar-chip--${f.axis} ${active ? 'active' : ''}`}
                  onClick={(e) => handleChip(f.key, e)}
                  onMouseMove={handleChipMove}
                  onMouseLeave={handleChipLeave}
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
              </Fragment>
            );
          })}
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

      <div className={`toolbar-meta ${searchInput || hasFilters ? 'is-active' : ''}`}>
        <span className="toolbar-count" ref={countRef}>{resultCount}</span>
        <span className="toolbar-count-label">
          {resultCount === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>
    </div>
  );
}

export default SearchFilterBar;
