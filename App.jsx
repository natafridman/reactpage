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
import ClaveNacional from '/components/ClaveNacional.jsx';
import { loadManifest, loadCatalogIndex, getCategoryFromURL, normalizeText } from '/utils/productUtils.js';
import { esProtegido, estaDesbloqueado } from '/utils/claveNacional.js';
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
// Foto del estado del catalogo (categoria, filtros, busqueda, pagina, vista y
// scroll) para poder volver a el tal cual al salir de un producto.
const CAT_SNAP = 'b2you-cat-snap';
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
  // Clave de los cinturones nacionales. Se lee una vez al montar; si vencio,
  // estaDesbloqueado() ya la borro y arranca en false.
  const [claveOk, setClaveOk] = useState(() => estaDesbloqueado());
  // Cuantos productos de la pagina actual estan montados (ver GRID_BATCH).
  const [visibleCount, setVisibleCount] = useState(GRID_BATCH);
  const loadMoreRef = useRef(null);
  // Restauracion del catalogo al volver de un producto.
  const restoreRef = useRef(false);        // la proxima vez que se muestre el catalogo, restaurar el snapshot
  const pendingScrollRef = useRef(null);   // scrollY a restaurar cuando terminen de renderizar los productos
  const skipBatchResetRef = useRef(false); // no reiniciar las tandas durante una restauracion

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
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.title = `B2YOU - ${decodeURIComponent(paramNombre)}`;
      loadSingleProduct();
      return;
    }

    const cat = getCategoryFromURL();
    document.title = cat ? `B2YOU - ${cat}` : 'B2YOU - Productos';
    const params = new URLSearchParams(location.search);
    const urlPage = parseInt(params.get('pagina')) || 1;
    const urlView = params.get('vista') || localStorage.getItem('b2you-viewMode') || DEFAULT_VIEW_MODE;

    // ¿Se esta volviendo al catalogo desde un producto? (boton de volver o back
    // del navegador). Si el snapshot es de esta misma categoria, se restaura
    // filtros, busqueda, pagina, vista y scroll en vez de resetear.
    let snap = null;
    if (restoreRef.current) {
      try { snap = JSON.parse(sessionStorage.getItem(CAT_SNAP) || 'null'); } catch { /* ignore */ }
    }
    restoreRef.current = false;
    const restaurar = snap && (snap.category || '') === (cat || '');

    if (restaurar) {
      setSearchInput(snap.search || '');
      setSearchQuery(snap.search || '');
      setSelectedTags(Array.isArray(snap.tags) ? snap.tags : []);
      const view = snap.view || urlView;
      const page = snap.page || urlPage;
      setViewMode(view);
      setCurrentPage(page);
      // Montar toda la pagina para que se pueda llegar al scroll guardado, y no
      // dejar que el efecto de tandas lo recorte de nuevo.
      skipBatchResetRef.current = true;
      setVisibleCount(PRODUCTS_PER_PAGE_GRID);
      pendingScrollRef.current = {
        y: typeof snap.scrollY === 'number' ? snap.scrollY : 0,
        folder: snap.anchorFolder || null,
        offset: snap.anchorOffset || 0,
      };
      updateURLParams({ vista: view, pagina: page });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setSearchInput('');
      setSearchQuery('');
      setSelectedTags([]);
      setCurrentPage(urlPage);
      setViewMode(urlView);
      updateURLParams({ vista: urlView, pagina: urlPage });
    }
    loadAllForScope();
  }, [paramCategoria, paramNombre, location.search]);

  // Guardar el estado del catalogo (categoria, filtros, busqueda, pagina, vista)
  // mientras se navega, para poder volver a el desde un producto.
  useEffect(() => {
    if (isSingleProduct) return;
    let s = {};
    try { s = JSON.parse(sessionStorage.getItem(CAT_SNAP) || '{}'); } catch { /* ignore */ }
    s.category = getCategoryFromURL() || '';
    s.tags = selectedTags;
    s.search = searchInput;
    s.page = currentPage;
    s.view = viewMode;
    try { sessionStorage.setItem(CAT_SNAP, JSON.stringify(s)); } catch { /* ignore */ }
  }, [isSingleProduct, selectedTags, searchInput, currentPage, viewMode, location.search]);

  // Guardar la posicion de scroll del catalogo (para restaurarla al volver).
  useEffect(() => {
    if (isSingleProduct) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        try {
          const s = JSON.parse(sessionStorage.getItem(CAT_SNAP) || '{}');
          s.scrollY = window.scrollY;
          // Producto ancla: la primer tarjeta cuyo borde superior pasa la barra
          // fija. Volver a el (no a un numero de px) hace que la restauracion no
          // dependa de que el banner mida exactamente lo mismo al recargar.
          const cards = document.querySelectorAll('.product-card[data-folder]');
          s.anchorFolder = null; s.anchorOffset = 0;
          for (const c of cards) {
            const t = c.getBoundingClientRect().top;
            if (t >= 88) { s.anchorFolder = c.dataset.folder; s.anchorOffset = Math.round(t); break; }
          }
          sessionStorage.setItem(CAT_SNAP, JSON.stringify(s));
        } catch { /* ignore */ }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [isSingleProduct]);

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
  // El back del navegador tambien tiene que restaurar el catalogo: se marca la
  // intencion y el efecto de scope de arriba (que corre al cambiar la URL) hace
  // el resto. Solo restaura si el snapshot es de la categoria a la que se vuelve.
  useEffect(() => {
    const handlePopState = () => { restoreRef.current = true; };
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

  // Cinturones nacionales: se tapan hasta que se acierte la clave. El corte va
  // ANTES de los filtros del visitante para que el contador, los filtros de
  // genero/origen y el buscador trabajen todos sobre lo que realmente se ve, y
  // para que no se cuelen por el buscador ni por la vista de todos los productos.
  const ocultosPorClave = claveOk ? 0 : allProducts.filter(esProtegido).length;
  const visibles = claveOk ? allProducts : allProducts.filter(p => !esProtegido(p));

  const filteredProducts = isSingleProduct ? products : visibles.filter(p => {
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
  // pagina, otra categoria, otro filtro o otra busqueda. Salvo durante una
  // restauracion, donde ya se monto la pagina entera para llegar al scroll.
  useEffect(() => {
    if (skipBatchResetRef.current) { skipBatchResetRef.current = false; return; }
    setVisibleCount(GRID_BATCH);
  }, [displayKey]);

  // Restaurar el scroll una vez que los productos de la pagina ya renderizaron.
  // Se re-asegura la posicion un par de veces porque la cinta de fotos del
  // banner termina de cargar despues y, al crecer, el navegador re-ancla el
  // scroll: sin esto queda unos cientos de px corrido.
  useEffect(() => {
    if (pendingScrollRef.current == null) return;
    if (isSingleProduct || isLoading || pageProducts.length === 0) return;
    const p = pendingScrollRef.current;
    pendingScrollRef.current = null;
    let cancel = false;
    const go = () => {
      if (cancel) return;
      // Ir al producto ancla (posicion inmune al alto del banner); si no esta,
      // caer al scroll absoluto guardado.
      if (p.folder) {
        const el = document.querySelector(`.product-card[data-folder="${(window.CSS && CSS.escape) ? CSS.escape(p.folder) : p.folder}"]`);
        if (el) { window.scrollBy(0, Math.round(el.getBoundingClientRect().top) - p.offset); return; }
      }
      window.scrollTo({ top: p.y, behavior: 'instant' });
    };
    requestAnimationFrame(() => requestAnimationFrame(go));
    const t1 = setTimeout(go, 220);
    const t2 = setTimeout(go, 480);
    return () => { cancel = true; clearTimeout(t1); clearTimeout(t2); };
  }, [isSingleProduct, isLoading, pageProducts.length, displayKey]);

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

  // ===== VOLVER AL CATALOGO DESDE UN PRODUCTO =====
  // Lo usan el boton "Volver al catalogo" y el de categoria del producto. Si hay
  // un catalogo guardado, vuelve a el tal cual estaba (filtros, pagina, scroll).
  // Si se entro directo al producto (sin catalogo previo), va a la categoria de
  // respaldo o a todos los productos.
  function handleReturnToCatalog(fallbackCat) {
    let snap = null;
    try { snap = JSON.parse(sessionStorage.getItem(CAT_SNAP) || 'null'); } catch { /* ignore */ }
    if (snap) {
      restoreRef.current = true;
      const params = new URLSearchParams();
      if (snap.category) params.set('categoria', snap.category);
      if (snap.page > 1) params.set('pagina', snap.page);
      if (snap.view && snap.view !== DEFAULT_VIEW_MODE) params.set('vista', snap.view);
      const qs = params.toString();
      navigate(`/productos${qs ? '?' + qs : ''}`);
    } else {
      navigate(fallbackCat ? `/productos?categoria=${encodeURIComponent(fallbackCat)}` : '/productos');
    }
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
          claveOk={claveOk}
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
          claveOk={claveOk}
        />
      )}

      <main id="productsContainer" style={{ position: 'relative' }}>
        {isBelts && !isSingleProduct && !isLoading && (
          <ClaveNacional
            desbloqueado={claveOk}
            ocultos={ocultosPorClave}
            onDesbloquear={() => setClaveOk(estaDesbloqueado())}
          />
        )}
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
                  onReturn={handleReturnToCatalog}
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
