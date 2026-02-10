function FeaturedProducts() {
  const products = [
    {
      id: 1,
      video: '/videos/product1.mp4',
      title: 'Bolso Executive',
      description: 'Elegancia atemporal para el profesional moderno',
      category: 'Bolsos'
    },
    {
      id: 2,
      video: '/videos/product2.mp4',
      title: 'Billetera Premium',
      description: 'Minimalismo y funcionalidad en cada detalle',
      category: 'Billeteras'
    },
    {
      id: 3,
      video: '/videos/product3.mp4',
      title: 'Cinturón Artesanal',
      description: 'Cuero de primera calidad, acabado perfecto',
      category: 'Accesorios'
    }
  ];

  return (
    <section className="featured-section">
      <div className="featured-container">
        <div className="featured-header">
          <span className="featured-subtitle">Colección</span>
          <h2 className="featured-title">Los favoritos de las marcas</h2>
          <p className="featured-intro">
            Productos que destacan por su calidad excepcional y diseño innovador
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
              <div className="featured-video-wrapper">
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
              </div>
              
              <div className="featured-content">
                <h3 className="featured-product-title">{product.title}</h3>
                <p className="featured-product-description">{product.description}</p>
                <button className="featured-link">
                  Ver detalles
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
