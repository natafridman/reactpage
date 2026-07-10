import { medSrc } from '/utils/productUtils.js';

// Emotional brand-passion / craftsmanship moment - gives the catalog a soul so
// visitors connect with the brand, not just the products.
const STORY_IMG = '/images/Categorias/Bolsos/Bolso Duffle/IMG_1585.jpeg';

function BrandStory() {
  const points = [
    'Cuero genuino seleccionado pieza por pieza',
    'Terminaciones cuidadas a mano',
    'Tu logo, grabado o estampado',
  ];

  return (
    <section className="brand-story">
      <div className="brand-story-grid">
        <div className="brand-story-media">
          <img
            src={medSrc(STORY_IMG)}
            alt="Marroquinería B2YOU hecha a mano"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              if (!e.target.dataset.fallback) {
                e.target.dataset.fallback = '1';
                e.target.src = STORY_IMG;
              }
            }}
          />
          <div className="brand-story-badge">
            <span className="brand-story-badge-eyebrow">Origen</span>
            <span className="brand-story-badge-label">Hecho en Buenos Aires</span>
          </div>
        </div>

        <div className="brand-story-content">
          <span className="brand-story-eyebrow">Nuestra obsesión</span>
          <h2 className="brand-story-title">Cuero de verdad, hecho para <em className="accent">durar</em></h2>
          <p className="brand-story-text">
            No hacemos productos descartables. Cada bolso, cartera o cinturón sale de
            nuestro taller pensado para acompañarte por años y para representar bien a
            quien lo lleva. Esa es la diferencia que se siente al tocarlo.
          </p>
          <ul className="brand-story-points">
            {points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default BrandStory;
