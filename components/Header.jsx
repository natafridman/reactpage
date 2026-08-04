import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '/context/CartContext.jsx';
import { menuSubcategories } from '/components/SearchFilterBar.jsx';
import { loadCatalogIndex, thumbSrc, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

function Header({ categories, isHeaderHidden, onLogoClick, isMenuActive, setIsMenuActive, onCategoryClick, clearAtTop = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { count, openCart } = useCart();

  // Landing hero: the header starts transparent over the video and solidifies
  // once the visitor scrolls. Other pages keep the solid header.
  const [atTop, setAtTop] = useState(() => window.scrollY < 50);
  useEffect(() => {
    if (!clearAtTop) return undefined;
    const onScroll = () => setAtTop(window.scrollY < 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [clearAtTop]);
  const isClear = clearAtTop && atTop && !isMenuActive;
  const pageLabels = { '/Empresas': 'Empresas', '/Marcas': 'Marcas' };
  const pageBadge = pageLabels[location.pathname] || null;
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('b2you-theme');
    if (saved) return saved === 'dark';
    return false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('b2you-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Hint animation on mobile: quick scroll down then back up on the menu nav
  const menuRef = useRef(null);
  useEffect(() => {
    if (!isMenuActive || window.innerWidth > 768) return;
    const menu = menuRef.current;
    if (!menu) return;

    // Wait for the menu open transition to finish (max-height transition is 0.4s)
    const timer = setTimeout(() => {
      menu.scrollTo({ top: 40, behavior: 'smooth' });
      setTimeout(() => {
        menu.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);
    }, 300);

    return () => clearTimeout(timer);
  }, [isMenuActive]);

  const handleHamburgerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuActive(!isMenuActive);
  };

  // ===== Mega-menu: foto de portada por categoria + categoria en preview =====
  const catList = categories.filter((c) => c !== 'Mundial');
  const subCats = categories.filter((c) => menuSubcategories(c).length > 0);
  // Preview por defecto: la categoria con mas subcategorias (luce la funcion).
  const defaultCat = subCats.slice().sort((a, b) => menuSubcategories(b).length - menuSubcategories(a).length)[0]
    || catList[0] || null;
  const [covers, setCovers] = useState({});
  const [activeCat, setActiveCat] = useState(null);

  // Al abrir el menu por primera vez, cargar el indice del catalogo (cacheado) y
  // sacar una foto de portada por categoria: el primer producto que tenga imagen.
  useEffect(() => {
    if (!isMenuActive || Object.keys(covers).length) return undefined;
    let alive = true;
    loadCatalogIndex().then((index) => {
      if (!alive) return;
      const map = {};
      for (const [cat, items] of Object.entries(index)) {
        const it = (items || []).find((p) => ((p.metadata && p.metadata.images) || p.availableImages || []).length);
        if (!it) continue;
        const img = ((it.metadata && it.metadata.images) || it.availableImages)[0];
        map[cat] = thumbSrc(`/${IMAGES_BASE_FOLDER}/${cat}/${it.productFolder}/${img}`);
      }
      setCovers(map);
    }).catch(() => {});
    return () => { alive = false; };
  }, [isMenuActive, covers]);

  // Categoria por defecto del preview: la primera con subcategorias (queda rico).
  useEffect(() => {
    if (!activeCat && defaultCat) setActiveCat(defaultCat);
  }, [defaultCat, activeCat]);

  const goCat = (e, cat, sub) => { onCategoryClick && onCategoryClick(e, cat, sub); };
  const goPage = (path) => { navigate(path); setIsMenuActive(false); };
  const previewCat = activeCat && categories.includes(activeCat) ? activeCat : null;
  const previewSubs = previewCat ? menuSubcategories(previewCat) : [];

  return (
    <header className={`main-header ${isHeaderHidden ? 'header-hidden' : ''} ${isClear ? 'header-clear' : ''}`}>
      <div className="header-container">
        <button
          className={`hamburger-btn ${isMenuActive ? 'active' : ''}`}
          id="hamburgerBtn"
          aria-label="Menu de categorias"
          onClick={handleHamburgerClick}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="logo" onClick={onLogoClick}>
          <img src="/images/Branding/B2 B2YOU Header Landscape 2.png" alt="B2YOU" className="logo-image" />
          {pageBadge && <span className="header-page-badge">{pageBadge}</span>}
        </div>

        <div className="header-actions">
          <button
            className="cart-toggle"
            aria-label={count > 0 ? `Abrir carrito (${count})` : 'Abrir carrito'}
            onClick={openCart}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {count > 0 && <span className="cart-toggle-badge" aria-hidden="true">{count}</span>}
          </button>

          <button
            className="theme-toggle"
            aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      <nav className={`categories-menu mega ${isMenuActive ? 'active' : ''}`} id="categoriesMenu" ref={menuRef}>
        <div className="mega-inner">
          {/* IZQUIERDA: lista de categorias */}
          <div className="mega-list" onMouseLeave={() => setActiveCat(defaultCat)}>
            <span className="menu-section-label">Categorías</span>

            <button
              className="mega-cat mega-cat--all"
              onMouseEnter={() => setActiveCat(null)}
              onClick={() => goPage('/productos')}
            >
              <span className="mega-cat-name">Ver todo</span>
            </button>

            {catList.map((cat) => {
              const subs = menuSubcategories(cat);
              return (
                <div className="mega-cat-wrap" key={cat}>
                  <a
                    href={`?categoria=${encodeURIComponent(cat)}`}
                    className={`mega-cat${previewCat === cat ? ' is-active' : ''}${subs.length ? ' has-subs' : ''}`}
                    onMouseEnter={() => setActiveCat(cat)}
                    onFocus={() => setActiveCat(cat)}
                    onClick={(e) => goCat(e, cat)}
                  >
                    <span className="mega-cat-name">{cat}</span>
                    <svg className="mega-cat-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </a>
                  {subs.length > 0 && (
                    <div className="mega-cat-subs">
                      {subs.map((s) => (
                        <a
                          key={s.key}
                          href={`?categoria=${encodeURIComponent(cat)}&sub=${encodeURIComponent(s.key)}`}
                          className="mega-sub-chip"
                          onClick={(e) => goCat(e, cat, s.key)}
                        >
                          {s.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {categories.includes('Mundial') && (
              <a
                href="?categoria=Mundial"
                className="mega-cat mega-cat--mundial"
                onMouseEnter={() => setActiveCat('Mundial')}
                onClick={(e) => goCat(e, 'Mundial')}
              >
                <span className="mega-cat-name">Mundial</span>
              </a>
            )}

            <div className="mega-more">
              <button onClick={() => goPage('/Empresas')}>Empresas</button>
              <button onClick={() => goPage('/Marcas')}>Marcas</button>
              <button onClick={() => goPage('/Nosotros')}>Nosotros</button>
            </div>
          </div>

          {/* DERECHA: vista previa (solo desktop; en mobile las subcats van inline) */}
          <div className="mega-preview" aria-hidden="true">
            {previewCat ? (
              <>
                <div className="mega-preview-media">
                  {covers[previewCat]
                    ? <img src={covers[previewCat]} alt="" loading="lazy" decoding="async" />
                    : <div className="mega-preview-ph" />}
                </div>
                <div className="mega-preview-body">
                  <span className="mega-preview-eyebrow">Categoría</span>
                  <p className="mega-preview-title accent">{previewCat}</p>
                  <a
                    href={`?categoria=${encodeURIComponent(previewCat)}`}
                    className="mega-preview-all"
                    onClick={(e) => goCat(e, previewCat)}
                  >
                    Ver todo <span aria-hidden="true">→</span>
                  </a>
                  {previewSubs.length > 0 && (
                    <div className="mega-preview-subs">
                      {previewSubs.map((s) => (
                        <a
                          key={s.key}
                          href={`?categoria=${encodeURIComponent(previewCat)}&sub=${encodeURIComponent(s.key)}`}
                          className="mega-sub-chip"
                          onClick={(e) => goCat(e, previewCat, s.key)}
                        >
                          {s.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mega-preview-body mega-preview-body--all">
                <span className="mega-preview-eyebrow">B2YOU</span>
                <p className="mega-preview-title accent">Todo el catálogo</p>
                <button className="mega-preview-all" onClick={() => goPage('/productos')}>
                  Ver todos los productos <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menu clasico (lista plana) = el de antes. Solo se muestra en mobile,
            donde el mega-menu con vista previa no tiene sentido (no hay hover).
            El alternado desktop/mobile lo decide el CSS. */}
        <div className="menu-classic">
          <div className="categories-container">
            <div className="nav-group">
              <span className="menu-section-label">MENÚ</span>
              <button className="category-link" onClick={() => goPage('/Empresas')}>EMPRESAS</button>
              <button className="category-link" onClick={() => goPage('/Marcas')}>MARCAS</button>
              <button className="category-link nav-nosotros" onClick={() => goPage('/Nosotros')}>NOSOTROS</button>
            </div>
            <div className="categories-group">
              <span className="menu-section-label">CATEGORÍAS</span>
              <div className="categories-links">
                <button className="category-link" onClick={() => goPage('/productos')}>TODO</button>
                {categories.filter((cat) => cat === 'Mundial').map((cat) => (
                  <a
                    key={cat}
                    href={`?categoria=${encodeURIComponent(cat)}`}
                    className="category-link category-link--mundial"
                    onClick={(e) => goCat(e, cat)}
                  >
                    {cat.toUpperCase()}
                  </a>
                ))}
                {catList.map((cat) => (
                  <a
                    key={cat}
                    href={`?categoria=${encodeURIComponent(cat)}`}
                    className="category-link"
                    onClick={(e) => goCat(e, cat)}
                  >
                    {cat.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
