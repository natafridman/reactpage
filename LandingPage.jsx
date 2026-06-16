import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';

import Header from '/components/Header.jsx';
import HeroSection from '/components/HeroSection.jsx';
import TrustBar from '/components/TrustBar.jsx';
import BrandStory from '/components/BrandStory.jsx';
import FeaturedProducts from '/components/FeaturedProducts.jsx';
import ProductsCarousel from '/components/ProductsCarousel.jsx';
import VisionMission from '/components/VisionMission.jsx';
import TestimonialsSection from '/components/TestimonialsSection.jsx';
import Footer from '/components/Footer.jsx';

const WA_NUMBER = '5491178279281';
const WA_QUOTE = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  'Hola B2YOU, quiero pedir una cotización para mi marca/empresa.'
)}`;

function LandingPage() {
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'B2YOU - Accesorios para Marcas y Empresas';
  }, []);

  // Cargar categorías al montar el componente
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/manifest.json');
        const manifest = await response.json();
        setCategories(Object.keys(manifest));
      } catch (error) {
        console.error('Error cargando categorías:', error);
        // Fallback con categorías por defecto
        setCategories(['Bolsos', 'Billeteras', 'Cinturones', 'Mochilas', 'Accesorios']);
      }
    }
    
    loadCategories();
  }, []);

  // Handler del formulario de contacto
  function handleContactSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;

    const subject = encodeURIComponent(`Mensaje de ${name}`);
    const body = encodeURIComponent(
      `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`
    );

    const whatsappNumber = '5491178279281';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${subject}%0A%0A${body}`;

    window.open(whatsappURL, '_blank');
    e.target.reset();
  }

  // Handler para ir a la página de productos
  function handleLogoClick() {
     window.location.href = window.location.origin;
  }

  // Handler para categorías
  function handleCategoryClick(e, cat) {
    e.preventDefault();
    navigate(`/productos?categoria=${encodeURIComponent(cat)}`);
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
        <HeroSection />
        <TrustBar />
        <BrandStory />
        <FeaturedProducts />
        <VisionMission />
        <ProductsCarousel />
        <TestimonialsSection />

        <section className="closing-cta">
          <div className="closing-cta-inner">
            <span className="closing-cta-eyebrow">Tu marca, en cada detalle</span>
            <h2 className="closing-cta-title">¿Listos para crear algo tuyo?</h2>
            <p className="closing-cta-text">
              Contanos qué tenés en mente y armamos una propuesta a medida — sin compromiso.
            </p>
            <div className="closing-cta-actions">
              <a className="closing-cta-primary" href={WA_QUOTE} target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16.004 0C7.165 0 0 7.163 0 16.001c0 2.82.736 5.573 2.137 7.998L.074 31.79a.5.5 0 0 0 .612.613l7.89-2.066A15.93 15.93 0 0 0 16.004 32C24.837 32 32 24.837 32 16.001 32 7.163 24.837 0 16.004 0zm0 29.333a13.27 13.27 0 0 1-6.87-1.907.5.5 0 0 0-.426-.05l-5.47 1.432 1.43-5.393a.5.5 0 0 0-.054-.432A13.28 13.28 0 0 1 2.667 16C2.667 8.636 8.638 2.667 16.004 2.667c7.364 0 13.33 5.969 13.33 13.334 0 7.364-5.966 13.332-13.33 13.332z"/>
                </svg>
                Pedí tu cotización
              </a>
              <button className="closing-cta-secondary" onClick={() => navigate('/productos')}>
                Ver productos
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer onContactSubmit={handleContactSubmit} />
    </div>
  );
}

export default LandingPage;