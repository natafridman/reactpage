import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaginaV2, { Cierre, waLink } from '/components/PaginaV2.jsx';

// Merchandising para empresas. Una sola intencion de contacto en toda la pagina
// ("Pedí tu cotización"), un solo eyebrow (el del hero) y cada seccion con una
// composicion distinta: split, fila de categorias, grilla de kits, mosaico,
// texto a dos columnas. Fotos generadas a partir del producto real, con el logo
// grabado por codigo.
const M = (nombre, w = 700) => `/images/merch/${nombre}-${w}.webp`;
const WA = 'Hola B2YOU, queremos cotizar merchandising con nuestro logo.';
const waKit = (kit) => `Hola B2YOU, queremos cotizar el kit ${kit} con nuestro logo.`;

const CATEGORIAS = [
  { cat: 'Botellas', titulo: 'Botellas', foto: 'botellas', alto: 'Botellas con el logo grabado' },
  { cat: 'Vasos y Jarros', titulo: 'Vasos y jarros', foto: 'mugs-metalicos', alto: 'Vasos térmicos de acero con el logo grabado' },
  { cat: 'Oficina', titulo: 'Oficina', foto: 'cat-oficina', alto: 'Bolígrafos con el logo grabado' },
  { cat: 'Tecnología', titulo: 'Tecnología', foto: 'cat-tecnologia', alto: 'Parlantes bluetooth con el logo' },
];

// Contenido verificado contra la ficha de cada producto.
const KITS = [
  ['k01', 'Eco Welcome Desk', 'Oficina', 'Cuaderno de tapa de cartón, bolígrafo ecológico y tote de yute.'],
  ['k02', 'Daily Drink & Note', 'Oficina', 'Botella de aluminio, cuaderno con elástico, bolígrafo y bolsa.'],
  ['k03', 'Coffee & Desk', 'Oficina', 'Jarro con tapa, soporte de bambú, llavero destapador y tote de algodón.'],
  ['k04', 'Tech & Work', 'Oficina', 'Mochila porta notebook, botella de aluminio, mouse pad de corcho y bolígrafo.'],
  ['k05', 'Sabor & Tradición', 'Mate', 'Termo de acero de 1 L, mate térmico con bombilla, yerbera y matera.'],
  ['k06', 'Executive VIP', 'Viaje', 'Mochila de viaje, botella térmica y cuaderno de tapa dura.'],
  ['k07', 'Outdoor Trekking', 'Aire libre', 'Piluso, botella de aluminio, linterna y mochila de cordón.'],
  ['k08', 'Camp & Adventure', 'Aire libre', 'Mochila urbana, manta impermeable, jarro enlozado y multiherramienta.'],
  ['k09', 'Wild Executive', 'Aire libre', 'Silla de camping, conservadora, botella térmica, gorro y set de asado.'],
  ['k10', 'Gym Express', 'Deporte', 'Botella deportiva con toalla, riñonera y mochila de cordón.'],
  ['k11', 'Active Athlete', 'Deporte', 'Bolso deportivo, toallón de microfibra, botella y soga de saltar.'],
  ['k12', 'Pro Performance', 'Deporte', 'Bolso deportivo grande, botella térmica, toallón y auriculares.'],
];

// Mosaico: 6 fotos, 6 celdas (dos anchas y cuatro verticales), sin texto encima.
const MOSAICO = [
  { foto: 'w-termos', ancha: true, alto: 'Termos con el logo grabado en el campo, junto a un mate' },
  { foto: 'g-mates', alto: 'Mates de plástico con el logo, con yerba y bombilla' },
  { foto: 'g-cuaderno', alto: 'Cuadernos A5 con el logo en la tapa' },
  { foto: 'g-auriculares', alto: 'Estuches de auriculares con el logo sobre un escritorio' },
  { foto: 'g-portatarjetas', alto: 'Porta tarjetas con el logo pegados atrás de celulares' },
  { foto: 'w-llaveros', ancha: true, alto: 'Llaveros destapadores con el logo colgados de ganchos' },
];

const COMO = [
  ['Muestra antes de producir', 'Te mostramos cómo queda cada pieza con tu logo. Producimos recién cuando la aprobás.'],
  ['Sin mínimo fijo', 'Adecuamos el volumen a cada empresa, sea un equipo chico o toda la nómina.'],
  ['Kits a medida', 'Cada kit es un punto de partida. Sumamos, cambiamos o sacamos piezas.'],
  ['Tu logo, según el material', 'Grabado láser en metal y cuero, estampado en tela y plástico, bordado en textiles.'],
  ['De 15 a 30 días hábiles', 'Desde que aprobás la muestra. Los pedidos grandes pueden llevar más.'],
  ['Envíos a todo el país', 'Los kits llegan armados y listos para repartir.'],
];

function MerchandisingPage() {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const verCategoria = (e, cat) => { e.preventDefault(); navigate(`/productos?categoria=${encodeURIComponent(cat)}`); };
  const irKits = (e) => { e.preventDefault(); document.getElementById('kits')?.scrollIntoView({ behavior: 'smooth' }); };

  // /Merchandising#kits desde el menu o la landing: bajar a los kits al entrar.
  useEffect(() => {
    if (hash !== '#kits') return;
    const t = setTimeout(() => document.getElementById('kits')?.scrollIntoView(), 120);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <PaginaV2 titulo="B2YOU - Merchandising y kits para empresas">
      <section className="mch-hero">
        <div className="mch-hero-copy">
          <span className="mch-eyebrow">Merchandising para empresas</span>
          <h1 className="mch-h1">Merch que tu equipo <em>usa todos los días</em>.</h1>
          <p className="mch-lead">Botellas, vasos, oficina, tecnología y kits armados, con tu logo en cada pieza.</p>
          <div className="mch-ctas">
            <a className="v2-btn v2-btn-primary" href="#kits" onClick={irKits}>Ver los kits</a>
            <a className="mch-link" href={waLink(WA)} target="_blank" rel="noopener noreferrer">Pedí tu cotización <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="mch-hero-media">
          <img src={M('kit-k05', 1200)} srcSet={`${M('kit-k05')} 700w, ${M('kit-k05', 1200)} 1200w`} sizes="(max-width: 900px) 100vw, 46vw" alt="Kit matero con termo, mate, yerbera y matera con el logo grabado" fetchpriority="high" decoding="async" />
        </div>
      </section>

      <section className="mch-sec mch-cats" aria-label="Categorías">
        {CATEGORIAS.map((c) => (
          <a key={c.cat} className="mch-cat" href={`/productos?categoria=${encodeURIComponent(c.cat)}`} onClick={(e) => verCategoria(e, c.cat)}>
            <span className="mch-cat-media">
              <img src={M(c.foto)} srcSet={`${M(c.foto)} 700w, ${M(c.foto, 1200)} 1200w`} sizes="(max-width: 640px) 50vw, 25vw" alt={c.alto} loading="lazy" decoding="async" />
            </span>
            <span className="mch-cat-name">{c.titulo} <span aria-hidden="true">→</span></span>
          </a>
        ))}
      </section>

      <section className="mch-sec mch-kits" id="kits">
        <h2 className="mch-h2">Doce kits listos <em>para regalar</em>.</h2>
        <p className="mch-sub">Elegí uno y lo armamos con tu logo, o lo ajustamos a tu equipo.</p>
        <div className="mch-kits-grid">
          {KITS.map(([k, nombre, uso, incluye]) => (
            <a className="mch-kit" key={k} href={waLink(waKit(nombre))} target="_blank" rel="noopener noreferrer" aria-label={`Cotizar el kit ${nombre}`}>
              <span className="mch-kit-media">
                <img src={M('kit-' + k)} srcSet={`${M('kit-' + k)} 700w, ${M('kit-' + k, 1200)} 1200w`} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" alt={`Kit ${nombre} con el logo grabado`} loading="lazy" decoding="async" />
              </span>
              <span className="mch-kit-uso">{uso}</span>
              <span className="mch-kit-nombre">{nombre}</span>
              <span className="mch-kit-incluye">{incluye}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="mch-sec mch-mosaico-sec">
        <h2 className="mch-h2">Así queda <em>con tu logo</em>.</h2>
        <div className="mch-mosaico">
          {MOSAICO.map((m) => (
            <img key={m.foto} className={m.ancha ? 'is-ancha' : undefined} src={m.ancha ? `/images/merch/${m.foto}-1600.webp` : M(m.foto, 1200)} alt={m.alto} loading="lazy" decoding="async" />
          ))}
        </div>
      </section>

      <section className="mch-sec mch-como">
        <h2 className="mch-h2">Del logo al regalo, <em>sin vueltas</em>.</h2>
        <dl>
          {COMO.map(([t, d]) => (<div key={t}><dt>{t}</dt><dd>{d}</dd></div>))}
        </dl>
      </section>

      <Cierre
        titulo="Armemos el regalo de tu empresa"
        texto="Elegí un kit o contanos qué tenés en mente. Te mostramos cómo queda con tu logo antes de producir."
        textoWa={WA}
        boton="Pedí tu cotización"
      />
    </PaginaV2>
  );
}

export default MerchandisingPage;
