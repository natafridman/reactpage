function ProductSection({ product, onImageClick }) {
  const { metadata, category, productFolder, index, availableImages } = product;
  
  const IMAGES_BASE_FOLDER = 'images/Categorias';
  const productPath = `${IMAGES_BASE_FOLDER}/${category}/${productFolder}`;
  
  // Video and image handling
  const videoList = Array.isArray(metadata.videos) ? metadata.videos : (metadata.video ? [metadata.video] : []);
  const imageList = Array.isArray(metadata.images) ? metadata.images : availableImages;
  const hasVideo = videoList.length > 0;
  const heroImage = imageList.length > 0 ? imageList[0] : 'hero.jpg';
  
  const gallerySource = hasVideo ? imageList : (imageList.length > 1 ? imageList.slice(1) : imageList);
  
  // Layout calculation
  const isOdd = (index + 1) % 2 !== 0;
  const flexDirection = isOdd ? 'row-reverse' : 'row';
  const titlePosition = isOdd ? { left: '3%', right: 'auto' } : { right: '3%', left: 'auto' };
  const titleTransform = isOdd ? 'translateX(-50px)' : 'translateX(50px)';
  const textAlign = isOdd ? 'right' : 'left';
  const numberPosition = isOdd ? { left: 'auto', right: '2rem' } : { left: '2rem', right: 'auto' };
  const contentMargin = isOdd ? { marginLeft: 'auto', marginRight: 0 } : { marginLeft: 0, marginRight: 'auto' };

  return (
    <section 
      className="product-section" 
      data-product={productFolder}
      style={{ flexDirection }}
    >
      <div className="hero-side">
        <div className="hero-image-wrapper">
          {hasVideo ? (
            <video className="hero-image" autoPlay loop muted playsInline>
              <source src={`${productPath}/${videoList[0]}`} type="video/mp4" />
            </video>
          ) : (
            <img 
              src={`${productPath}/${heroImage}`} 
              alt={metadata.title} 
              className="hero-image" 
            />
          )}
          <div 
            className="product-title-overlay" 
            style={{ 
              ...titlePosition, 
              transform: titleTransform 
            }}
          >
            <div className="product-subtitle">
              {metadata.subtitle || category.toUpperCase()}
            </div>
            <h2>{metadata.title || 'Producto'}</h2>
          </div>
        </div>
      </div>

      <div className="gallery-side" style={{ textAlign }}>
        <div className="accent-number" style={numberPosition}>
          {metadata.code || String(index + 1).padStart(2, '0')}
        </div>

        <div className="description-text" style={contentMargin}>
          <p>{metadata.description || 'Descripción del producto.'}</p>
        </div>

        <div className="gallery-grid" style={contentMargin}>
          {gallerySource.map((filename, idx) => (
            <div 
              key={idx}
              className="gallery-item"
            >
              <img 
                src={`${productPath}/${filename}`} 
                alt={`${metadata.title} - Imagen ${idx + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductSection;
