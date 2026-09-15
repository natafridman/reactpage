import { useState, useRef, useLayoutEffect } from 'react';
import { thumbSrc, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

// Resuelve la foto de una categoria: un producto puntual {cat, folder} o, si no
// se da folder, el primer producto con imagen de esa categoria. Sale del indice.
export function featImage(index, feat) {
  if (!index || !feat || !feat.cat) return null;
  const items = index[feat.cat] || [];
  const it = feat.folder
    ? items.find((p) => p.productFolder === feat.folder)
    : items.find((p) => ((p.metadata && p.metadata.images) || p.availableImages || []).length);
  const imgs = it ? ((it.metadata && it.metadata.images) || it.availableImages || []) : [];
  if (!it || !imgs.length) return null;
  return thumbSrc(`/${IMAGES_BASE_FOLDER}/${feat.cat}/${it.productFolder}/${imgs[0]}`);
}

// Nav de escritorio. Dos entradas y nada mas: todo lo que se vende esta dentro
// de "Productos", y "Para marcas" es lo que no es catalogo.
//
// Antes habia cuatro tabs (Catálogo, Cinturones, Ropa de Trabajo, Para marcas):
// tres puertas distintas al mismo catalogo, y el visitante tenia que adivinar
// cual. Ahora el panel de Productos abre con los cuatro destacados en foto y
// debajo el catalogo entero agrupado, asi que no hay nada escondido en otro tab.
//
// Cada item {cat,sub} entra a una categoria (con subcategoria ya filtrada);
// {path} navega a una pagina.

// Los cuatro que van con foto, en orden. Donde hace falta se elige el producto
// a mano: las cuatro fotos tienen que ser del mismo tipo (producto sobre fondo
// claro) o el bloque queda con dos fotos de estudio y dos de ambiente.
export const DESTACADOS = [
  { label: 'Cinturones', cat: 'Cinturones' },
  { label: 'Gorras', cat: 'Gorras' },
  { label: 'Bolsos', cat: 'Bolsos', folder: 'Bolso Mujer 1' },
  { label: 'Carteras', cat: 'Carteras' },
];

function buildTabs(categories) {
  const has = (c) => categories.includes(c);
  const keep = (items) => items.filter((it) => it.path || has(it.cat));
  const cols = (arr) => arr.map((c) => ({ ...c, items: keep(c.items) })).filter((c) => c.items.length);
  const tabs = [];

  const ind = has('Indumentaria de Trabajo');
  const grupos = cols([
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
      { label: 'Necessaires', cat: 'Necessaries' },
    ] },
    { h: 'Accesorios', items: [
      { label: 'Gorras', cat: 'Gorras' },
      { label: 'Cinturones de hombre', cat: 'Cinturones', sub: 'hombre' },
      { label: 'Cinturones de mujer', cat: 'Cinturones', sub: 'mujer' },
      { label: 'Portadocumentos', cat: 'Portadocumentos' },
      { label: 'Portacelular', cat: 'Portacelular' },
      { label: 'Bufandas', cat: 'Bufandas' },
    ] },
    { h: 'Ropa de trabajo', items: [
      ...(ind ? [
        { label: 'Camisas', cat: 'Indumentaria de Trabajo', sub: 'camisas' },
        { label: 'Remeras y chombas', cat: 'Indumentaria de Trabajo', sub: 'remeras-chombas' },
        { label: 'Pantalones', cat: 'Indumentaria de Trabajo', sub: 'pantalones' },
        { label: 'Camperas y buzos', cat: 'Indumentaria de Trabajo', sub: 'camperas' },
        { label: 'Ver toda la indumentaria', cat: 'Indumentaria de Trabajo' },
      ] : []),
      { label: 'Calzado', cat: 'Calzado' },
    ] },
  ]);

  // Cualquier categoria que no entre en los grupos de arriba igual tiene que
  // aparecer: si mañana se suma una, no queda fuera del menu sin que se note.
  const listadas = new Set(grupos.flatMap((c) => c.items.map((it) => it.cat)));
  const sueltas = categories.filter((c) => !listadas.has(c)).map((c) => ({ label: c, cat: c }));
  if (sueltas.length) grupos.push({ h: 'Más', items: sueltas });

  tabs.push({
    id: 1,
    title: 'Productos',
    dest: DESTACADOS.filter((d) => has(d.cat)),
    cols: grupos,
    all: { path: '/productos', label: 'Ver todo el catálogo' },
  });

  tabs.push({
    id: 2, title: 'Para marcas',
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
            onClick={(e) => { if (t.all) go(e, t.all); else set(selected === t.id ? null : t.id); }}
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
              <div className="snav-prod">
                {/* Los cuatro destacados, con foto: es lo primero que se ve. */}
                <div className="snav-dest">
                  {active.dest.map((d) => {
                    const src = featImage(index, d);
                    return (
                      <a key={d.cat} href={hrefFor(d)} className="snav-dest-item" onClick={(e) => go(e, d)}>
                        <span className="snav-dest-media">
                          {src ? <img src={src} alt="" loading="lazy" decoding="async" /> : <span className="snav-feat-ph" />}
                        </span>
                        <span className="snav-dest-name">{d.label}</span>
                      </a>
                    );
                  })}
                </div>

                {/* Y debajo, el catalogo completo agrupado. */}
                <div className="snav-cols">
                  {active.cols.map((col) => (
                    <div className="snav-col" key={col.h}>
                      <span className="snav-col-h accent">{col.h}</span>
                      {col.items.map((it) => (
                        <a
                          key={it.label}
                          href={hrefFor(it)}
                          className="snav-link"
                          onClick={(e) => go(e, it)}
                        >
                          {it.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>

                <a className="snav-all" href={hrefFor(active.all)} onClick={(e) => go(e, active.all)}>
                  {active.all.label} <span aria-hidden="true">→</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ShiftingNav;
