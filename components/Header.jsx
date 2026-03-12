import { useState, useEffect } from 'react';

function Header({ categories, isHeaderHidden, onLogoClick, isMenuActive, setIsMenuActive, onCategoryClick }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('b2you-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('b2you-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleHamburgerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuActive(!isMenuActive);
  };

  return (
    <header className={`main-header ${isHeaderHidden ? 'header-hidden' : ''}`}>
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
        </div>

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

      <nav className={`categories-menu ${isMenuActive ? 'active' : ''}`} id="categoriesMenu">
        <div className="categories-container" id="categoriesContainer">
          {categories.map(cat => (
            <a
              key={cat}
              href={`?categoria=${encodeURIComponent(cat)}`}
              className="category-link"
              onClick={(e) => onCategoryClick && onCategoryClick(e, cat)}
            >
              {cat.toUpperCase()}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Header;
