import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './v2.css';

import Header from '/components/Header.jsx';
import Footer from '/components/Footer.jsx';
import ProductCard from '/components/ProductCard.jsx';
import { loadCatalogIndex, thumbSrc, medSrc, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

// v2 de la landing, con la gramatica de una tienda (referencias: Gueber, Saxs):
// barra de anuncios, hero con foto a sangre, circulos de categorias, banners
// con foto, banda de beneficios, "los mas pedidos" con carrito, "sobre
// nosotros" enmarcado, cierre. Identidad B2YOU: Fraunces, cognac/crema,
// sin precios (se cotiza) y sin promos inventadas. Estilos en v2.css (.v2).

const WA_NUMBER = '5491178279281';
const WA_QUOTE = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  'Hola B2YOU, quiero pedir una cotización para productos con mi marca.'
)}`;
const LOGO = '/images/Branding/B2 B2YOU Header Landscape 2.png';
const IMG = (cat, folder, file) => `/${IMAGES_BASE_FOLDER}/${cat}/${folder}/${file}`;

// Fotos propias del catalogo para las piezas editoriales.
const ABOUT_PHOTOS = [
  IMG('Carteras', 'Cartera Buckle Z71018', '01.jpg'),
  IMG('Carteras', 'Cartera Convertible Terra Y71009', '01.jpg'),
];

// Circulos de categorias: producto curado con foto limpia sobre blanco.
const CIRCLES = ['Carteras', 'Bolsos', 'Cinturones', 'Mochilas', 'Billeteras', 'Gorras', 'Maletines', 'Necessaries'];
const CIRCLE_PICKS = {
  Carteras: ['Cartera Florencia', '3(1).jpeg'],
  Bolsos: ['Bolso Duffle', 'IMG_1585.jpeg'],
  Cinturones: ['Cinturon Moderno', '8O3A2335.jpeg'],
  Mochilas: ['Mochila Roma', null],
  Billeteras: ['Billetera Roma', null],
  Gorras: ['Gorra Casual', 'IMG_4567.jpeg'],
  Maletines: ['Maletin Ejecutivo', 'IMG_1571.jpeg'],
  Necessaries: ['Necessaire Lisboa', 'LISBOA_vfirst.jpeg'],
};
const LABEL = { Necessaries: 'Necessaires' };

// Banners grandes con foto (nombre encima). Cuatro categorias fuertes.
const BANNERS = [
  { cat: 'Carteras', title: 'Carteras', photo: IMG('Carteras', 'Cartera Eco Hobo U71002-Y71006', '01.jpg'), pos: '50% 35%' },
  { cat: 'Bolsos', title: 'Bolsos', photo: IMG('Bolsos', 'Bolso Duffle', 'G28A0280.jpeg'), pos: '50% 50%' },
  { cat: 'Mochilas', title: 'Mochilas', photo: IMG('Mochilas', 'Mochila London', 'LONDON(1).jpeg'), pos: '50% 50%' },
  { cat: 'Cinturones', title: 'Cinturones', photo: IMG('Cinturones', 'Cinturon Coimbra', 'COIMBRA(1).jpg'), pos: '50% 62%' },
];

// Productos destacados: (categoria, carpeta) del indice real (misma tarjeta y carrito).
const FEATURED = [
  ['Bolsos', 'Bolso Duffle'],
  ['Carteras', 'Cartera Florencia'],
  ['Maletines', 'Maletin Ejecutivo'],
  ['Cinturones', 'Cinturon Moderno'],
  ['Mochilas', 'Mochila Roma'],
  ['Gorras', 'Gorra Casual'],
  ['Billeteras', 'Billetera Roma'],
  ['Necessaries', 'Necessaire Lisboa'],
];

// Banda de beneficios = como se compra, en tres pasos reales (del FAQ).
const BENEFITS = [
  { icon: 'sample', title: 'Pedís una muestra', text: 'Nos contás producto, cantidad y cómo va tu logo.' },
  { icon: 'check', title: 'La aprobás con tu marca', text: 'Recién ahí se produce. Sin sorpresas.' },
  { icon: 'truck', title: 'Producción en 15 a 30 días', text: 'Presupuesto cerrado. Envíos a todo el país.' },
];

const FAQS = [
  ['¿Cuál es el volumen de pedido?', 'No manejamos un mínimo fijo: adecuamos el volumen a cada cliente. Escribinos y armamos una propuesta a tu medida.'],
  ['¿Cuánto tarda la producción?', 'De 15 a 30 días hábiles desde la aprobación de la muestra. Pedidos grandes pueden requerir más tiempo.'],
  ['¿Puedo pedir muestras antes?', 'Sí, siempre lo recomendamos. Las muestras tienen un costo que se descuenta del pedido final una vez confirmado.'],
  ['¿Qué técnicas de personalización ofrecen?', 'Grabado láser, estampado en calor, bordado computarizado y etiquetas personalizadas, según el material.'],
];

function Icon({ name }) {
  const common = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (name === 'sample') return (<svg {...common}><path d="M21 8l-9-5-9 5v8l9 5 9-5z" /><path d="M3 8l9 5 9-5" /><path d="M12 13v8" /></svg>);
  if (name === 'check') return (<svg {...common}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.6 2.6L16 9.7" /></svg>);
  return (<svg {...common}><rect x="1.5" y="6" width="13" height="10" rx="1" /><path d="M14.5 9h4l3 3v4h-7z" /><circle cx="6" cy="18" r="1.8" /><circle cx="18" cy="18" r="1.8" /></svg>);
}

function firstImage(p) {
  const list = p.metadata && typeof p.metadata.images === 'string'
    ? p.metadata.images.split(',').map((s) => s.trim()).filter(Boolean)
    : (Array.isArray(p.metadata?.images) ? p.metadata.images : []);
  return list[0] || (p.availableImages && p.availableImages[0]) || null;
}

function LandingV2() {
  const navigate = useNavigate();
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const [index, setIndex] = useState(null);

  useEffect(() => { document.title = 'B2YOU - Accesorios con tu marca'; }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const idx = await loadCatalogIndex();
        if (!alive) return;
        setIndex(idx);
        setCategories(Object.keys(idx));
      } catch (e) { console.error('v2: no se pudo cargar el catálogo', e); }
    })();
    return () => { alive = false; };
  }, []);

  const circles = useMemo(() => {
    if (!index) return [];
    return CIRCLES.filter((c) => Array.isArray(index[c]) && index[c].length > 0).map((c) => {
      const [pickFolder, pickImg] = CIRCLE_PICKS[c] || [];
      const picked = pickFolder ? index[c].find((p) => p.productFolder === pickFolder) : null;
      const prod = picked || index[c].find((p) => firstImage(p));
      const img = prod ? (picked && pickImg ? pickImg : firstImage(prod)) : null;
      return { name: c, label: LABEL[c] || c, image: img ? thumbSrc(IMG(c, prod.productFolder, img)) : null };
    });
  }, [index]);

  const featured = useMemo(() => {
    if (!index) return [];
    return FEATURED.map(([cat, folder]) => {
      const p = (index[cat] || []).find((x) => x.productFolder === folder);
      return p ? { ...p, category: cat } : null;
    }).filter(Boolean);
  }, [index]);

  const goCat = (e, cat) => { e.preventDefault(); setIsMenuActive(false); navigate(`/productos?categoria=${encodeURIComponent(cat)}`); };
  const goAll = (e) => { e.preventDefault(); navigate('/productos'); };
  function handleCategoryClick(e, cat, sub) {
    e.preventDefault();
    setIsMenuActive(false);
    navigate(`/productos?categoria=${encodeURIComponent(cat)}${sub ? `&sub=${encodeURIComponent(sub)}` : ''}`);
  }
  function handleContactSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    const subject = encodeURIComponent(`Mensaje de ${name}`);
    const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`);
    window.open(`https://wa.me/${WA_NUMBER}?text=${subject}%0A%0A${body}`, '_blank');
    e.target.reset();
  }

  // Revelado escalonado (circulos, banners, beneficios). Con reduced-motion se muestran directo.
  useEffect(() => {
    const els = document.querySelectorAll('.v2-landing .v2-reveal');
    if (!els.length || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [circles]);

  return (
    <div className="v2 v2-landing">
      <Header
        categories={categories}
        isMenuActive={isMenuActive}
        setIsMenuActive={setIsMenuActive}
        onLogoClick={() => navigate('/')}
        onCategoryClick={handleCategoryClick}
      />
      <div className="header-spacer" aria-hidden="true" />

      {/* Barra de anuncios (debajo del header fijo): beneficios reales, sin promos inventadas. */}
      <div className="v2-announce" role="note">
        <span>Envíos a todo el país</span>
        <span>Muestra antes de producir</span>
        <span>Presupuesto cerrado por WhatsApp</span>
      </div>

      <main>
        {/* ===== HERO: foto a sangre + frase ===== */}
        <section className="v2-hero-photo">
          <img className="v2-hero-photo-img" src="/images/hero/hero-v2-2400.webp" srcSet="/images/hero/hero-v2-1400.webp 1400w, /images/hero/hero-v2-2400.webp 2400w" sizes="100vw" alt="Cuero sobre la mesa de trabajo de la curtiembre" fetchpriority="high" decoding="async" />
          <div className="v2-hero-photo-inner">
            <h1 className="v2-h1">Tu marca, en productos que <em>se usan</em> todos los días.</h1>
            <p className="v2-lead">Bolsos, cinturones, carteras y gorras fabricados en Buenos Aires, con tu logo grabado, bordado o estampado.</p>
            <div className="v2-cta-row">
              <a className="v2-btn v2-btn-light" href="/productos" onClick={goAll}>Ver el catálogo</a>
              <a className="v2-btn v2-btn-outline-light" href={WA_QUOTE} target="_blank" rel="noopener noreferrer">Pedí tu cotización</a>
            </div>
          </div>
        </section>

        {/* ===== CIRCULOS DE CATEGORIAS ===== */}
        <section className="v2-section v2-circles" aria-label="Categorías">
          <div className="v2-circles-row">
            {circles.map((c, i) => (
              <a key={c.name} className="v2-circle v2-reveal" style={{ '--i': i }} href={`/productos?categoria=${encodeURIComponent(c.name)}`} onClick={(e) => goCat(e, c.name)}>
                <span className="v2-circle-media">{c.image && <img src={c.image} alt="" loading="lazy" decoding="async" />}</span>
                <span className="v2-circle-name">{c.label}</span>
              </a>
            ))}
          </div>
        </section>

        {/* ===== BANNERS CON FOTO ===== */}
        <section className="v2-section v2-banners">
          {BANNERS.map((b, i) => (
            <a key={b.cat} className={`v2-banner v2-reveal${b.contain ? ' v2-banner--contain' : ''}`} style={{ '--i': i }} href={`/productos?categoria=${encodeURIComponent(b.cat)}`} onClick={(e) => goCat(e, b.cat)}>
              <img src={medSrc(b.photo)} alt="" loading="lazy" decoding="async" style={{ objectPosition: b.pos }} />
              <span className="v2-banner-body">
                <span className="v2-banner-title">{b.title}</span>
                <span className="v2-banner-cta">Ver más</span>
              </span>
            </a>
          ))}
        </section>

        {/* ===== BANDA DE BENEFICIOS (como se compra) ===== */}
        <section className="v2-benefits">
          <div className="v2-benefits-inner">
            {BENEFITS.map((b, i) => (
              <div key={b.title} className="v2-benefit v2-reveal" style={{ '--i': i }}>
                <Icon name={b.icon} />
                <div>
                  <span className="v2-benefit-title">{b.title}</span>
                  <span className="v2-benefit-text">{b.text}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== LOS MAS PEDIDOS ===== */}
        <section className="v2-section v2-featured">
          <div className="v2-section-head">
            <h2 className="v2-h2">Los más pedidos</h2>
            <a className="v2-link" href="/productos" onClick={goAll}>Ver todo el catálogo</a>
          </div>
          <div className="v2-grid">
            {featured.map((p, i) => (
              <ProductCard key={`${p.category}/${p.productFolder}`} product={p} staggerIndex={i} />
            ))}
          </div>
        </section>

        {/* ===== SOBRE NOSOTROS (enmarcado, dos fotos) ===== */}
        <section className="v2-section v2-about">
          <div className="v2-about-frame">
            <img className="v2-about-photo" src={medSrc(ABOUT_PHOTOS[0])} alt="Cartera de cuero marrón al hombro" loading="lazy" decoding="async" />
            <div className="v2-about-copy">
              <h2 className="v2-about-title">Hacemos los accesorios que tu marca necesita</h2>
              <img className="v2-about-logo" src={LOGO} alt="B2YOU" loading="lazy" decoding="async" />
              <p>Diseñamos y fabricamos bolsos, mochilas, carteras, cinturones y más, con tu identidad, tu logo y la calidad que tus clientes merecen.</p>
              <a className="v2-btn v2-btn-primary" href={WA_QUOTE} target="_blank" rel="noopener noreferrer">Hablemos por WhatsApp</a>
            </div>
            <img className="v2-about-photo" src={medSrc(ABOUT_PHOTOS[1])} alt="Mochila de cuero marrón en la espalda" loading="lazy" decoding="async" />
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="v2-section v2-faq">
          <h2 className="v2-h2">Preguntas frecuentes</h2>
          <dl className="v2-faq-grid">
            {FAQS.map(([q, a]) => (<div key={q}><dt>{q}</dt><dd>{a}</dd></div>))}
          </dl>
        </section>

        {/* ===== CIERRE (banda cognac) ===== */}
        <section className="v2-close-band">
          <h2 className="v2-close-title">¿Arrancamos con una muestra?</h2>
          <p>Contanos qué producto y cuántas unidades. Te respondemos con una propuesta cerrada.</p>
          <a className="v2-btn v2-btn-light" href={WA_QUOTE} target="_blank" rel="noopener noreferrer">Pedí tu cotización</a>
        </section>
      </main>

      <Footer onContactSubmit={handleContactSubmit} />
    </div>
  );
}

export default LandingV2;
