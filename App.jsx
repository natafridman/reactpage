import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './index.css';

import Header from '/components/Header.jsx';
import ProductSection from '/components/ProductSection.jsx';
import ProductCard from '/components/ProductCard.jsx';
import LoadingSkeleton from '/components/LoadingSkeleton.jsx';
import EmptyState from '/components/EmptyState.jsx';
import ImageModal from '/components/ImageModal.jsx';
import Footer from '/components/Footer.jsx';
import CategoryBanner from '/components/CategoryBanner.jsx';
import SearchFilterBar from '/components/SearchFilterBar.jsx';
import RelatedProducts from '/components/RelatedProducts.jsx';
import { loadManifest, loadCatalogIndex, getCategoryFromURL, normalizeText } from '/utils/productUtils.js';
import { useCart } from '/context/CartContext.jsx';

// ===== CONFIGURATION =====
const IMAGES_BASE_FOLDER = 'images/Categorias';
const PRODUCTS_PER_PAGE_LIST = 4;
// En cuadricula la pagina llega hasta 45 productos, pero no se montan los 45 de
// golpe: entran de a tandas a medida que se baja. Asi se recorre mucho catalogo
// sin paginar todo el tiempo y sin pagar el costo de 45 tarjetas al abrir. El
// corte en 45 es a proposito: pasado ese punto conviene cambiar de pagina antes
// de que el navegador cargue con demasiados nodos e imagenes a la vez.
const PRODUCTS_PER_PAGE_GRID = 45;
const GRID_BATCH = 15;
// Vista por defecto del catalogo. La usan el estado inicial, el sync con la URL y la
// limpieza de la query, asi que vive en un solo lugar para que no se desincronicen.
const DEFAULT_VIEW_MODE = 'grid';

// Belt sub-category axes. OR within an axis, AND across axes.
const GENDER_TAGS = ['hombre', 'mujer'];
const ORIGIN_TAGS = ['importado', 'nacional'];

function App() {
  const { categoria: paramCategoria, nombre: paramNombre } = useParams();
  const isSingleProduct = !!(paramCategoria && paramNombre);
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);          // single-product mode
  const [allProducts, setAllProducts] = useState([]);    // full scope (for search/filter)
  const [categories, setCategories] = useState([]);
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const { addTick } = useCart();
  const [modalDisplay, setModalDisplay] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [modalAllImages, setModalAllImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('pagina')) || 1;
  });
  const [viewMode, setViewMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('vista') || localStorage.getItem('b2you-viewMode') || DEFAULT_VIEW_MODE;
  });

  // Search + filter state
  const [searchInput, setSearchInput] = useState('');   // controlled input (instant)
  const [searchQuery, setSearchQuery] = useState('');   // debounced value used for filtering
  const [selectedTags, setSelectedTags] = useState([]);
  // Cuantos productos de la pagina actual estan montados (ver GRID_BATCH).
  const [visibleCount, setVisibleCount] = useState(GRID_BATCH);
  const loadMoreRef = useRef(null);

  const PRODUCTS_PER_PAGE = viewMode === 'grid' ? PRODUCTS_PER_PAGE_GRID : PRODUCTS_PER_PAGE_LIST;

  const lastScrollY = useRef(window.scrollY);
  const scrollTimer = useRef(null);
  const revealObserver = useRef(null);
  const productsCache = useRef({});

  // ===== PARSE METADATA FILE =====
  function parseMetadata(text) {
    const metadata = {};
    const lines = text.trim().split('\n');

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        const normalizedKey = key.trim().toLowerCase();
        const rawValue = valueParts.join(':').trim();

        if (normalizedKey === 'images' || normalizedKey === 'videos' || normalizedKey === 'tags') {
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

  // ===== LOAD ALL PRODUCTS FOR THE CURRENT SCOPE (category or all) =====
  async function loadAllForScope() {
    const selectedCategory = getCategoryFromURL();
    const cacheKey = selectedCategory || 'all';

    if (productsCache.current[cacheKey]) {
      setAllProducts(productsCache.current[cacheKey]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      let clean;
      try {
        // Camino normal: un solo JSON precalculado en el build.
        const index = await loadCatalogIndex();
        const categoriesToLoad = selectedCategory ? [selectedCategory] : Object.keys(index);
        clean = [];
        for (const category of categoriesToLoad) {
          if (!index[category]) {
            console.warn(`⚠️ Categoría "${category}" no encontrada en el índice`);
            continue;
          }
          for (const entry of index[category]) {
            clean.push({ ...entry, category, index: clean.length });
          }
        }
      } catch (indexError) {
        // Si el indice no esta (deploy viejo, archivo no generado), se cae al
        // camino anterior en vez de dejar el catalogo vacio. Es lento, pero
        // funciona: nadie que llegue desde un anuncio ve una pagina rota.
        console.warn('Índice de catálogo no disponible, usando metadata por producto:', indexError);
        clean = await loadScopeFromMetadataFiles(selectedCategory);
      }

      productsCache.current[cacheKey] = clean;
      setAllProducts(clean);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      setIsLoading(false);
    }
  }

  // Camino de respaldo: un fetch por producto. Era el mecanismo original y se
  // conserva solo por si falta catalogo-index.json.
  async function loadScopeFromMetadataFiles(selectedCategory) {
    const manifest = await loadManifest();
    const categoriesToLoad = selectedCategory ? [selectedCategory] : Object.keys(manifest);

    const refs = [];
    for (const category of categoriesToLoad) {
      if (!manifest[category]) continue;
      manifest[category].forEach(productFolder => refs.push({ category, productFolder }));
    }

    const loaded = await Promise.all(refs.map(async ({ category, productFolder }, i) => {
      const metadataPath = `/${IMAGES_BASE_FOLDER}/${category}/${productFolder}/metadata.txt`;
      try {
        const res = await fetch(metadataPath);
        if (!res.ok) return null;
        const metadata = parseMetadata(await res.text());
        return { metadata, category, productFolder, index: i, availableImages: metadata.images || [] };
      } catch (error) {
        console.error(`Error cargando producto ${productFolder}:`, error);
        return null;
      }
    }));

    return loaded.filter(Boolean);
  }

  // ===== LOAD SINGLE PRODUCT =====
  async function loadSingleProduct() {
    setIsLoading(true);
    try {
      const metadataPath = `/${IMAGES_BASE_FOLDER}/${decodeURIComponent(paramCategoria)}/${decodeURIComponent(paramNombre)}/metadata.txt`;
      const metadataResponse = await fetch(metadataPath);
      if (!metadataResponse.ok) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      const metadataText = await metadataResponse.text();
      const metadata = parseMetadata(metadataText);
      const product = {
        metadata,
        category: decodeURIComponent(paramCategoria),
        productFolder: decodeURIComponent(paramNombre),
        index: 0,
        availableImages: metadata.images || []
      };
      setProducts([product]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error cargando producto:', error);
      setProducts([]);
      setIsLoading(false);
    }
  }

  // ===== INITIALIZE ON MOUNT / SCOPE CHANGE =====
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (isSingleProduct) {
      document.title = `B2YOU - ${decodeURIComponent(paramNombre)}`;
    } else {
      const cat = getCategoryFromURL();
      document.title = cat ? `B2YOU - ${cat}` : 'B2YOU - Productos';
    }

    async function initialize() {
      try {
        const manifest = await loadManifest();
        setCategories(Object.keys(manifest));
      } catch (error) {
        console.error('Error cargando manifest:', error);
      }
    }
    initialize();

    if (isSingleProduct) {
      loadSingleProduct();
    } else {
      const params = new URLSearchParams(location.search);
      const urlPage = parseInt(params.get('pagina')) || 1;
      const urlView = params.get('vista') || localStorage.getItem('b2you-viewMode') || DEFAULT_VIEW_MODE;
      // Reset search/filters when the scope changes.
      setSearchInput('');
      setSearchQuery('');
      setSelectedTags([]);
      setCurrentPage(urlPage);
      setViewMode(urlView);
      updateURLParams({ vista: urlView, pagina: urlPage });
      loadAllForScope();
    }
  }, [paramCategoria, paramNombre, location.search]);

  // ===== DEBOUNCE SEARCH INPUT =====
  useEffect(() => {
    const id = setTimeout(() => setSearchQuery(searchInput), 160);
    return () => clearTimeout(id);
  }, [searchInput]);

  // ===== RESET TO PAGE 1 WHEN FILTERS/SEARCH CHANGE =====
  useEffect(() => {
    setCurrentPage(1);
    updateURLParams({ pagina: 1 });
  }, [searchQuery, selectedTags]);

  // ===== POPSTATE =====
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(1);
      loadAllForScope();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ===== DERIVED: filtered + paginated products =====
  const selectedCategory = getCategoryFromURL();
  const isBelts = selectedCategory === 'Cinturones';

  const genderSel = selectedTags.filter(t => GENDER_TAGS.includes(t));
  const originSel = selectedTags.filter(t => ORIGIN_TAGS.includes(t));
  // Accent-insensitive, multi-word search: every word the visitor types must
  // match somewhere in the product ("cinturon tachas" finds "Cinturón Tachas Fino").
  const qWords = normalizeText(searchQuery).split(/\s+/).filter(Boolean);

  const filteredProducts = isSingleProduct ? products : allProducts.filter(p => {
    if (qWords.length) {
      const m = p.metadata;
      const hay = normalizeText([m.title, m.subtitle, m.description, m.code, p.category, p.productFolder]
        .filter(Boolean).join(' '));
      if (!qWords.every(w => hay.includes(w))) return false;
    }
    if (selectedTags.length) {
      const t = (Array.isArray(p.metadata.tags) ? p.metadata.tags : []).map(x => x.toLowerCase());
      if (genderSel.length && !genderSel.some(x => t.includes(x))) return false;
      if (originSel.length && !originSel.some(x => t.includes(x))) return false;
    }
    return true;
  });

  // Reindex so list-view layout alternation stays consistent within the filtered set.
  const reindexed = filteredProducts.map((p, i) => ({ ...p, index: i }));
  const totalFiltered = reindexed.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PRODUCTS_PER_PAGE;
  const pageProducts = isSingleProduct ? products : reindexed.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  // Signature of what is currently displayed (drives reveal re-observation).
  const displayKey = `${selectedCategory || 'all'}|${qWords.join(' ')}|${selectedTags.join(',')}|${safePage}|${viewMode}`;

  // ===== TANDAS DENTRO DE LA PAGINA (solo cuadricula) =====
  const batching = viewMode === 'grid' && !isSingleProduct;
  const shownProducts = batching ? pageProducts.slice(0, visibleCount) : pageProducts;
  const hasMoreInPage = batching && visibleCount < pageProducts.length;

  // Volver a la primera tanda cuando cambia lo que se esta mostrando: otra
  // pagina, otra categoria, otro filtro o otra busqueda.
  useEffect(() => {
    setVisibleCount(GRID_BATCH);
  }, [displayKey]);

  useEffect(() => {
    if (!hasMoreInPage) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((n) => Math.min(n + GRID_BATCH, pageProducts.length));
        }
      },
      // Con margen: la tanda siguiente ya esta puesta cuando se llega al final.
      { rootMargin: '600px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMoreInPage, pageProducts.length]);

  // ===== SCROLL REVEAL ANIMATIONS =====
  useEffect(() => {
    if (pageProducts.length === 0) return;

    const timer = setTimeout(() => {
      const revealTargets = document.querySelectorAll(
        '.product-section, .hero-image, .product-title-overlay, .description-text, .accent-number, .gallery-item'
      );

      revealObserver.current = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-in');
              observer.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.2 }
      );

      revealTargets.forEach(function (el) {
        revealObserver.current.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (revealObserver.current) {
        revealObserver.current.disconnect();
      }
    };
  }, [displayKey, isLoading]);

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
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, []);

  // Reveal the header whenever a product is added so the cart (and the
  // fly-to-cart animation landing on it) stay in view. Skips the initial mount.
  useEffect(() => {
    if (addTick > 0) setIsHeaderHidden(false);
  }, [addTick]);

  // ===== CLICK OUTSIDE TO CLOSE MENU =====
  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest('.main-header')) {
        setIsMenuActive(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ===== ESCAPE KEY FOR MODAL =====
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && modalOpen) {
        closeModal();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
    if (pageProducts.length === 0) return;

    const timer = setTimeout(() => {
      const productSections = document.querySelectorAll('.product-section');

      productSections.forEach(function (section) {
        const allImgs = [];
        // Use the full-resolution original (data-full) for the modal, not the
        // medium display variant the <img> actually renders.
        const fullOf = (el) => el.dataset.full || el.src;
        const heroImg = section.querySelector('.hero-image-wrapper img');
        if (heroImg) allImgs.push(fullOf(heroImg));
        const galleryImgs = section.querySelectorAll('.gallery-item img');
        galleryImgs.forEach(img => allImgs.push(fullOf(img)));

        if (heroImg) {
          heroImg.style.cursor = 'pointer';
          heroImg.onclick = () => openModal(fullOf(heroImg), allImgs);
        }

        const galleryItems = section.querySelectorAll('.gallery-item');
        galleryItems.forEach(function (item) {
          item.style.cursor = 'pointer';
          const handleClick = function () {
            const img = this.querySelector('img');
            if (img) openModal(fullOf(img), allImgs);
          };
          item.addEventListener('click', handleClick);
        });
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [displayKey, isLoading]);

  // ===== MODAL FUNCTIONS =====
  function closeModal() {
    setModalOpen(false);
    setTimeout(function () {
      setModalDisplay(false);
      setModalImageSrc('');
    }, 300);
  }

  function openModal(imgSrc, allImgs = []) {
    setModalImageSrc(imgSrc);
    setModalAllImages(allImgs);
    setModalDisplay(true);
    setTimeout(() => setModalOpen(true), 10);
  }

  // ===== LOGO CLICK =====
  function handleLogoClick() {
    window.location.href = window.location.origin;
  }

  // ===== CONTACT FORM SUBMIT =====
  function handleContactSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    const subject = encodeURIComponent(`Mensaje de ${name}`);
    const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`);
    const whatsappNumber = '5491178279281';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${subject}%0A%0A${body}`;
    window.open(whatsappURL, '_blank');
    e.target.reset();
  }

  // ===== URL PARAMS SYNC =====
  function updateURLParams(params) {
    const url = new URL(window.location);
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined || value === '' || (key === 'pagina' && value === 1) || (key === 'vista' && value === DEFAULT_VIEW_MODE)) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    }
    window.history.replaceState({}, '', url);
  }

  // ===== PAGINATION FUNCTIONS =====
  function getTotalPages() {
    return totalPages;
  }

  function handlePageChange(newPage) {
    if (newPage === currentPage) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    setCurrentPage(newPage);
    updateURLParams({ pagina: newPage });
  }

  function handlePrevPage() {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  }

  function handleNextPage() {
    if (currentPage < getTotalPages()) handlePageChange(currentPage + 1);
  }

  // ===== VIEW MODE TOGGLE =====
  function handleViewModeChange(mode) {
    if (mode === viewMode) return;
    localStorage.setItem('b2you-viewMode', mode);
    setViewMode(mode);
    setCurrentPage(1);
    updateURLParams({ vista: mode, pagina: 1 });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // ===== CATEGORY CLICK HANDLER =====
  function handleCategoryClick(e, cat) {
    e.preventDefault();
    setIsMenuActive(false);
    navigate(`/productos?categoria=${encodeURIComponent(cat)}`);
  }

  // ===== SEARCH / FILTER HANDLERS =====
  function handleToggleTag(key) {
    setSelectedTags(prev => prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]);
  }
  function handleClearFilters() {
    setSelectedTags([]);
  }

  const showToolbar = !isSingleProduct && !isLoading;

  // En cuadricula la barra pasa a ser una columna a la izquierda, al estilo de
  // una tienda online. En vista de lista se queda arriba, porque cada producto
  // ya ocupa el ancho completo y una columna al costado lo dejaria sin lugar.
  // Que esto pase solo en escritorio lo decide el CSS: en telefono el
  // contenedor es `display: contents` y todo cae en el orden de siempre.
  const useSidebar = showToolbar && viewMode === 'grid';

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

      <div className="header-spacer" aria-hidden="true" />

      {!isSingleProduct && (
        <CategoryBanner
          category={getCategoryFromURL() || null}
        />
      )}

      <div className={`catalog-layout${useSidebar ? ' has-sidebar' : ''}`}>
      {showToolbar && (
        <SearchFilterBar
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          showFilters={isBelts}
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
          onClearFilters={handleClearFilters}
          resultCount={totalFiltered}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          headerHidden={isHeaderHidden}
          category={selectedCategory || null}
        />
      )}

      <main id="productsContainer" style={{ position: 'relative' }}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : totalFiltered === 0 ? (
          <EmptyState
            searching={qWords.length > 0 || selectedTags.length > 0}
            onReset={() => { setSearchInput(''); setSearchQuery(''); setSelectedTags([]); }}
          />
        ) : (
          <>
            {viewMode === 'grid' && !isSingleProduct ? (
              /* Grilla real, no productos repartidos en columnas sueltas. Antes
                 se armaban N columnas independientes y cada una crecia por su
                 cuenta: con 15 productos en 2 columnas quedaban 8 de un lado y
                 7 del otro, y una terminaba mas abajo que la otra. Con grid las
                 filas se alinean solas y la ultima simplemente tiene menos
                 tarjetas. Ademas la cantidad de columnas la decide el CSS, asi
                 que ahora acompaña el cambio de tamaño de la ventana. */
              <>
                <div className="products-grid">
                  {shownProducts.map((product, i) => (
                    <ProductCard
                      key={product.productFolder}
                      product={product}
                      staggerIndex={i % 4}
                    />
                  ))}
                </div>
                {hasMoreInPage && (
                  <div className="grid-load-more" ref={loadMoreRef} aria-hidden="true">
                    <span className="grid-load-more-dot" />
                    <span className="grid-load-more-dot" />
                    <span className="grid-load-more-dot" />
                  </div>
                )}
              </>
            ) : (
              pageProducts.map(product => (
                <ProductSection
                  key={product.productFolder}
                  product={product}
                  basePath={IMAGES_BASE_FOLDER}
                  onImageClick={openModal}
                  showBackLink={isSingleProduct}
                />
              ))
            )}

            {/* Pagination Controls */}
            {getTotalPages() > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn pagination-prev"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  Anterior
                </button>

                <div className="pagination-numbers">
                  {(() => {
                    const total = getTotalPages();
                    const pages = [];
                    const addPage = (n) => {
                      if (!pages.includes(n) && n >= 1 && n <= total) pages.push(n);
                    };

                    for (let i = 1; i <= Math.min(3, total); i++) addPage(i);
                    addPage(currentPage - 1);
                    addPage(currentPage);
                    addPage(currentPage + 1);
                    addPage(total - 1);
                    addPage(total);

                    pages.sort((a, b) => a - b);

                    const elements = [];
                    for (let i = 0; i < pages.length; i++) {
                      if (i > 0 && pages[i] - pages[i - 1] > 1) {
                        elements.push(<span key={`dots-${i}`} className="pagination-dots">...</span>);
                      }
                      elements.push(
                        <button
                          key={pages[i]}
                          className={`pagination-number ${currentPage === pages[i] ? 'active' : ''}`}
                          onClick={() => handlePageChange(pages[i])}
                        >
                          {pages[i]}
                        </button>
                      );
                    }
                    return elements;
                  })()}
                </div>

                <button
                  className="pagination-btn pagination-next"
                  onClick={handleNextPage}
                  disabled={currentPage === getTotalPages()}
                >
                  Siguiente
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            )}

            {isSingleProduct && products[0] && (
              <RelatedProducts
                category={products[0].category}
                folder={products[0].productFolder}
              />
            )}
          </>
        )}
      </main>
      </div>

      <Footer onContactSubmit={handleContactSubmit} />

      <ImageModal
        modalDisplay={modalDisplay}
        modalOpen={modalOpen}
        imageSrc={modalImageSrc}
        allImages={modalAllImages}
        onClose={closeModal}
        onImageChange={setModalImageSrc}
      />
    </>
  );
}

export default App;
