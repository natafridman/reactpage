import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { metadata, category, productFolder, availableImages } = product;
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [imgHeight, setImgHeight] = useState(null);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef(null);
  const firstLoaded = useRef(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const IMAGES_BASE_FOLDER = '/images/Categorias';
  const productPath = `${IMAGES_BASE_FOLDER}/${category}/${productFolder}`;
  const imageList = Array.isArray(metadata.images) ? metadata.images : availableImages;

  const productUrl = `/producto/${encodeURIComponent(category)}/${encodeURIComponent(productFolder)}`;

  const goToProduct = (e) => {
    // Let middle-click / ctrl+click open in new tab naturally
    if (e.button === 1 || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    navigate(productUrl);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIdx(prev => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIdx(prev => (prev + 1) % imageList.length);
  };

  return (
    <div ref={cardRef} className={`product-card ${visible ? 'card-visible' : ''}`}>
      <a href={productUrl} className="product-card-image" onClick={goToProduct} style={imgHeight ? { height: imgHeight } : undefined}>
        <img
          src={`${productPath}/${imageList[currentImgIdx] || 'hero.jpg'}`}
          alt={metadata.title}
          loading="lazy"
          onLoad={(e) => {
            if (!firstLoaded.current) {
              firstLoaded.current = true;
              setImgHeight(e.target.offsetHeight);
            }
          }}
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
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImgIdx(i); }}
                />
              ))}
            </div>
          </>
        )}
      </a>
      <a href={productUrl} className="product-card-info" onClick={goToProduct}>
        <h3 className="product-card-title">{metadata.title || productFolder}</h3>
        <p className="product-card-subtitle">{metadata.subtitle || category}</p>
        <span className="product-card-code">{metadata.code || ''}</span>
      </a>
    </div>
  );
}

export default ProductCard;
