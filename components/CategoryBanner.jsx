import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadManifest } from '/utils/productUtils.js';

const IMAGES_BASE_FOLDER = 'images/Categorias';

function CategoryBanner({ category }) {
  const [bubbleImages, setBubbleImages] = useState([]);
  const trackRef = useRef(null);
  const navigate = useNavigate();

  // Manual animation state
  const animState = useRef({
    position: 0,        // current X position in px
    baseSpeed: 0,       // px per frame at normal speed (calculated from track width)
    speed: 0,           // current speed (can be boosted)
    touching: false,
    touchStartX: 0,
    touchStartPos: 0,
    lastTouchX: 0,
    lastTouchTime: 0,
    velocity: 0,        // swipe velocity for momentum
    raf: null,
    singleSetWidth: 0,  // width of one set of images for wrapping
  });

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

  // Manual animation loop (replaces CSS animation)
  useEffect(() => {
    const track = trackRef.current;
    if (!track || bubbleImages.length < 5) return;

    // Remove CSS animation - we drive it manually
    track.style.animation = 'none';

    const state = animState.current;

    // Calculate single set width after render
    const computeWidths = () => {
      const itemCount = bubbleImages.length;
      const bubble = track.querySelector('.category-bubble');
      if (!bubble) return;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.gap) || 24;
      const bubbleWidth = bubble.offsetWidth;
      state.singleSetWidth = itemCount * (bubbleWidth + gap);
      // Speed: traverse one set in ~50s => px per frame at 60fps
      state.baseSpeed = state.singleSetWidth / (50 * 60);
      state.speed = state.baseSpeed;
    };

    // Wait for layout
    requestAnimationFrame(computeWidths);

    const animate = () => {
      if (!state.touching) {
        // Apply momentum decay if there's residual velocity from swipe
        if (Math.abs(state.velocity) > 0.1) {
          state.position += state.velocity;
          // Decay velocity towards 0, then blend back to base scroll speed
          state.velocity *= 0.95;
        } else {
          // Normal auto-scroll (left direction = negative)
          state.velocity = 0;
          state.position -= state.speed;
        }
      }

      // Wrap position to avoid huge numbers
      if (state.singleSetWidth > 0) {
        while (state.position < -state.singleSetWidth) {
          state.position += state.singleSetWidth;
        }
        while (state.position > 0) {
          state.position -= state.singleSetWidth;
        }
      }

      track.style.transform = `translateX(${state.position}px)`;
      state.raf = requestAnimationFrame(animate);
    };

    state.raf = requestAnimationFrame(animate);

    return () => {
      if (state.raf) cancelAnimationFrame(state.raf);
    };
  }, [bubbleImages]);

  const showBubbles = bubbleImages.length >= 5;

  const goToProduct = (img) => {
    navigate(`/producto/${encodeURIComponent(img.category)}/${encodeURIComponent(img.name)}`);
  };

  const handleTouchStart = (e) => {
    const state = animState.current;
    state.touching = true;
    state.touchStartX = e.touches[0].clientX;
    state.touchStartPos = state.position;
    state.lastTouchX = e.touches[0].clientX;
    state.lastTouchTime = Date.now();
    state.velocity = 0;
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // prevent vertical scroll
    const state = animState.current;
    if (!state.touching) return;

    const currentX = e.touches[0].clientX;
    const now = Date.now();

    // Move track with finger
    const dx = currentX - state.touchStartX;
    state.position = state.touchStartPos + dx;

    // Track velocity for momentum
    const dt = now - state.lastTouchTime;
    if (dt > 5) {
      const frameDx = currentX - state.lastTouchX;
      state.velocity = state.velocity * 0.6 + (frameDx / dt) * 16 * 0.4; // smoothed, in px/frame
      state.lastTouchX = currentX;
      state.lastTouchTime = now;
    }
  };

  const handleTouchEnd = () => {
    const state = animState.current;
    state.touching = false;
    // velocity is preserved and will decay in the animation loop,
    // then auto-scroll resumes naturally
  };

  let duplicated = [];
  if (showBubbles) {
    const itemWidth = 135;
    const singleSetWidth = bubbleImages.length * itemWidth;
    const minWidth = 2 * 1920;
    const repeats = Math.max(3, Math.ceil(minWidth / singleSetWidth) + 1);
    duplicated = Array.from({ length: repeats }, () => bubbleImages).flat();
  }

  return (
    <section className="category-banner">
      <div className="category-banner-content">
        <h1 className="category-banner-title">{title}</h1>
        <div className="category-banner-divider"></div>
      </div>
      {showBubbles && (
        <div
          className="category-bubbles-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          <div
            className="category-bubbles-track"
            ref={trackRef}
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
