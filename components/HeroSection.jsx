function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-video-container">
        <video 
          className="hero-background-video" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/images/Categorias/Bolsos/Bolso Duffle/bolso.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-logo-wrapper">
          <img 
            src="/images/Branding/B2 B2YOU Header Landscape 2.png" 
            alt="B2YOU" 
            className="hero-logo"
          />
        </div>
        <div className="hero-text">
          <h1 className="hero-title">Premium Luxury Leather Goods</h1>
          <p className="hero-description">
            Creamos productos de cuero excepcionales que combinan artesanía tradicional 
            con diseño contemporáneo. Cada pieza es única, diseñada para acompañarte 
            en tu día a día con estilo y distinción.
          </p>
          <button className="hero-cta" onClick={() => {
            document.querySelector('.clients-section')?.scrollIntoView({ 
              behavior: 'smooth' 
            });
          }}>
            Descubrir más
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
