import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadManifest } from '/utils/productUtils.js';

const IMAGES_BASE_FOLDER = 'images/Categorias';

function CategoryBanner({ category }) {
  const [bubbleImages, setBubbleImages] = useState([]);
  const trackRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!category) return;

    async function loadCategoryImages() {
      try {
        const manifest = await loadManifest();
        const productsInCategory = manifest[category];
        if (!productsInCategory || productsInCategory.length === 0) return;

        const shuffled = [...productsInCategory].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 15);

        const images = [];
        for (const productFolder of selected) {
          const metadataPath = `/${IMAGES_BASE_FOLDER}/${category}/${productFolder}/metadata.txt`;
          try {
            const res = await fetch(metadataPath);
            if (!res.ok) continue;
            const text = await res.text();
            const lines = text.trim().split('\n');
            for (const line of lines) {
              const [key, ...valueParts] = line.split(':');
              if (key && key.trim().toLowerCase() === 'images') {
                const rawValue = valueParts.join(':').trim();
                const imgList = rawValue.split(',').map(s => s.trim()).filter(Boolean);
                if (imgList.length > 0) {
                  const randomImg = imgList[Math.floor(Math.random() * imgList.length)];
                  images.push({
                    src: `/${IMAGES_BASE_FOLDER}/${category}/${productFolder}/${randomImg}`,
                    name: productFolder
                  });
                }
                break;
              }
            }
          } catch { /* skip */ }
        }

        setBubbleImages(images);
      } catch (err) {
        console.error('Error loading category banner images:', err);
      }
    }

    setBubbleImages([]);
    loadCategoryImages();
  }, [category]);

  if (!category || bubbleImages.length === 0) return null;

  const goToProduct = (name) => {
    navigate(`/producto/${encodeURIComponent(category)}/${encodeURIComponent(name)}`);
  };

  const itemWidth = 135;
  const singleSetWidth = bubbleImages.length * itemWidth;
  const minWidth = 2 * 1920;
  const repeats = Math.max(2, Math.ceil(minWidth / singleSetWidth));
  const duplicated = Array.from({ length: repeats }, () => bubbleImages).flat();
  const scrollPercent = (100 / repeats);

  return (
    <section className="category-banner">
      <div className="category-banner-content">
        <h1 className="category-banner-title">{category}</h1>
        <div className="category-banner-divider"></div>
      </div>
      <div className="category-bubbles-wrapper">
        <div
          className="category-bubbles-track"
          ref={trackRef}
          style={{ '--scroll-percent': `-${scrollPercent}%` }}
        >
          {duplicated.map((img, i) => (
            <div
              className="category-bubble"
              key={i}
              onClick={() => goToProduct(img.name)}
            >
              <img src={img.src} alt={img.name} loading="eager" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryBanner;
