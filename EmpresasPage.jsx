import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '/components/Header.jsx';
import Footer from '/components/Footer.jsx';
import { loadManifest } from '/utils/productUtils.js';
import './landing.css';

const WA_NUMBER = '5491178279281';

function EmpresasPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isMenuActive, setIsMenuActive] = useState(false);

  useEffect(() => {
    document.title = 'B2YOU - Empresas';
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
    const msg = encodeURIComponent('Hola, los contacto desde la web. Somos una empresa interesada en productos corporativos personalizados.');
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
        <section className="info-page-hero info-page-hero-empresas">
          <div className="info-page-hero-overlay"></div>
          <div className="info-page-hero-content">
            <span className="info-page-label">B2YOU para</span>
            <h1 className="info-page-title">Empresas</h1>
            <p className="info-page-subtitle">
              Regalos corporativos y productos personalizados que representan tu marca con distinci&oacute;n
            </p>
          </div>
        </section>

        <section className="info-page-section">
          <div className="info-page-container">
            <div className="info-page-grid">
              <div className="info-page-card">
                <div className="info-page-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>
                  </svg>
                </div>
                <h3>Personalizaci&oacute;n Total</h3>
                <p>Grabado l&aacute;ser, estampado y bordado con el logo de tu empresa. Cada producto lleva la identidad de tu marca.</p>
              </div>

              <div className="info-page-card">
                <div className="info-page-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                </div>
                <h3>Regalos Corporativos</h3>
                <p>Sorprend&eacute; a tus empleados, clientes y socios con productos premium que generan impacto.</p>
              </div>

              <div className="info-page-card">
                <div className="info-page-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                </div>
                <h3>Pedidos por Volumen</h3>
                <p>Producci&oacute;n a medida con precios especiales para grandes cantidades. Entregas coordinadas a tu oficina.</p>
              </div>

              <div className="info-page-card">
                <div className="info-page-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <h3>Calidad Premium</h3>
                <p>Materiales de primera selecci&oacute;n, costuras reforzadas y terminaciones artesanales que hablan de excelencia.</p>
              </div>
            </div>

            <div className="info-page-cta-section">
              <h2>Hac&eacute; que tu empresa se destaque</h2>
              <p>Contactanos y armamos una propuesta a medida para tu equipo.</p>
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

export default EmpresasPage;
