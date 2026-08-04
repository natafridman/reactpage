import { useState, useRef, useLayoutEffect } from 'react';
import { thumbSrc, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

// Resuelve la foto del featured: un producto puntual {cat, folder} o, si no se
// da folder, el primer producto con imagen de esa categoria. Sale del indice.
function featImage(index, feat) {
  if (!index || !feat || !feat.cat) return null;
  const items = index[feat.cat] || [];
  const it = feat.folder
    ? items.find((p) => p.productFolder === feat.folder)
    : items.find((p) => ((p.metadata && p.metadata.images) || p.availableImages || []).length);
  const imgs = it ? ((it.metadata && it.metadata.images) || it.availableImages || []) : [];
  if (!it || !imgs.length) return null;
  return thumbSrc(`/${IMAGES_BASE_FOLDER}/${feat.cat}/${it.productFolder}/${imgs[0]}`);
}

// Nav de escritorio: barra de tabs centrada, cada una abre un dropdown que se
// desliza. Una flechita ("nub") apunta al tab activo y el contenido entra desde
// el lado del que venís. Adaptado del patron ShiftingDropDown, con los colores y
// tipografia de B2YOU y sin framer-motion (las animaciones van por CSS).
//
// Las 16 categorias no entran sueltas, asi que se agrupan en pocos tabs. Cada
// item {cat,sub} entra a una categoria (con subcategoria opcional ya filtrada);
// {path} navega a una pagina.

function buildTabs(categories) {
  const has = (c) => categories.includes(c);
  const keep = (items) => items.filter((it) => it.path || has(it.cat));
  const cols = (arr) => arr.map((c) => ({ ...c, items: keep(c.items) })).filter((c) => c.items.length);
  const tabs = [];

  const marro = cols([
    { h: 'Bolsos', items: [
      { label: 'Bolsos', cat: 'Bolsos' },
      { label: 'Mochilas', cat: 'Mochilas' },
      { label: 'Morrales', cat: 'Morrales' },
      { label: 'Maletines', cat: 'Maletines' },
    ] },
    { h: 'Carteras', items: [
      { label: 'Carteras', cat: 'Carteras' },
      { label: 'Riñoneras', cat: 'Riñoneras' },
      { label: 'Billeteras', cat: 'Billeteras' },
    ] },
    { h: 'Accesorios', items: [
      { label: 'Necessaires', cat: 'Necessaries' },
      { label: 'Portadocumentos', cat: 'Portadocumentos' },
      { label: 'Portacelular', cat: 'Portacelular' },
      { label: 'Bufandas', cat: 'Bufandas' },
      { label: 'Mundial', cat: 'Mundial', mundial: true },
    ] },
  ]);
  if (marro.length) tabs.push({ id: 1, title: 'Catálogo', cols: marro, feat: { cat: 'Bolsos', folder: 'Bolso Duffle' }, all: { path: '/productos', label: 'Ver todo el catálogo' } });

  if (has('Cinturones')) {
    tabs.push({
      id: 2, title: 'Cinturones', feat: { cat: 'Cinturones' },
      all: { cat: 'Cinturones', label: 'Ver todos los cinturones' },
      cols: [{ h: 'Por género', items: [
        { label: 'Ver todos', cat: 'Cinturones' },
        { label: 'Hombre', cat: 'Cinturones', sub: 'hombre' },
        { label: 'Mujer', cat: 'Cinturones', sub: 'mujer' },
      ] }],
    });
  }

  if (has('Indumentaria de Trabajo') || has('Calzado')) {
    const ind = has('Indumentaria de Trabajo');
    const c = cols([
      { h: 'Indumentaria', items: ind ? [
        { label: 'Camisas', cat: 'Indumentaria de Trabajo', sub: 'camisas' },
        { label: 'Remeras y Chombas', cat: 'Indumentaria de Trabajo', sub: 'remeras-chombas' },
        { label: 'Pantalones', cat: 'Indumentaria de Trabajo', sub: 'pantalones' },
        { label: 'Bombachas y Bermudas', cat: 'Indumentaria de Trabajo', sub: 'bombachas-bermudas' },
      ] : [] },
      { h: 'Abrigo', items: ind ? [
        { label: 'Camperas', cat: 'Indumentaria de Trabajo', sub: 'camperas' },
        { label: 'Buzos', cat: 'Indumentaria de Trabajo', sub: 'buzos' },
        { label: 'Mameluco', cat: 'Indumentaria de Trabajo', sub: 'mameluco' },
      ] : [] },
      { h: 'También', items: [
        ...(ind ? [{ label: 'Varios', cat: 'Indumentaria de Trabajo', sub: 'varios' }] : []),
        { label: 'Calzado', cat: 'Calzado' },
      ] },
    ]);
    tabs.push({
      id: 3, title: 'Ropa de Trabajo', cols: c,
      feat: ind ? { cat: 'Indumentaria de Trabajo', folder: 'Campera Gabardina Antiestatica 2010' } : { cat: 'Calzado' },
      all: ind ? { cat: 'Indumentaria de Trabajo', label: 'Ver toda la indumentaria' } : { cat: 'Calzado', label: 'Ver el calzado' },
    });
  }

  tabs.push({
    id: 4, title: 'Para marcas',
    brand: [
      { label: 'Empresas', path: '/Empresas', desc: 'Uniformes y regalería con tu logo', src: '/images/menu/empresas.jpg' },
      { label: 'Marcas', path: '/Marcas', desc: 'Productos para potenciar tu marca', src: '/images/menu/marcas.jpg' },
      { label: 'Nosotros', path: '/Nosotros', desc: 'Quiénes somos y cómo trabajamos', logo: true },
    ],
  });

  return tabs;
}

const hrefFor = (it) => it.path || `?categoria=${encodeURIComponent(it.cat)}${it.sub ? `&sub=${encodeURIComponent(it.sub)}` : ''}`;
const LOGO = '/images/Branding/B2 B2YOU Header Landscape 2.png';

function ShiftingNav({ categories, index, onOpen, onCat, onNav }) {
  const tabs = buildTabs(categories);
  const [selected, setSelected] = useState(null);
  const [dir, setDir] = useState(null);
  const [nubLeft, setNubLeft] = useState(0);
  const panelRef = useRef(null);
  const opened = useRef(false);
  const closeTimer = useRef(null);

  const cancelClose = () => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } };
  // Cierre con retardo: al salir, esperar un toque antes de cerrar. Si el mouse
  // vuelve al tab o al panel (cruzando el hueco/triangulo), se cancela y NO se
  // cierra. Es lo que evita que se cierre sola al bajar en diagonal al panel.
  const scheduleClose = () => { cancelClose(); closeTimer.current = setTimeout(() => { setSelected(null); setDir(null); }, 180); };

  const set = (val) => {
    cancelClose();
    if (typeof selected === 'number' && typeof val === 'number') setDir(selected > val ? 'r' : 'l');
    else if (val === null) setDir(null);
    if (val && !opened.current) { opened.current = true; onOpen && onOpen(); }
    setSelected(val);
  };

  // Posicion del nub: centro del tab activo, relativo al panel. useLayoutEffect
  // para ubicarlo antes de pintar (no "salta" desde la izquierda al abrir).
  useLayoutEffect(() => {
    if (!selected) return;
    const tab = document.getElementById(`snav-tab-${selected}`);
    const panel = panelRef.current;
    if (!tab || !panel) return;
    const tr = tab.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    setNubLeft(tr.left + tr.width / 2 - pr.left);
  }, [selected]);

  const active = tabs.find((t) => t.id === selected);

  const go = (e, it) => {
    if (!it) return;
    if (it.path) { e.preventDefault(); onNav && onNav(it.path); }
    else if (it.cat) { onCat && onCat(e, it.cat, it.sub); }
    else if (it.label) { /* solo Ver todo sin destino */ e.preventDefault(); onNav && onNav('/productos'); }
    cancelClose();
    setSelected(null);
  };

  return (
    <div className="snav" onMouseLeave={scheduleClose} onMouseEnter={cancelClose}>
      <div className="snav-tabs" role="menubar">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`snav-tab-${t.id}`}
            className={`snav-tab${selected === t.id ? ' is-open' : ''}`}
            onMouseEnter={() => set(t.id)}
            onFocus={() => set(t.id)}
            onClick={() => set(selected === t.id ? null : t.id)}
            aria-expanded={selected === t.id}
          >
            <span>{t.title}</span>
            <svg className="snav-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        ))}
      </div>

      {active && (
        <div className="snav-panel" ref={panelRef} role="menu">
          <span className="snav-bridge" aria-hidden="true" />
          <span className="snav-nub" style={{ left: nubLeft }} aria-hidden="true" />

          <div className="snav-content" key={selected} data-dir={dir || 'c'}>
            {active.brand ? (
              <div className="snav-cards">
                {active.brand.map((b) => {
                  const src = b.logo ? LOGO : (b.src || featImage(index, b.img));
                  return (
                    <a key={b.label} href={b.path} className={`snav-card${b.logo ? ' snav-card--logo' : ''}`} onClick={(e) => go(e, b)}>
                      <span className="snav-card-media">
                        {src ? <img src={src} alt="" loading="lazy" decoding="async" /> : <span className="snav-feat-ph" />}
                      </span>
                      <span className="snav-card-name accent">{b.label}</span>
                      <span className="snav-card-desc">{b.desc}</span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="snav-dd">
                <div className="snav-cols">
                  {active.cols.map((col) => (
                    <div className="snav-col" key={col.h}>
                      <span className="snav-col-h accent">{col.h}</span>
                      {col.items.map((it) => (
                        <a
                          key={it.label}
                          href={hrefFor(it)}
                          className={`snav-link${it.mundial ? ' snav-link--mundial' : ''}`}
                          onClick={(e) => go(e, it)}
                        >
                          {it.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>

                {active.feat && (
                  <a className="snav-feat" href={hrefFor(active.all)} onClick={(e) => go(e, active.all)}>
                    <span className="snav-feat-media">
                      {featImage(index, active.feat)
                        ? <img src={featImage(index, active.feat)} alt="" loading="lazy" decoding="async" />
                        : <span className="snav-feat-ph" />}
                    </span>
                    <span className="snav-feat-cta">{active.all?.label || 'Ver todo'} <span aria-hidden="true">→</span></span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ShiftingNav;
