import { useNavigate } from 'react-router-dom';

function FeaturedProducts() {
  const navigate = useNavigate();

  const products = [
    {
      id: 1,
      video: '/images/Categorias/Bolsos/Bolso Duffle/bolso.mp4',
      title: 'Bolso Duffle',
      description: 'Pensado para viajes y escapadas. Amplio, resistente y con terminaciones cuidadas en cada detalle.',
      category: 'Bolsos',
      image: '/images/Categorias/Bolsos/Bolso Duffle/IMG_1585.jpeg'
    },
    {
      id: 2,
      video: '/images/Categorias/Mochilas/Mochila London/mochila.mp4',
      title: 'Mochila London',
      description: 'Cómoda para el día a día, con respaldo acolchado y compartimientos pensados para que lleves todo con vos.',
      category: 'Mochilas',
      image: '/images/Categorias/Mochilas/Mochila London/LONDON(1).jpeg'
    },
    {
      id: 3,
      video: '/images/Categorias/Gorras/Gorra Verano/gorra_verano.mp4',
      title: 'Gorra Casual',
      description: 'Estilo relajado para todos los días. Simple, cómoda y con buena onda.',
      category: 'Gorras',
      image: '/images/Categorias/Gorras/Gorra Verano/IMG_4567.jpeg'
    }
  ];

  return (
    <section className="featured-section">
      <div className="featured-container">
        <div className="featured-header">
          <span className="featured-subtitle">Destacados</span>
          <h2 className="featured-title">Lo que más eligen nuestros clientes</h2>
          <p className="featured-intro">
            Algunos de los productos con los que más nos piden trabajar
          </p>
          <div className="featured-divider"></div>
        </div>

        <div className="featured-grid">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="featured-card"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* <div className="featured-video-wrapper">
                <video 
                  className="featured-video" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src={product.video} type="video/mp4" />
                </video>
                <div className="featured-overlay">
                  <span className="featured-category">{product.category}</span>
                </div>
              </div> */}
              <img 
                src={`${product.image}`} 
                alt={product.title}
                className="featured-video-wrapper"></img>
              
              <div className="featured-content">
                <h3 className="featured-product-title">{product.title}</h3>
                <p className="featured-product-description">{product.description}</p>
                <button className="featured-link" onClick={() => navigate(`/productos?categoria=${encodeURIComponent(product.category)}`)}>
                  Ver mas
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
