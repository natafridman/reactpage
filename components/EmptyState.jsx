function EmptyState({ searching = false, onReset }) {
  return (
    <div className="empty-state">
      <div className="empty-state-mark">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <h2 className="empty-state-title">
        {searching ? 'Sin coincidencias' : 'Nada por aquí todavía'}
      </h2>
      <p className="empty-state-text">
        {searching
          ? 'No encontramos productos con esos criterios. Probá con otra búsqueda o quitá algún filtro.'
          : 'No hay productos para esta categoría por el momento.'}
      </p>
      {searching && onReset && (
        <button className="empty-state-reset" onClick={onReset}>
          Limpiar búsqueda y filtros
        </button>
      )}
    </div>
  );
}

export default EmptyState;
