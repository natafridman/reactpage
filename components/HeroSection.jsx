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
          <button className="hero-cta" onClick={() => navigate('/Empresas')}>
            Para Empresas
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          <button className="hero-cta" onClick={() => navigate('/Marcas')}>
            Para Marcas
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          <button className="hero-cta hero-cta-productos" onClick={() => navigate('/productos')}>
            Ver productos
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
