function VisionMission() {
  return (
    <section className="vision-section">
      <div className="vision-container">
        <div className="vision-content">
          <div className="vision-block">
            <div className="vision-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </div>
            <span className="vision-label">Lo que nos mueve</span>
            <h2 className="vision-title">Hacer productos que valgan la pena</h2>
            <p className="vision-text">
              Queremos que cada cosa que sale de nuestro taller sea algo que
              de verdad uses y disfrutes. No buscamos hacer cosas descartables,
              sino productos que te acompañen y que representen bien a quien los lleva.
            </p>
            <div className="vision-features">
              <div className="vision-feature">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>Buenos materiales</span>
              </div>
              <div className="vision-feature">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>Diseño con criterio</span>
              </div>
              <div className="vision-feature">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>Trabajo honesto</span>
              </div>
            </div>
          </div>

          <div className="vision-divider-vertical"></div>

          <div className="vision-block">
            <div className="vision-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <span className="vision-label">Cómo trabajamos</span>
            <h2 className="vision-title">De cerca y a medida</h2>
            <p className="vision-text">
              Nos gusta trabajar en contacto directo con cada cliente.
              Entender qué necesitan, proponer ideas y llegar a un producto
              que les cierre de verdad. No hay moldes fijos, cada proyecto
              es distinto y así lo encaramos.
            </p>
            <div className="vision-stats">
              <div className="vision-stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Personalizable</span>
              </div>
              <div className="vision-stat">
                <span className="stat-number">8+</span>
                <span className="stat-label">Categorías</span>
              </div>
              <div className="vision-stat">
                <span className="stat-number">B2B</span>
                <span className="stat-label">Foco empresas y marcas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="vision-background">
          <div className="vision-bg-element"></div>
        </div>
      </div>
    </section>
  );
}

export default VisionMission;
