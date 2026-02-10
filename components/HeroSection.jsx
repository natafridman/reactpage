const enviarWhatsApp = (tipo) => {
  const mensajes = {
    empresa: "Hola, los contacto desde la web. Somos una empresa interesada en productos corporativos personalizados.",
    negocio: "Hola, los contacto desde la web. Tengo un negocio y me interesan sus productos para reventa/uso comercial."
  };
  
  const numero = "5491153445155";
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensajes[tipo])}`;
  window.open(url, '_blank');
};

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
          <h1 className="hero-title">Productos de primera calidad para tu negocio</h1>
          <p className="hero-description">
            Creamos productos de cuero y accesorios excepcionales que combinan artesanía tradicional 
            con diseño contemporáneo. Cada pieza es fabricada a mano, diseñada para acompañarte 
            en tu día a día con estilo y distinción. 
          </p>
          <button className="hero-cta" onClick={() => enviarWhatsApp('empresa')}>
            Para Empresas
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          <button className="hero-cta" onClick={() => enviarWhatsApp('negocio')}>
            Para Negocios
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
