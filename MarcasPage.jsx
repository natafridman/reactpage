import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '/components/Header.jsx';
import Footer from '/components/Footer.jsx';
import { loadManifest } from '/utils/productUtils.js';
import './landing.css';

const WA_NUMBER = '5491178279281';

function MarcasPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isMenuActive, setIsMenuActive] = useState(false);

  useEffect(() => {
    document.title = 'B2YOU - Marcas';
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const manifest = await loadManifest();
        setCategories(Object.keys(manifest));
      } catch (error) {
        console.error('Error cargando categorias:', error);
      }
    }
    init();
  }, []);

  function handleContactSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    const subject = encodeURIComponent(`Mensaje de ${name}`);
    const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`);
    window.open(`https://wa.me/${WA_NUMBER}?text=${subject}%0A%0A${body}`, '_blank');
    e.target.reset();
  }

  function handleLogoClick() {
    window.location.href = window.location.origin;
  }

  function handleCategoryClick(e, cat) {
    e.preventDefault();
    navigate(`/productos?categoria=${encodeURIComponent(cat)}`);
  }

  function enviarWhatsApp() {
    const msg = encodeURIComponent('Hola, los contacto desde la web. Tengo una marca y me interesa trabajar con B2YOU.');
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
  }

  return (
    <div className="landing-page">
      <Header
        categories={categories}
        isMenuActive={isMenuActive}
        isHeaderHidden={false}
        setIsMenuActive={setIsMenuActive}
        onLogoClick={handleLogoClick}
        onCategoryClick={handleCategoryClick}
      />

      <main className="landing-main">
        <section className="info-page-hero info-page-hero-marcas">
          <div className="info-page-hero-overlay"></div>
          <div className="info-page-hero-content">
            <span className="info-page-label">B2YOU para</span>
            <h1 className="info-page-title">Marcas</h1>
            <p className="info-page-subtitle">
              Producci&oacute;n de accesorios con tu marca. Calidad artesanal, escala profesional.
            </p>
          </div>
        </section>

        <section className="info-page-section">
          <div className="info-page-container">
            <div className="info-page-grid">
              <div className="info-page-card">
                <div className="info-page-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle>
                  </svg>
                </div>
                <h3>Marca Blanca</h3>
                <p>Fabricamos productos con tu etiqueta. Tus clientes reciben un producto premium con la identidad de tu marca.</p>
              </div>

              <div className="info-page-card">
                <div className="info-page-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <h3>Cat&aacute;logo Completo</h3>
                <p>Bolsos, mochilas, morrales, ri&ntilde;oneras, portadocumentos, gorras y m&aacute;s. Eleg&iacute;s los productos que mejor se adapten a tu marca.</p>
              </div>

              <div className="info-page-card">
                <div className="info-page-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </div>
                <h3>Producci&oacute;n Escalable</h3>
                <p>Desde tiradas peque&ntilde;as hasta grandes vol&uacute;menes. Nos adaptamos al crecimiento de tu marca sin sacrificar calidad.</p>
              </div>

              <div className="info-page-card">
                <div className="info-page-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3>Acompa&ntilde;amiento Dedicado</h3>
                <p>Trabajamos codo a codo con tu equipo en dise&ntilde;o, materiales y tiempos de entrega para que todo salga perfecto.</p>
              </div>
            </div>

            <div className="info-page-cta-section">
              <h2>Cre&aacute; productos &uacute;nicos para tu marca</h2>
              <p>Escribinos y armamos juntos una propuesta a medida.</p>
              <div className="info-page-cta-buttons">
                <button className="info-page-cta" onClick={enviarWhatsApp}>
                  Contactar por WhatsApp
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
                <button className="info-page-cta-secondary" onClick={() => navigate('/productos')}>
                  Ver Productos
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onContactSubmit={handleContactSubmit} />
    </div>
  );
}

export default MarcasPage;
