import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadManifest } from '/utils/productUtils.js';

const IMAGES_BASE_FOLDER = 'images/Categorias';

function CategoryBanner({ category }) {
  const [bubbleImages, setBubbleImages] = useState([]);
  const trackRef = useRef(null);
  const navigate = useNavigate();

  // category = specific category name, or null/undefined = all products
  const isAll = !category;
  const title = isAll ? 'Productos' : category;

  useEffect(() => {
    async function loadImages() {
      try {
        const manifest = await loadManifest();

        let allProducts = [];
        if (isAll) {
          // Gather all products from all categories
          for (const cat of Object.keys(manifest)) {
            for (const folder of manifest[cat]) {
              allProducts.push({ category: cat, productFolder: folder });
            }
          }
        } else {
          const productsInCategory = manifest[category];
          if (!productsInCategory || productsInCategory.length === 0) return;
          allProducts = productsInCategory.map(folder => ({ category, productFolder: folder }));
        }

        const shuffled = allProducts.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 15);

        const images = [];
        for (const { category: cat, productFolder } of selected) {
          const metadataPath = `/${IMAGES_BASE_FOLDER}/${cat}/${productFolder}/metadata.txt`;
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
                    src: `/${IMAGES_BASE_FOLDER}/${cat}/${productFolder}/${randomImg}`,
                    name: productFolder,
                    category: cat
                  });
                }
                break;
              }
            }
          } catch { /* skip */ }
        }

        setBubbleImages(images);
      } catch (err) {
        console.error('Error loading banner images:', err);
      }
    }

    setBubbleImages([]);
    loadImages();
  }, [category]);

  const showBubbles = bubbleImages.length >= 5;

  const goToProduct = (img) => {
    navigate(`/producto/${encodeURIComponent(img.category)}/${encodeURIComponent(img.name)}`);
  };

  let duplicated = [];
  let scrollPercent = 50;
  if (showBubbles) {
    const itemWidth = 135;
    const singleSetWidth = bubbleImages.length * itemWidth;
    const minWidth = 2 * 1920;
    const repeats = Math.max(2, Math.ceil(minWidth / singleSetWidth));
    duplicated = Array.from({ length: repeats }, () => bubbleImages).flat();
    scrollPercent = (100 / repeats);
  }

  return (
    <section className="category-banner">
      <div className="category-banner-content">
        <h1 className="category-banner-title">{title}</h1>
        <div className="category-banner-divider"></div>
      </div>
      {showBubbles && (
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
                onClick={() => goToProduct(img)}
              >
                <img src={img.src} alt={img.name} loading="eager" />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default CategoryBanner;
