import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '/components/Header.jsx';
import Footer from '/components/Footer.jsx';
import { loadManifest } from '/utils/productUtils.js';
import '/v2.css';

// Base de las tres paginas de "Para marcas" (Empresas, Marcas, Nosotros).
// Antes cada una repetia el mismo armazon: cargar categorias, estado del menu,
// el envio del formulario de contacto y los mismos handlers. Ahora eso vive una
// sola vez y cada pagina se queda solo con su contenido.
//
// El lenguaje visual es el de la landing (.v2): hero con foto a sangre,
// secciones .v2-section, banda de beneficios, banda de cierre.

export const WA_NUMBER = '5491178279281';

export const waLink = (texto) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`;

// Iconos de trazo, del mismo set que usa la landing.
export function Icono({ name }) {
  const base = {
    width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
  };
  switch (name) {
    case 'muestra':
      return (<svg {...base}><path d="M21 8l-9-5-9 5v8l9 5 9-5z" /><path d="M3 8l9 5 9-5" /><path d="M12 13v8" /></svg>);
    case 'tilde':
      return (<svg {...base}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.6 2.6L16 9.7" /></svg>);
    case 'envio':
      return (<svg {...base}><rect x="1.5" y="6" width="13" height="10" rx="1" /><path d="M14.5 9h4l3 3v4h-7z" /><circle cx="6" cy="18" r="1.8" /><circle cx="18" cy="18" r="1.8" /></svg>);
    case 'logo':
      return (<svg {...base}><path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></svg>);
    case 'equipo':
      return (<svg {...base}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>);
    case 'volumen':
      return (<svg {...base}><path d="M21 8l-9-5-9 5v8l9 5 9-5z" /><path d="M7 5.5l9 5" /><path d="M3 8l9 5 9-5" /></svg>);
    case 'cuero':
      return (<svg {...base}><path d="M12 3l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6L7.1 18.2l.9-5.5-4-3.9L9.6 8z" /></svg>);
    case 'etiqueta':
      return (<svg {...base}><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.3" /></svg>);
    case 'taller':
      return (<svg {...base}><path d="M3 20V9l6-4 6 4v11" /><path d="M15 20V11l6 3v6" /><path d="M2 20h20" /><path d="M9 20v-4h3v4" /></svg>);
    case 'reloj':
      return (<svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5.5l3.5 2" /></svg>);
    default:
      return (<svg {...base}><circle cx="12" cy="12" r="9" /></svg>);
  }
}

function PaginaV2({ titulo, children }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isMenuActive, setIsMenuActive] = useState(false);

  useEffect(() => { document.title = titulo; }, [titulo]);

  useEffect(() => {
    let vivo = true;
    loadManifest()
      .then((m) => { if (vivo) setCategories(Object.keys(m)); })
      .catch((e) => console.error('No se pudo cargar el catálogo:', e));
    return () => { vivo = false; };
  }, []);

  function handleContactSubmit(e) {
    e.preventDefault();
    const nombre = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const mensaje = document.getElementById('contactMessage').value;
    const cuerpo = encodeURIComponent(`Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`);
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Mensaje de ${nombre}`)}%0A%0A${cuerpo}`, '_blank');
    e.target.reset();
  }

  function handleCategoryClick(e, cat, sub) {
    e.preventDefault();
    setIsMenuActive(false);
    navigate(`/productos?categoria=${encodeURIComponent(cat)}${sub ? `&sub=${encodeURIComponent(sub)}` : ''}`);
  }

  return (
    <div className="v2 v2-pagina">
      <Header
        categories={categories}
        isMenuActive={isMenuActive}
        isHeaderHidden={false}
        setIsMenuActive={setIsMenuActive}
        onLogoClick={() => navigate('/')}
        onCategoryClick={handleCategoryClick}
      />
      <div className="header-spacer" aria-hidden="true" />
      <main>{children}</main>
      <Footer onContactSubmit={handleContactSubmit} />
    </div>
  );
}

// Hero con foto a sangre, mas bajo que el de la landing: estas paginas se leen,
// no se miran.
export function HeroPagina({ base, alto, eyebrow, titulo, bajada, acciones }) {
  return (
    <section className="v2-hero-photo v2-hero-pagina">
      <img
        className="v2-hero-photo-img"
        src={`/images/hero/${base}-2400.webp`}
        srcSet={`/images/hero/${base}-1400.webp 1400w, /images/hero/${base}-2400.webp 2400w`}
        sizes="100vw"
        alt={alto}
        fetchpriority="high"
        decoding="async"
      />
      <div className="v2-hero-photo-inner">
        <span className="v2-eyebrow">{eyebrow}</span>
        <h1 className="v2-h1">{titulo}</h1>
        <p className="v2-lead">{bajada}</p>
        {acciones && <div className="v2-cta-row">{acciones}</div>}
      </div>
    </section>
  );
}

// Los pasos van numerados porque son una secuencia real: uno detras del otro.
export function Pasos({ titulo, pasos }) {
  return (
    <section className="v2-section">
      <div className="v2-section-head"><h2 className="v2-h2">{titulo}</h2></div>
      <ol className="v2-pasos">
        {pasos.map(([t, d], i) => (
          <li className="v2-paso" key={t}>
            <span className="v2-paso-n">{String(i + 1).padStart(2, '0')}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

// Datos duros del pedido, sin inventar nada: lo que ya se responde por WhatsApp.
export function Ficha({ datos }) {
  return (
    <section className="v2-section">
      <dl className="v2-ficha">
        {datos.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Preguntas({ items }) {
  return (
    <section className="v2-section v2-faq">
      <h2 className="v2-h2">Preguntas frecuentes</h2>
      <dl className="v2-faq-grid">
        {items.map(([q, a]) => (<div key={q}><dt>{q}</dt><dd>{a}</dd></div>))}
      </dl>
    </section>
  );
}

export function Cierre({ titulo, texto, textoWa }) {
  return (
    <section className="v2-close-band">
      <h2 className="v2-close-title">{titulo}</h2>
      <p>{texto}</p>
      <a className="v2-btn v2-btn-light" href={waLink(textoWa)} target="_blank" rel="noopener noreferrer">
        Pedí tu cotización
      </a>
    </section>
  );
}

export default PaginaV2;
