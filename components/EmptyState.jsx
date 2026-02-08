function EmptyState() {
  return (
    <div className="loading-overlay">
      <div className="loading-product-skeleton">
        <div className="loading-hero-side"></div>
        <div className="loading-gallery-side">
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            fontSize: '1.2rem', 
            color: 'var(--text-secondary)' 
          }}>
            No se encontraron productos para esta categoría.
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmptyState;
