import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '/components/Header.jsx';
import Footer from '/components/Footer.jsx';
import { loadManifest } from '/utils/productUtils.js';
import './landing.css';

const WA_NUMBER = '5491178279281';

const valores = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    ),
    title: 'Buenos materiales',
    description: 'Cuero genuino, herrajes de alta resistencia y telas seleccionadas. No usamos materiales de relleno.'
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    ),
    title: 'Diseño con criterio',
    description: 'Cada producto tiene un propósito claro. Pensamos en el uso real, no en tendencias pasajeras.'
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    title: 'Trabajo honesto',
    description: 'Contacto directo, presupuestos claros y plazos que cumplimos. Sin intermediarios ni sorpresas.'
  }
];

function NosotrosPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isMenuActive, setIsMenuActive] = useState(false);

  useEffect(() => {
    document.title = 'B2YOU - Quiénes Somos';
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
    const msg = encodeURIComponent('Hola, los contacto desde la web. Me gustaría conocer más sobre B2YOU.');
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
        <section className="info-page-hero nosotros-hero">
          <div className="info-page-hero-overlay"></div>
          <div className="info-page-hero-content">
            <span className="info-page-label">B2YOU</span>
            <h1 className="info-page-title">Quiénes somos</h1>
            <p className="info-page-subtitle">
              Un taller de Buenos Aires que hace accesorios bien hechos, con materiales reales y trabajo honesto.
            </p>
          </div>
        </section>

        <section className="nosotros-intro-section">
          <div className="info-page-container">
            <div className="nosotros-intro-grid">
              <div className="nosotros-intro-text">
                <span className="nosotros-label">Nuestra historia</span>
                <h2 className="nosotros-intro-title">Lo que nos mueve</h2>
                <p>
                  B2YOU nació de la convicción de que los accesorios tienen que durar. Que cada producto que sale del taller tiene que ser algo que de verdad uses, que te acompañe, y que represente bien a quien lo lleva.
                </p>
                <p>
                  Trabajamos con marcas y empresas que buscan lo mismo: productos bien hechos, con su identidad, a su medida. Sin moldes fijos. Cada proyecto lo encaramos desde cero.
                </p>
                <p>
                  Con sede en Buenos Aires, combinamos producción artesanal con escala profesional para que el resultado sea siempre consistente, sin importar la cantidad del pedido.
                </p>
              </div>
              <div className="nosotros-intro-stats">
                <div className="nosotros-stat">
                  <span className="nosotros-stat-number">8+</span>
                  <span className="nosotros-stat-label">Categorías de productos</span>
                </div>
                <div className="nosotros-stat">
                  <span className="nosotros-stat-number">100%</span>
                  <span className="nosotros-stat-label">Personalizable</span>
                </div>
                <div className="nosotros-stat">
                  <span className="nosotros-stat-number">B2B</span>
                  <span className="nosotros-stat-label">Foco en marcas y empresas</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="nosotros-valores-section">
          <div className="info-page-container">
            <div className="nosotros-valores-header">
              <span className="nosotros-label">Valores</span>
              <h2 className="nosotros-valores-title">Cómo lo hacemos</h2>
            </div>
            <div className="info-page-grid">
              {valores.map((v, i) => (
                <div key={i} className="info-page-card">
                  <div className="info-page-icon">
                    {v.icon}
                  </div>
                  <h3>{v.title}</h3>
                  <p>{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="nosotros-cta-section">
          <div className="info-page-container">
            <div className="info-page-cta-section">
              <h2>¿Querés trabajar con nosotros?</h2>
              <p>Contanos qué necesitás y armamos una propuesta a medida.</p>
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

export default NosotrosPage;
