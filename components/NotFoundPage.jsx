import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Branded 404: keeps the visitor inside the store instead of a dead end.
function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'B2YOU - Página no encontrada';
    // This page has no Header (which normally applies the saved theme), so
    // honor the visitor's stored preference here.
    const saved = localStorage.getItem('b2you-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  }, []);

  return (
    <div className="notfound-page">
      <span className="notfound-code" aria-hidden="true">404</span>
      <h1 className="notfound-title">Esta página no <em className="accent">existe</em></h1>
      <p className="notfound-text">
        El enlace puede estar vencido o mal escrito. Lo importante: el catálogo sigue acá.
      </p>
      <div className="notfound-actions">
        <button className="hero-cta hero-cta-primary" onClick={() => navigate('/productos')}>
          Ver productos
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
        <button className="notfound-home" onClick={() => navigate('/')}>Ir al inicio</button>
      </div>
    </div>
  );
}

export default NotFoundPage;
