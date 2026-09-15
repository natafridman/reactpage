import { useNavigate } from 'react-router-dom';
import ClientLogos from '/components/ClientLogos.jsx';
import PaginaV2, { HeroPagina, Pasos, Ficha, Preguntas, Cierre, Icono, waLink } from '/components/PaginaV2.jsx';
import { medSrc, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

const IMG = (cat, folder, file) => `/${IMAGES_BASE_FOLDER}/${cat}/${folder}/${file}`;
const WA = 'Hola B2YOU, somos una empresa y queremos cotizar productos con nuestro logo.';

// Lo que mas se pide para regalo corporativo. Cada uno entra a su categoria.
const REGALOS = [
  { cat: 'Billeteras', titulo: 'Billeteras', foto: IMG('Billeteras', 'Billetera Roma', 'ROMA(1).jpeg') },
  { cat: 'Maletines', titulo: 'Maletines', foto: IMG('Maletines', 'Maletin Ejecutivo', 'IMG_1571.jpeg') },
  { cat: 'Gorras', titulo: 'Gorras', foto: IMG('Gorras', 'Gorra Casual', 'IMG_4567.jpeg') },
  { cat: 'Necessaries', titulo: 'Neceseres', foto: IMG('Necessaries', 'Necessaire Lisboa', 'LISBOA_vfirst.jpeg') },
];

const VENTAJAS = [
  { icono: 'logo', titulo: 'Tu logo en el producto', texto: 'Grabado, estampado o bordado.' },
  { icono: 'equipo', titulo: 'Se usa, no se guarda', texto: 'Objetos de todos los días.' },
  { icono: 'volumen', titulo: 'Presupuesto cerrado', texto: 'Sin sorpresas al final.' },
  { icono: 'envio', titulo: 'Entrega en tu oficina', texto: 'Coordinamos día y punto.' },
];

const PASOS = [
  { titulo: 'Contanos qué necesitás', texto: 'Producto, cantidad y fecha.', foto: '/images/proceso/empresas-1.webp', alto: 'Sellos de bronce con logos en la mano' },
  { titulo: 'Te pasamos la propuesta', texto: 'Materiales, personalización y precio cerrado.', foto: '/images/proceso/empresas-2.webp', alto: 'Prensa grabando el logo sobre el cuero' },
  { titulo: 'Aprobás la muestra', texto: 'Con tu logo puesto, antes de producir.', foto: '/images/proceso/empresas-3.webp', alto: 'Manos terminando una pieza de cuero' },
  { titulo: 'Lo llevamos a tu oficina', texto: 'Y a todo el país.', foto: '/images/proceso/empresas-4.webp', alto: 'Manos cerrando una caja con cinta' },
];

const FICHA = [
  ['Volumen', 'Adecuado al cliente'],
  ['Producción', '15 a 30 días hábiles'],
  ['Personalización', 'Logo, grabado, etiquetas'],
  ['Muestras', 'Disponibles con costo'],
];

const PREGUNTAS = [
  ['¿Cuántas unidades tengo que pedir?', 'No hay mínimo fijo. Escribinos con la cantidad que tenés en mente y te armamos la propuesta.'],
  ['¿Cuánto tarda?', 'De 15 a 30 días hábiles desde que aprobás la muestra.'],
  ['¿Puedo ver una muestra antes?', 'Sí, y lo recomendamos. Tiene un costo que se descuenta del pedido.'],
  ['¿Entregan en la oficina?', 'Sí, y hacemos envíos a todo el país.'],
];

function EmpresasPage() {
  const navigate = useNavigate();
  const verCatalogo = (e) => { e.preventDefault(); navigate('/productos'); };
  const verCategoria = (e, cat) => { e.preventDefault(); navigate(`/productos?categoria=${encodeURIComponent(cat)}`); };
  const botonWa = (texto) => (
    <a className="v2-btn v2-btn-primary" href={waLink(WA)} target="_blank" rel="noopener noreferrer">{texto}</a>
  );

  return (
    <PaginaV2 titulo="B2YOU - Empresas">
      <HeroPagina
        base="hero-empresas"
        alto="Maletín de cuero negro apoyado en una oficina"
        eyebrow="Para empresas"
        titulo={<>Un regalo con tu logo que <em>se sigue usando</em> en marzo.</>}
        bajada="Billeteras, maletines, gorras y neceseres de cuero, con la identidad de tu empresa. Producidos en Buenos Aires."
        acciones={<>
          <a className="v2-btn v2-btn-light" href={waLink(WA)} target="_blank" rel="noopener noreferrer">Pedí tu cotización</a>
          <a className="v2-btn v2-btn-outline-light" href="/productos" onClick={verCatalogo}>Ver el catálogo</a>
        </>}
      />

      <section className="v2-benefits">
        <div className="v2-benefits-inner v2-benefits-inner--4">
          {VENTAJAS.map((v) => (
            <div className="v2-benefit" key={v.titulo}>
              <Icono name={v.icono} />
              <div>
                <span className="v2-benefit-title">{v.titulo}</span>
                <span className="v2-benefit-text">{v.texto}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="v2-section">
        <div className="v2-section-head">
          <h2 className="v2-h2">Lo que más se regala</h2>
          <a className="v2-link" href="/productos" onClick={verCatalogo}>Ver todo el catálogo</a>
        </div>
        <div className="v2-banners v2-banners--4">
          {REGALOS.map((b) => (
            <a key={b.cat} className="v2-banner" href={`/productos?categoria=${encodeURIComponent(b.cat)}`} onClick={(e) => verCategoria(e, b.cat)}>
              <span className="v2-banner-media">
                <img src={medSrc(b.foto)} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="v2-banner-body">
                <span className="v2-banner-title">{b.titulo}</span>
                <span className="v2-banner-cta">Ver más <span aria-hidden="true">→</span></span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <Pasos titulo="Cómo trabajamos" pasos={PASOS} cta={botonWa('Pedí tu cotización')} />
      <Ficha datos={FICHA} cta={botonWa('Contanos qué necesitás')} />
      <ClientLogos />
      <Preguntas items={PREGUNTAS} />

      <Cierre
        titulo="Empecemos por una muestra"
        texto="Contanos qué producto y cuántas unidades. Te respondemos con una propuesta cerrada."
        textoWa={WA}
        boton="Pedí tu cotización"
      />
    </PaginaV2>
  );
}

export default EmpresasPage;
