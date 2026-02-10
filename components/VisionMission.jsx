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
            <span className="vision-label">Nuestra Visión</span>
            <h2 className="vision-title">Redefinir el lujo accesible</h2>
            <p className="vision-text">
              Ser la marca líder en productos de cuero premium que combine 
              artesanía tradicional con innovación contemporánea, creando 
              piezas atemporales que trascienden tendencias y se convierten 
              en compañeros de vida para nuestros clientes.
            </p>
            <div className="vision-features">
              <div className="vision-feature">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>Calidad excepcional</span>
              </div>
              <div className="vision-feature">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>Diseño atemporal</span>
              </div>
              <div className="vision-feature">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>Compromiso sostenible</span>
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
            <span className="vision-label">Nuestra Misión</span>
            <h2 className="vision-title">Crear valor duradero</h2>
            <p className="vision-text">
              Diseñar y fabricar productos de cuero de la más alta calidad, 
              utilizando técnicas artesanales perfeccionadas a lo largo de 
              generaciones, mientras innovamos constantemente para ofrecer 
              soluciones que se adapten al estilo de vida moderno.
            </p>
            <div className="vision-stats">
              <div className="vision-stat">
                <span className="stat-number">15+</span>
                <span className="stat-label">Años de experiencia</span>
              </div>
              <div className="vision-stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Cuero genuino</span>
              </div>
              <div className="vision-stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Clientes satisfechos</span>
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
