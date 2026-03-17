import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadManifest } from '/utils/productUtils.js';

const IMAGES_BASE_FOLDER = 'images/Categorias';

function CategoryBanner({ category }) {
  const [bubbleImages, setBubbleImages] = useState([]);
  const trackRef = useRef(null);
  const navigate = useNavigate();

  // Touch/swipe state
  const touchStartX = useRef(null);
  const currentOffset = useRef(0);
  const animationPaused = useRef(false);
  const resumeTimer = useRef(null);

  const isAll = !category;
  const title = isAll ? 'Productos' : category;

  useEffect(() => {
    async function loadImages() {
      try {
        const manifest = await loadManifest();

        let allProducts = [];
        if (isAll) {
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

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    const track = trackRef.current;
    if (!track) return;

    // Get current computed transform
    const style = window.getComputedStyle(track);
    const matrix = new DOMMatrix(style.transform);
    currentOffset.current = matrix.m41;

    // Pause animation
    track.style.animation = 'none';
    track.style.transform = `translateX(${currentOffset.current}px)`;
    animationPaused.current = true;

    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const track = trackRef.current;
    if (!track) return;

    const deltaX = e.touches[0].clientX - touchStartX.current;
    track.style.transform = `translateX(${currentOffset.current + deltaX}px)`;
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
    const track = trackRef.current;
    if (!track) return;

    // Resume animation after a short delay
    resumeTimer.current = setTimeout(() => {
      // Get current position and calculate offset percentage
      const style = window.getComputedStyle(track);
      const matrix = new DOMMatrix(style.transform);
      const currentX = matrix.m41;
      const trackWidth = track.scrollWidth;

      // Normalize position within bounds
      let normalizedX = currentX % (trackWidth / 2);
      if (normalizedX > 0) normalizedX -= trackWidth / 2;

      // Set custom property for animation start and resume
      track.style.transform = '';
      track.style.setProperty('--swipe-offset', `${normalizedX}px`);
      track.style.animation = '';
      animationPaused.current = false;
    }, 1500);
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
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
