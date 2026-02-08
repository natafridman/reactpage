import { useState, useEffect, useRef } from 'react';
import './index.css';

// ===== CONFIGURATION =====
const IMAGES_BASE_FOLDER = 'images/Categorias';

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
  const PRODUCTS_PER_PAGE = 4;

  const lastScrollY = useRef(window.scrollY);
  const scrollTimer = useRef(null);
  const revealObserver = useRef(null);
  const manifestCache = useRef(null);
  const productsCache = useRef({}); // Cache: { "categoryName-page": [...products] }

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
    
    // Check cache first
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
      
      // Determinar qué categorías cargar
      const categoriesToLoad = selectedCategory 
        ? [selectedCategory] 
        : Object.keys(manifest);
      
      console.log('📂 Categorías a cargar:', categoriesToLoad);
      
      // Calcular total de productos
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
      
      // Calcular qué productos cargar para esta página
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
            index: startIndex + i, // Index global para mantener odd/even correcto
          });
          
        } catch (error) {
          console.error(`Error cargando producto ${productFolder}:`, error);
        }
      }
      
      // Store in cache
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

  // ===== INITIALIZE MENU =====
  async function initializeMenu() {
    try {
      const manifest = await loadManifest();
      const cats = Object.keys(manifest);
      setCategories(cats);
    } catch (error) {
      console.error('Error cargando manifest:', error);
    }
  }

  // ===== INITIALIZE ON MOUNT =====
  useEffect(() => {
    initializeMenu();
    loadProducts();
    setCurrentPage(1); // Reset to page 1 when loading
  }, []);

  // ===== RESET PAGE WHEN CATEGORY CHANGES =====
  useEffect(() => {
    const handlePopState = () => {
      productsCache.current = {}; // Limpiar cache
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
  }, [products, currentPage]); // Re-apply when products or page changes

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
  }, [products, currentPage]); // Re-apply when products or page changes

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

  // ===== HAMBURGER TOGGLE =====
  function handleHamburgerClick(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuActive(!isMenuActive);
  }

  // ===== LOGO CLICK =====
  function handleLogoClick() {
    productsCache.current = {}; // Limpiar cache
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
  function getPaginatedProducts() {
    // Products ya viene paginado desde loadProducts
    return products;
  }

  function getTotalPages() {
    return Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  }

  function handlePageChange(newPage) {
    if (newPage === currentPage) return;
    
    setCurrentPage(newPage);
    loadProducts(newPage); // Cargar productos de la nueva página
    
    // Scroll to top smoothly
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

  // ===== CREATE PRODUCT SECTION =====
  function createProductSection(productData) {
    const { metadata, category, productFolder, index, availableImages } = productData;
    
    const videoList = Array.isArray(metadata.videos) ? metadata.videos : (metadata.video ? [metadata.video] : []);
    const imageList = Array.isArray(metadata.images) ? metadata.images : availableImages;
    const hasVideo = videoList.length > 0;
    const heroImage = imageList.length > 0 ? imageList[0] : 'hero.jpg';
    
    const productPath = `${IMAGES_BASE_FOLDER}/${category}/${productFolder}`;
    
    const gallerySource = hasVideo ? imageList : (imageList.length > 1 ? imageList.slice(1) : imageList);

    const isOdd = (index + 1) % 2 !== 0;
    const flexDirection = isOdd ? 'row-reverse' : 'row';
    const titlePosition = isOdd ? { left: '3%', right: 'auto' } : { right: '3%', left: 'auto' };
    const titleTransform = isOdd ? 'translateX(-50px)' : 'translateX(50px)';
    const textAlign = isOdd ? 'right' : 'left';
    const numberPosition = isOdd ? { left: 'auto', right: '2rem' } : { left: '2rem', right: 'auto' };
    const contentMargin = isOdd ? { marginLeft: 'auto', marginRight: 0 } : { marginLeft: 0, marginRight: 'auto' };

    return (
      <section 
        key={productFolder}
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
              className="product-title-overlay" 
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
          <div className="accent-number" style={numberPosition}>
            {metadata.code || String(index + 1).padStart(2, '0')}
          </div>

          <div className="description-text" style={contentMargin}>
            <p>{metadata.description || 'Descripción del producto.'}</p>
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

  return (
    <>
      {/* Header */}
      <header className={`main-header ${isHeaderHidden ? 'header-hidden' : ''}`}>
        <div className="header-container">
          <button 
            className={`hamburger-btn ${isMenuActive ? 'active' : ''}`}
            id="hamburgerBtn"
            aria-label="Menú de categorías"
            onClick={handleHamburgerClick}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div className="logo" onClick={handleLogoClick}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="12" width="24" height="16" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 12V10C12 8.89543 12.8954 8 14 8H26C27.1046 8 28 8.89543 28 10V12" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="20" cy="20" r="2" fill="currentColor"/>
            </svg>
            <span className="logo-text">YAGO & NATA CO</span>
          </div>
        </div>
        
        <nav className={`categories-menu ${isMenuActive ? 'active' : ''}`} id="categoriesMenu">
          <div className="categories-container" id="categoriesContainer">
            {categories.map(cat => (
              <a 
                key={cat}
                href={`?categoria=${encodeURIComponent(cat)}`} 
                className="category-link"
                onClick={(e) => {
                  e.preventDefault();
                  productsCache.current = {}; // Limpiar cache
                  setCurrentPage(1);
                  setTotalProducts(0);
                  window.history.pushState({}, '', `?categoria=${encodeURIComponent(cat)}`);
                  loadProducts(1);
                  setIsMenuActive(false);
                }}
              >
                {cat.toUpperCase()}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <br />
      <br />

      {/* Products Container */}
      <main id="productsContainer" style={{ position: 'relative' }}>
        {isLoadingPage && (
          <div className="page-loading-overlay">
            <div className="page-loading-spinner"></div>
          </div>
        )}
        
        {isLoading ? (
          <div className="loading-overlay" id="loadingOverlay">
            <div className="loading-product-skeleton">
              <div className="loading-gallery-side">
                <div className="loading-number"></div>
                <div className="loading-text"></div>
                <div className="loading-gallery">
                  <div className="loading-gallery-item"></div>
                  <div className="loading-gallery-item"></div>
                  <div className="loading-gallery-item"></div>
                  <div className="loading-gallery-item"></div>
                  <div className="loading-gallery-item"></div>
                  <div className="loading-gallery-item"></div>
                </div>
              </div>
              <div className="loading-hero-side"></div>
            </div>
          </div>
        ) : totalProducts === 0 ? (
          <div className="loading-overlay">
            <div className="loading-product-skeleton">
              <div className="loading-hero-side"></div>
              <div className="loading-gallery-side">
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                  No se encontraron productos para esta categoría.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {getPaginatedProducts().map(product => createProductSection(product))}
            
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

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-content">
            {/* Información de la empresa */}
            <div className="footer-section">
              <h3 className="footer-title">YAGO & NATA CO</h3>
              <p className="footer-text">Artesanía excepcional en cuero premium. Cada pieza es diseñada y confeccionada con dedicación para acompañarte en tu día a día.</p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="Instagram">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="Facebook">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="https://wa.me/5491153445155?text=Hola!%20Estoy%20interesado%20en%20uno%20de%20los%20productos%20de%20su%20marca" className="social-link" aria-label="WhatsApp" target="_blank" rel="noreferrer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="footer-section">
              <h4 className="footer-subtitle">Contacto</h4>
              <ul className="footer-links">
                <li><a href="mailto:info@yagonata.com">info@yagonata.com</a></li>
                <li><a href="tel:+5491153445155">+54 9 11 5344-5155</a></li>
                <li>Buenos Aires, Argentina</li>
              </ul>
            </div>

            {/* Formulario de contacto */}
            <div className="footer-section footer-form-section">
              <h4 className="footer-subtitle">Envianos un mensaje</h4>
              <form className="contact-form" id="contactForm" onSubmit={handleContactSubmit}>
                <input type="text" name="nombre" id="contactName" placeholder="Nombre" className="form-input" required />
                <input type="email" name="email" id="contactEmail" placeholder="Email" className="form-input" required />
                <textarea name="mensaje" id="contactMessage" placeholder="Mensaje" className="form-textarea" rows="4" required></textarea>
                <button type="submit" className="form-button">Enviar</button>
              </form>
            </div>
          </div>

          {/* Copyright */}
          <div className="footer-bottom">
            <p>&copy; 2026 Yago & Nata Co. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modal para imágenes */}
      <div 
        id="imageModal" 
        className={`modal ${modalOpen ? 'show' : ''}`}
        style={{ display: modalDisplay ? 'flex' : 'none' }}
        onClick={(e) => {
          if (e.target.id === 'imageModal') {
            closeModal();
          }
        }}
      >
        <span 
          className="modal-close" 
          id="modalClose"
          onClick={(e) => {
            e.stopPropagation();
            closeModal();
          }}
        >
          &times;
        </span>
        <div className="modal-content">
          <img id="modalImage" src={modalImageSrc} alt="Imagen ampliada" />
        </div>
      </div>
    </>
  );
}

export default App;
