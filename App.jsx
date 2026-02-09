import { useState, useEffect, useRef } from 'react';
import './index.css';

import Header from '/components/Header.jsx';
import ProductSection from '/components/ProductSection.jsx';
import LoadingSkeleton from '/components/LoadingSkeleton.jsx';
import EmptyState from '/components/EmptyState.jsx';
import ImageModal from '/components/ImageModal.jsx';
import Footer from '/components/Footer.jsx';

// ===== CONFIGURATION =====
const IMAGES_BASE_FOLDER = 'images/Categorias';
const PRODUCTS_PER_PAGE = 4;

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [modalDisplay, setModalDisplay] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  const lastScrollY = useRef(window.scrollY);
  const scrollTimer = useRef(null);
  const revealObserver = useRef(null);
  const manifestCache = useRef(null);
  const productsCache = useRef({});

  // ===== LOAD MANIFEST =====
  async function loadManifest() {
    if (manifestCache.current) return manifestCache.current;
    const response = await fetch('/manifest.json');
    manifestCache.current = await response.json();
    return manifestCache.current;
  }

  // ===== GET CATEGORY FROM URL =====
  function getCategoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('categoria');
  }

  // ===== PARSE METADATA FILE =====
  function parseMetadata(text) {
    const metadata = {};
    const lines = text.trim().split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        const normalizedKey = key.trim().toLowerCase();
        const rawValue = valueParts.join(':').trim();
        
        if (normalizedKey === 'images' || normalizedKey === 'videos') {
          metadata[normalizedKey] = rawValue
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
        } else {
          metadata[normalizedKey] = rawValue;
        } 
      }
    });
    
    return metadata;
  }

  // ===== LOAD ALL PRODUCTS =====
  async function loadProducts(page = 1) {
    console.log(`📦 Cargando productos (página ${page})...`);
    
    const selectedCategory = getCategoryFromURL();
    const cacheKey = `${selectedCategory || 'all'}-${page}`;
    
    if (productsCache.current[cacheKey]) {
      console.log('✅ Usando productos en cache');
      setProducts(productsCache.current[cacheKey]);
      setIsLoading(false);
      setIsLoadingPage(false);
      return;
    }
    
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingPage(true);
    }

    try {
      const manifest = await loadManifest();
      
      console.log('🔍 Categoría seleccionada:', selectedCategory || 'TODAS');
      
      const categoriesToLoad = selectedCategory 
        ? [selectedCategory] 
        : Object.keys(manifest);
      
      console.log('📂 Categorías a cargar:', categoriesToLoad);
      
      let allProductsList = [];
      for (const category of categoriesToLoad) {
        if (!manifest[category]) {
          console.warn(`⚠️ Categoría "${category}" no encontrada en manifest`);
          continue;
        }
        
        const productsInCategory = manifest[category];
        productsInCategory.forEach(productFolder => {
          allProductsList.push({ category, productFolder });
        });
      }
      
      setTotalProducts(allProductsList.length);
      console.log(`📊 Total de productos: ${allProductsList.length}`);
      
      const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
      const endIndex = startIndex + PRODUCTS_PER_PAGE;
      const productsToLoad = allProductsList.slice(startIndex, endIndex);
      
      console.log(`📄 Cargando productos ${startIndex + 1} a ${Math.min(endIndex, allProductsList.length)}`);
      
      const loadedProducts = [];
      
      for (let i = 0; i < productsToLoad.length; i++) {
        const { category, productFolder } = productsToLoad[i];
        const metadataPath = `${IMAGES_BASE_FOLDER}/${category}/${productFolder}/metadata.txt`;
        
        try {
          const metadataResponse = await fetch(metadataPath);
          if (!metadataResponse.ok) {
            console.warn(`Metadata no encontrado: ${metadataPath}`);
            continue;
          }
          
          const metadataText = await metadataResponse.text();
          const metadata = parseMetadata(metadataText);
          
          loadedProducts.push({
            metadata,
            category,
            productFolder,
            index: startIndex + i,
            availableImages: metadata.images || []
          });
          
        } catch (error) {
          console.error(`Error cargando producto ${productFolder}:`, error);
        }
      }
      
      productsCache.current[cacheKey] = loadedProducts;
      
      setProducts(loadedProducts);
      setIsLoading(false);
      setIsLoadingPage(false);
      console.log(`✅ ${loadedProducts.length} productos cargados para página ${page}`);
      
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      setIsLoading(false);
      setIsLoadingPage(false);
    }
  }

  // ===== INITIALIZE ON MOUNT =====
  useEffect(() => {
    async function initialize() {
      try {
        const manifest = await loadManifest();
        setCategories(Object.keys(manifest));
      } catch (error) {
        console.error('Error cargando manifest:', error);
      }
    }
    initialize();
    loadProducts();
    setCurrentPage(1);
  }, []);

  // ===== RESET PAGE WHEN CATEGORY CHANGES =====
  useEffect(() => {
    const handlePopState = () => {
      productsCache.current = {};
      setCurrentPage(1);
      setTotalProducts(0);
      loadProducts(1);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // ===== SCROLL REVEAL ANIMATIONS =====
  useEffect(() => {
    if (products.length === 0) return;

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
  }, [products, currentPage]);

  // ===== HEADER SCROLL FUNCTIONALITY =====
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

  // ===== CLICK OUTSIDE TO CLOSE MENU =====
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
  }, []);

  // ===== ESCAPE KEY FOR MODAL =====
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
  }, [modalOpen]);

  // ===== MODAL BODY OVERFLOW =====
  useEffect(() => {
    if (modalDisplay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [modalDisplay]);

  // ===== GALLERY ITEM CLICKS =====
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
  }, [products, currentPage]);

  // ===== MODAL FUNCTIONS =====
  function closeModal() {
    setModalOpen(false);
    setTimeout(function() {
      setModalDisplay(false);
      setModalImageSrc('');
    }, 300);
  }

  function openModal(imgSrc) {
    setModalImageSrc(imgSrc);
    setModalDisplay(true);
    setTimeout(() => {
      setModalOpen(true);
    }, 10);
  }

  // ===== LOGO CLICK =====
  function handleLogoClick() {
    productsCache.current = {};
    setCurrentPage(1);
    setTotalProducts(0);
    window.history.pushState({}, '', window.location.pathname);
    loadProducts(1);
    setIsMenuActive(false);
  }

  // ===== CONTACT FORM SUBMIT =====
  function handleContactSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    const subject = encodeURIComponent(`Mensaje de ${name}`);
    const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`);
    
    const whatsappNumber = '5491153445155';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${subject}%0A%0A${body}`;
    
    window.open(whatsappURL, '_blank');
    
    e.target.reset();
  }

  // ===== PAGINATION FUNCTIONS =====
  function getTotalPages() {
    return Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  }

  function handlePageChange(newPage) {
    if (newPage === currentPage) return;
    
    setCurrentPage(newPage);
    loadProducts(newPage);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handlePrevPage() {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  }

  function handleNextPage() {
    if (currentPage < getTotalPages()) {
      handlePageChange(currentPage + 1);
    }
  }

  // ===== CATEGORY CLICK HANDLER =====
  function handleCategoryClick(e, cat) {
    e.preventDefault();
    productsCache.current = {};
    setCurrentPage(1);
    setTotalProducts(0);
    window.history.pushState({}, '', `?categoria=${encodeURIComponent(cat)}`);
    loadProducts(1);
    setIsMenuActive(false);
  }

  return (
    <>
      <Header
        categories={categories}
        isMenuActive={isMenuActive}
        isHeaderHidden={isHeaderHidden}
        setIsMenuActive={setIsMenuActive}
        onLogoClick={handleLogoClick}
        onCategoryClick={handleCategoryClick}
      />

      <br />
      <br />

      <main id="productsContainer" style={{ position: 'relative' }}>
        {isLoadingPage && (
          <div className="page-loading-overlay">
            <div className="page-loading-spinner"></div>
          </div>
        )}
        
        {isLoading ? (
          <LoadingSkeleton />
        ) : totalProducts === 0 ? (
          <EmptyState />
        ) : (
          <>
            {products.map(product => (
              <ProductSection 
                key={product.productFolder}
                product={product}
                basePath={IMAGES_BASE_FOLDER}
                onImageClick={openModal}
              />
            ))}
            
            {/* Pagination Controls */}
            {getTotalPages() > 1 && (
              <div className="pagination-container">
                <button 
                  className="pagination-btn pagination-prev"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || isLoadingPage}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  Anterior
                </button>
                
                <div className="pagination-numbers">
                  {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoadingPage}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button 
                  className="pagination-btn pagination-next"
                  onClick={handleNextPage}
                  disabled={currentPage === getTotalPages() || isLoadingPage}
                >
                  Siguiente
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer onContactSubmit={handleContactSubmit} />

      <ImageModal
        modalDisplay={modalDisplay}
        modalOpen={modalOpen}
        imageSrc={modalImageSrc}
        onClose={closeModal}
      />
    </>
  );
}

export default App;