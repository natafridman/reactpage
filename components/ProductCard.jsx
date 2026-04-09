import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { metadata, category, productFolder, availableImages } = product;
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const IMAGES_BASE_FOLDER = '/images/Categorias';
  const productPath = `${IMAGES_BASE_FOLDER}/${category}/${productFolder}`;
  const imageList = Array.isArray(metadata.images) ? metadata.images : availableImages;

  const goToProduct = () => {
    navigate(`/producto/${encodeURIComponent(category)}/${encodeURIComponent(productFolder)}`);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImgIdx(prev => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImgIdx(prev => (prev + 1) % imageList.length);
  };

  return (
    <div className="product-card">
      <div className="product-card-image" onClick={goToProduct}>
        <img
          src={`${productPath}/${imageList[currentImgIdx] || 'hero.jpg'}`}
          alt={metadata.title}
          loading="lazy"
        />
        {imageList.length > 1 && (
          <>
            <button className="card-img-nav card-img-prev" onClick={handlePrev}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button className="card-img-nav card-img-next" onClick={handleNext}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <div className="card-img-dots">
              {imageList.map((_, i) => (
                <span
                  key={i}
                  className={`card-dot ${i === currentImgIdx ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setCurrentImgIdx(i); }}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="product-card-info" onClick={goToProduct}>
        <h3 className="product-card-title">{metadata.title || productFolder}</h3>
        <p className="product-card-subtitle">{metadata.subtitle || category}</p>
        <span className="product-card-code">{metadata.code || ''}</span>
      </div>
    </div>
  );
}

export default ProductCard;
