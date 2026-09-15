import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '/context/CartContext.jsx';
import ShiftingNav, { DESTACADOS, featImage } from '/components/ShiftingNav.jsx';
import { loadCatalogIndex } from '/utils/productUtils.js';

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
  // El sitio va en claro: el boton de tema se reemplazo por WhatsApp e
  // Instagram, y una preferencia oscura guardada de antes no debe quedar pegada.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.removeItem('b2you-theme');
  }, []);

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

  const catList = categories.filter((c) => c !== 'Mundial');

  // Indice del catalogo (cacheado) para las fotos de los dropdowns del nav. Se
  // carga recien cuando se abre un dropdown, para no pedir el JSON en cada carga.
  const [index, setIndex] = useState(null);
  const indexLoaded = useRef(false);
  const loadIndex = () => {
    if (indexLoaded.current) return;
    indexLoaded.current = true;
    loadCatalogIndex().then(setIndex).catch(() => {});
  };

  // El menu del telefono tambien muestra los destacados con foto, asi que el
  // indice se pide al abrirlo (igual que al abrir un dropdown en escritorio).
  const destacados = DESTACADOS.filter((d) => categories.includes(d.cat));
  useEffect(() => { if (isMenuActive) loadIndex(); }, [isMenuActive]);

  const goCat = (e, cat, sub) => { onCategoryClick && onCategoryClick(e, cat, sub); };
  const goPage = (path) => { navigate(path); setIsMenuActive(false); };

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

        {/* Nav de escritorio: barra de tabs centrada con dropdown que se desliza.
            En mobile se oculta (por CSS) y queda la hamburguesa + menu clasico. */}
        <ShiftingNav
          categories={categories}
          index={index}
          onOpen={loadIndex}
          onCat={goCat}
          onNav={goPage}
        />

        <div className="header-actions">
          <button
            className="cart-toggle"
            aria-label={count > 0 ? `Abrir el pedido (${count})` : 'Abrir el pedido'}
            onClick={openCart}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {count > 0 && <span className="cart-toggle-badge" aria-hidden="true">{count}</span>}
          </button>

          <a
            className="header-icon-btn"
            href="https://wa.me/5491178279281?text=Hola!%20Estoy%20interesado%20en%20uno%20de%20los%20productos%20de%20su%20marca"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribinos por WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </a>
          <a
            className="header-icon-btn"
            href="https://www.instagram.com/b2you.team/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Seguinos en Instagram"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        </div>
      </div>

      <nav className={`categories-menu mega ${isMenuActive ? 'active' : ''}`} id="categoriesMenu" ref={menuRef}>
        {/* Menu clasico (lista plana) = el de antes. Solo se muestra en mobile.
            En desktop el nav es el ShiftingNav (en el header, arriba). */}
        <div className="menu-classic">
          <div className="categories-container">
            {/* Los mismos cuatro destacados que en escritorio, con foto: es lo
                primero que se ve al abrir el menu en el telefono. */}
            <div className="mnav-group">
              <span className="menu-section-label">DESTACADOS</span>
              <div className="mnav-dest">
                {destacados.map((d) => {
                  const src = featImage(index, d);
                  return (
                    <a
                      key={d.cat}
                      href={`?categoria=${encodeURIComponent(d.cat)}`}
                      className="mnav-dest-item"
                      onClick={(e) => goCat(e, d.cat)}
                    >
                      <span className="mnav-dest-media">
                        {src && <img src={src} alt="" loading="lazy" decoding="async" />}
                      </span>
                      <span className="mnav-dest-name">{d.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="mnav-group">
              <span className="menu-section-label">TODO EL CATÁLOGO</span>
              <div className="categories-links">
                {catList.map((cat) => (
                  <a
                    key={cat}
                    href={`?categoria=${encodeURIComponent(cat)}`}
                    className="category-link"
                    onClick={(e) => goCat(e, cat)}
                  >
                    {cat}
                  </a>
                ))}
                <button className="category-link mnav-all" onClick={() => goPage('/productos')}>
                  Ver todo el catálogo <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>

            <div className="mnav-group">
              <span className="menu-section-label">PARA MARCAS</span>
              <div className="categories-links">
                <button className="category-link" onClick={() => goPage('/Empresas')}>Empresas</button>
                <button className="category-link" onClick={() => goPage('/Marcas')}>Marcas</button>
                <button className="category-link nav-nosotros" onClick={() => goPage('/Nosotros')}>Nosotros</button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
