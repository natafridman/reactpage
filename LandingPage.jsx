import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';

import Header from '/components/Header.jsx';
import HeroSection from '/components/HeroSection.jsx';
import ClientsSection from '/components/ClientsSection.jsx';
import FeaturedProducts from '/components/FeaturedProducts.jsx';
import VisionMission from '/components/VisionMission.jsx';
import Footer from '/components/Footer.jsx';

function LandingPage() {
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

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

    const whatsappNumber = '5491153445155';
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
        <VisionMission />
        <FeaturedProducts />
        <ClientsSection />
      </main>

      <Footer onContactSubmit={handleContactSubmit} />
    </div>
  );
}

export default LandingPage;