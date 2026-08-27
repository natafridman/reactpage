import { useNavigate } from 'react-router-dom';
import { medSrc } from '/utils/productUtils.js';

// Banda de productos con la mejor foto: el visualizador de imagen del viejo
// BrandStory (foto grande con badge), repetido para 4 productos. Cada tarjeta
// entra directo al producto.
const ITEMS = [
  {
    cat: 'Bolsos', folder: 'Bolso Duffle', title: 'Bolso Duffle',
    image: '/images/Categorias/Bolsos/Bolso Duffle/IMG_1585.jpeg',
  },
  {
    cat: 'Maletines', folder: 'Maletin Ejecutivo', title: 'Maletín Ejecutivo',
    image: '/images/Categorias/Maletines/Maletin Ejecutivo/IMG_1571.jpeg',
  },
  {
    cat: 'Cinturones', folder: 'Cinturon Moderno', title: 'Cinturón Moderno',
    image: '/images/Categorias/Cinturones/Cinturon Moderno/8O3A2335.jpeg',
  },
  {
    cat: 'Necessaries', label: 'Necessaires', folder: 'Necessaire Lisboa', title: 'Neceser Lisboa',
    image: '/images/Categorias/Necessaries/Necessaire Lisboa/LISBOA(1).jpeg',
  },
];

function ShowcaseProducts() {
  const navigate = useNavigate();

  return (
    <section className="showcase">
      <div className="showcase-grid">
        {ITEMS.map((p) => (
          <button
            key={p.folder}
            className="showcase-card"
            onClick={() => navigate(`/producto/${encodeURIComponent(p.cat)}/${encodeURIComponent(p.folder)}`)}
            aria-label={`Ver ${p.title}`}
          >
            <img
              src={medSrc(p.image)}
              alt={p.title}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                if (!e.target.dataset.fallback) {
                  e.target.dataset.fallback = '1';
                  e.target.src = p.image;
                }
              }}
            />
            <span className="brand-story-badge">
              <span className="brand-story-badge-eyebrow">{p.label || p.cat}</span>
              <span className="brand-story-badge-label">{p.title}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default ShowcaseProducts;
