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

  function handleContact() {
    const msg = encodeURIComponent(`Hola, me gustaría saber más sobre el producto "${metadata.title || productFolder}" (${metadata.code || ''}).`);
    window.open(`https://wa.me/5491178279281?text=${msg}`, '_blank');
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
          <button className="share-btn icon-btn" onClick={handleShare} title={copied ? 'Link copiado' : 'Compartir'}>
            {copied ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            )}
          </button>
          <button className="share-btn contact-btn" onClick={handleContact}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16.004 0C7.165 0 0 7.163 0 16.001c0 2.82.736 5.573 2.137 7.998L.074 31.79a.5.5 0 0 0 .612.613l7.89-2.066A15.93 15.93 0 0 0 16.004 32C24.837 32 32 24.837 32 16.001 32 7.163 24.837 0 16.004 0zm0 29.333a13.27 13.27 0 0 1-6.87-1.907.5.5 0 0 0-.426-.05l-5.47 1.432 1.43-5.393a.5.5 0 0 0-.054-.432A13.28 13.28 0 0 1 2.667 16C2.667 8.636 8.638 2.667 16.004 2.667c7.364 0 13.33 5.969 13.33 13.334 0 7.364-5.966 13.332-13.33 13.332zm7.327-9.96c-.4-.2-2.366-1.167-2.733-1.3-.366-.133-.633-.2-.9.2s-1.033 1.3-1.266 1.567c-.233.267-.467.3-.867.1s-1.69-.623-3.22-1.987c-1.19-1.062-1.993-2.374-2.227-2.774s-.025-.617.175-.817c.18-.18.4-.467.6-.7.2-.233.267-.4.4-.667s.067-.5-.033-.7c-.1-.2-.9-2.167-1.233-2.967-.325-.778-.655-.673-.9-.685l-.767-.013a1.47 1.47 0 0 0-1.067.5c-.367.4-1.4 1.367-1.4 3.334s1.433 3.867 1.633 4.133c.2.267 2.823 4.31 6.84 6.043.955.413 1.7.659 2.281.844.959.305 1.832.262 2.522.159.77-.115 2.367-.968 2.7-1.902.333-.934.333-1.734.233-1.902-.1-.167-.367-.267-.767-.467z"/>
            </svg>
            Contactar
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
