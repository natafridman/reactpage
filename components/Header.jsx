function Header({ categories, isHeaderHidden, onLogoClick, isMenuActive, setIsMenuActive, onCategoryClick }) {
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
          <img src="/images/Branding/B2 B2YOU Header Landscape 2.png" alt="B2YOU" className="logo-image" />
        </div>
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