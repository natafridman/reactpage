import { useState, useEffect, useRef } from 'react';
import { loadManifest, getCategoryFromURL, parseMetadata, getAvailableImages, IMAGES_BASE_FOLDER } from '../utils/productUtils';

// ===== HOOK: Load Products =====
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      console.log('📦 Cargando productos...');
      
      try {
        const manifest = await loadManifest();
        const selectedCategory = getCategoryFromURL();
        
        console.log('🔍 Categoría seleccionada:', selectedCategory || 'TODAS');
        
        let productIndex = 0;
        const loadedProducts = [];
        
        // Determinar qué categorías cargar
        const categoriesToLoad = selectedCategory 
          ? [selectedCategory] 
          : Object.keys(manifest);
        
        console.log('📂 Categorías a cargar:', categoriesToLoad);
        
        for (const category of categoriesToLoad) {
          // Verificar que la categoría existe en el manifest
          if (!manifest[category]) {
            console.warn(`⚠️ Categoría "${category}" no encontrada en manifest`);
            continue;
          }
          
          const productsInCategory = manifest[category];
          
          for (const productFolder of productsInCategory) {
            const metadataPath = `${IMAGES_BASE_FOLDER}/${category}/${productFolder}/metadata.txt`;
            
            try {
              const metadataResponse = await fetch(metadataPath);
              if (!metadataResponse.ok) {
                console.warn(`Metadata no encontrado: ${metadataPath}`);
                continue;
              }
              
              const metadataText = await metadataResponse.text();
              const metadata = parseMetadata(metadataText);
              
              const availableImages = await getAvailableImages(`${IMAGES_BASE_FOLDER}/${category}/${productFolder}`);
              
              loadedProducts.push({
                metadata,
                category,
                productFolder,
                index: productIndex,
                availableImages
              });
              
              productIndex++;
              
            } catch (error) {
              console.error(`Error cargando producto ${productFolder}:`, error);
            }
          }
        }
        
        setProducts(loadedProducts);
        setIsLoading(false);
        console.log(`✅ ${productIndex} productos cargados`);
        
      } catch (error) {
        console.error('❌ Error cargando productos:', error);
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  return { products, isLoading };
}

// ===== HOOK: Load Categories =====
export function useCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function initializeMenu() {
      try {
        const manifest = await loadManifest();
        const cats = Object.keys(manifest);
        setCategories(cats);
      } catch (error) {
        console.error('Error cargando manifest:', error);
      }
    }

    initializeMenu();
  }, []);

  return categories;
}

// ===== HOOK: Scroll Behavior =====
export function useScrollBehavior() {
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollY = useRef(window.scrollY);
  const scrollTimer = useRef(null);

  useEffect(() => {
    const scrollThreshold = 100;
    
    function handleScroll() {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsHeaderHidden(false);
        lastScrollY.current = currentScrollY;
        return;
      }
      
      if (Math.abs(currentScrollY - lastScrollY.current) < 5) {
        return;
      }
      
      if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
        if (scrollTimer.current) clearTimeout(scrollTimer.current);
        scrollTimer.current = setTimeout(() => {
          setIsHeaderHidden(true);
        }, 150);
      } 
      else if (currentScrollY < lastScrollY.current) {
        if (scrollTimer.current) clearTimeout(scrollTimer.current);
        setIsHeaderHidden(false);
      }
      
      lastScrollY.current = currentScrollY;
    }
    
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, []);

  return isHeaderHidden;
}

// ===== HOOK: Reveal Animations =====
export function useRevealAnimations(products) {
  const revealObserver = useRef(null);

  useEffect(() => {
    if (products.length === 0) return;

    // Pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      const revealTargets = document.querySelectorAll(
        '.product-section, .hero-image, .product-title-overlay, .description-text, .accent-number, .gallery-item'
      );

      revealObserver.current = new IntersectionObserver(
        function(entries, observer) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-in');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -10% 0px',
          threshold: 0.2
        }
      );

      revealTargets.forEach(function(el) {
        revealObserver.current.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (revealObserver.current) {
        revealObserver.current.disconnect();
      }
    };
  }, [products]);
}

// ===== HOOK: Click Outside Menu =====
export function useClickOutsideMenu(setIsMenuActive) {
  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest('.main-header')) {
        setIsMenuActive(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [setIsMenuActive]);
}

// ===== HOOK: Modal Escape Key =====
export function useModalEscapeKey(modalOpen, closeModal) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && modalOpen) {
        closeModal();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen, closeModal]);
}

// ===== HOOK: Modal Body Overflow =====
export function useModalBodyOverflow(modalDisplay) {
  useEffect(() => {
    if (modalDisplay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [modalDisplay]);
}

// ===== HOOK: Gallery Item Clicks =====
export function useGalleryClicks(products, openModal) {
  useEffect(() => {
    if (products.length === 0) return;

    const timer = setTimeout(() => {
      const galleryItems = document.querySelectorAll('.gallery-item');

      galleryItems.forEach(function(item) {
        item.style.cursor = 'pointer';
        const handleClick = function() {
          const img = this.querySelector('img');
          if (img) {
            openModal(img.src);
          }
        };
        item.addEventListener('click', handleClick);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [products, openModal]);
}
