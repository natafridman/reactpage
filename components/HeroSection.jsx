import { useNavigate } from 'react-router-dom';

function HeroSection() {
  const navigate = useNavigate();

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
          <source src="/images/Branding/LandingVideo.mp4" type="video/mp4" />
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
          <h1 className="hero-title">Hacemos los accesorios que tu marca necesita</h1>
          <p className="hero-description">
            Diseñamos y fabricamos bolsos, mochilas, gorras y más. Trabajamos con
            marcas y empresas que buscan productos bien hechos, con su identidad y a su medida.
          </p>
          <div className="hero-cta-group">
            <button className="hero-cta hero-cta-primary" onClick={() => navigate('/Empresas')}>
              Para Empresas
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button className="hero-cta hero-cta-outline" onClick={() => navigate('/Marcas')}>
              Para Marcas
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

<div className="hero-trust-badges">
            <div className="hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>+5 años de experiencia</span>
            </div>
            <div className="hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <span>Entregas a todo el país</span>
            </div>
            <div className="hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Muestras disponibles</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;
