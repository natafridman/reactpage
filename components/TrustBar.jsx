// Slim trust band placed right under the hero - reinforces credibility before
// the visitor scrolls. Factual points only (keeps the site's existing info).
function TrustBar() {
  const items = [
    'Cuero genuino',
    'Hecho en Buenos Aires',
    'Marca blanca disponible',
    'Pedido mínimo 10 unidades',
    'Muestras disponibles',
  ];

  return (
    <section className="trust-bar" aria-label="Por qué elegirnos">
      <div className="trust-bar-inner">
        {items.map((t, i) => (
          <div className="trust-item" key={i}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustBar;
