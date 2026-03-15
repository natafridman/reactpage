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

        // Shuffle and pick up to 10
        const shuffled = [...productsInCategory].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 10);

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
                  // Pick a random image from this product
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

  // Repeat enough times to always fill wide screens (each bubble ~135px with gap)
  // Need at least 2x viewport width for seamless loop
  // Each set = bubbleImages.length items. We need at least 2 sets to loop seamlessly.
  // On wide screens we need more sets so there's no gap visible.
  const itemWidth = 135; // 120px bubble + 15px gap
  const singleSetWidth = bubbleImages.length * itemWidth;
  const minWidth = 2 * 1920; // cover 2x a wide viewport
  const repeats = Math.max(2, Math.ceil(minWidth / singleSetWidth));
  const duplicated = Array.from({ length: repeats }, () => bubbleImages).flat();
  // Scroll exactly one set's worth so it loops seamlessly
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
              onClick={() => navigate(`/producto/${encodeURIComponent(category)}/${encodeURIComponent(img.name)}`)}
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
