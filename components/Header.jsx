import { useState } from 'react';

function Header({ categories, isHeaderHidden, onLogoClick, isMenuActive, setIsMenuActive }) {
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
          aria-label="Menú de categorías"
          onClick={handleHamburgerClick}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className="logo" onClick={onLogoClick}>
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
