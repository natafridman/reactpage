import { useNavigate } from 'react-router-dom';
import ProductSlideshow from '/components/ProductSlideshow.jsx';
import { medSrc } from '/utils/productUtils.js';

function FeaturedProducts() {
  const navigate = useNavigate();

  const products = [
    {
      id: 1,
      title: 'Camiseta Argentina',
      description: 'La camiseta de la Selección con escudo AFA y parche FIFA World Champions 2022. Ideal para personalizar con tu marca.',
      category: 'Mundial',
      image: '/images/Categorias/Mundial/Camiseta/WhatsApp Image 2026-03-16 at 17.05.15.jpeg'
    },
    {
      id: 2,
      title: 'Bolso Duffle',
      description: 'Pensado para viajes y escapadas. Amplio, resistente y con terminaciones cuidadas en cada detalle.',
      category: 'Bolsos',
      image: '/images/Categorias/Bolsos/Bolso Duffle/IMG_1585.jpeg'
    },
    {
      id: 3,
      title: 'Gorra Casual',
      description: 'Estilo relajado para todos los días. Simple, cómoda y con buena onda.',
      category: 'Gorras',
      image: '/images/Categorias/Gorras/Gorra Casual/IMG_4567.jpeg'
    }
  ];

  const items = products.map((p) => ({
    key: p.id,
    src: medSrc(p.image),
    full: p.image,
    eyebrow: p.category,
    title: p.title,
    description: p.description,
    cta: 'Ver productos',
    onClick: () => navigate(`/productos?categoria=${encodeURIComponent(p.category)}`),
  }));

  return (
    <section className="featured-section">
      <div className="featured-container">
        <div className="featured-header">
          <span className="featured-subtitle">Destacados</span>
          <h2 className="featured-title">Lo que más <em className="accent">eligen</em> nuestros clientes</h2>
          <p className="featured-intro">
            Algunos de los productos con los que más nos piden trabajar
          </p>
          <div className="featured-divider"></div>
        </div>

        <ProductSlideshow items={items} autoplay interval={6000} />
      </div>
    </section>
  );
}

export default FeaturedProducts;
