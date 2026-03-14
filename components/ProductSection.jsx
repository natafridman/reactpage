import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductSection({ product, onImageClick }) {
  const navigate = useNavigate();
  const { metadata, category, productFolder, index, availableImages } = product;
  const [copied, setCopied] = useState(false);

  const IMAGES_BASE_FOLDER = '/images/Categorias';
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
  const titlePosition = isOdd ? { left: '3rem', right: 'auto' } : { right: '3rem', left: 'auto' };
  const titleTransform = isOdd ? 'translateX(-50px)' : 'translateX(50px)';
  const textAlign = isOdd ? 'right' : 'left';
  const numberPosition = isOdd ? { left: 'auto', right: '2rem' } : { left: '2rem', right: 'auto' };
  const contentMargin = isOdd ? { marginLeft: 'auto', marginRight: 0 } : { marginLeft: 0, marginRight: 'auto' };

  function handleShare() {
    const url = `${window.location.origin}/producto/${encodeURIComponent(category)}/${encodeURIComponent(productFolder)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for browsers without clipboard API
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
            className={`product-title-overlay ${isOdd ? 'title-left' : 'title-right'}`}
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
        <div className="accent-number">
          {metadata.code || String(index + 1).padStart(2, '0')}
        </div>

        <div className="description-text" style={contentMargin}>
          <p>{metadata.description || 'Descripcion del producto.'}</p>
        </div>

        <div className="product-actions" style={contentMargin}>
          <button className="share-btn" onClick={handleShare}>
            {copied ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Link copiado
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Compartir
              </>
            )}
          </button>
          <button
            className="share-btn category-btn"
            onClick={() => navigate(`/productos?categoria=${encodeURIComponent(category)}`)}
          >
            {category}
          </button>
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
