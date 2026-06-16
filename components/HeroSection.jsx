import { useNavigate } from 'react-router-dom';

const WA_NUMBER = '5491178279281';
const WA_QUOTE = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  'Hola B2YOU, quiero pedir una cotización para mi marca/empresa.'
)}`;

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-video-container">
        <video className="hero-background-video" autoPlay loop muted playsInline>
          <source src="/images/Branding/LandingVideo.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-content">
        <div className="hero-text">
          <span className="hero-eyebrow">Marroquinería premium · Hecho en Buenos Aires</span>
          <h1 className="hero-title">Hacemos los accesorios que tu marca necesita</h1>
          <p className="hero-description">
            Diseñamos y fabricamos bolsos, mochilas, carteras, cinturones y más,
            con tu identidad, tu logo y la calidad que tus clientes merecen.
          </p>

          <div className="hero-cta-group">
            <button className="hero-cta hero-cta-primary" onClick={() => navigate('/productos')}>
              Ver productos
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <a className="hero-cta hero-cta-outline" href={WA_QUOTE} target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16.004 0C7.165 0 0 7.163 0 16.001c0 2.82.736 5.573 2.137 7.998L.074 31.79a.5.5 0 0 0 .612.613l7.89-2.066A15.93 15.93 0 0 0 16.004 32C24.837 32 32 24.837 32 16.001 32 7.163 24.837 0 16.004 0zm0 29.333a13.27 13.27 0 0 1-6.87-1.907.5.5 0 0 0-.426-.05l-5.47 1.432 1.43-5.393a.5.5 0 0 0-.054-.432A13.28 13.28 0 0 1 2.667 16C2.667 8.636 8.638 2.667 16.004 2.667c7.364 0 13.33 5.969 13.33 13.334 0 7.364-5.966 13.332-13.33 13.332z"/>
              </svg>
              Pedí tu cotización
            </a>
          </div>

          <div className="hero-audience">
            <span className="hero-audience-q">¿Sos empresa o tenés una marca?</span>
            <button className="hero-audience-link" onClick={() => navigate('/Empresas')}>Para empresas</button>
            <span className="hero-audience-sep">·</span>
            <button className="hero-audience-link" onClick={() => navigate('/Marcas')}>Para marcas</button>
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

      <div className="hero-scroll-cue" aria-hidden="true">
        <span></span>
      </div>
    </section>
  );
}

export default HeroSection;
