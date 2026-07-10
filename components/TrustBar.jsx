// Slim trust band placed right under the hero - reinforces credibility before
// the visitor scrolls. Factual points only (keeps the site's existing info).
function TrustBar() {
  const items = [
    'Cuero genuino',
    'Hecho en Buenos Aires',
    'Marca blanca disponible',
    'Volumen adecuado al cliente',
    'Muestras disponibles',
  ];

  return (
    <section className="trust-bar" aria-label="Por qué elegirnos">
      <div className="trust-bar-inner">
        {items.map((t, i) => (
          <div className="trust-item" key={i}>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustBar;
