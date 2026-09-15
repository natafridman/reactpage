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
  { icono: 'logo', titulo: 'Tu logo, en el producto', texto: 'Grabado láser, estampado o bordado, según el material.' },
  { icono: 'equipo', titulo: 'Para tu equipo y tus clientes', texto: 'Productos que se usan todos los días, no que quedan en un cajón.' },
  { icono: 'volumen', titulo: 'Pedidos por volumen', texto: 'Presupuesto cerrado y entrega coordinada en tu oficina.' },
  { icono: 'cuero', titulo: 'Hecho para durar', texto: 'Materiales seleccionados y costuras reforzadas, de nuestro taller.' },
];

const PASOS = [
  ['Nos contás qué necesitás', 'Producto, cantidad, fecha estimada y cualquier referencia de diseño o logo.'],
  ['Te mandamos una propuesta', 'Con opciones de materiales, técnicas de personalización y presupuesto detallado.'],
  ['Aprobás la muestra', 'Hacemos una muestra con tu marca. Recién cuando la aprobás arranca la producción.'],
  ['Entrega coordinada', 'Llevamos el pedido a tu oficina o al punto que nos digas.'],
];

const FICHA = [
  ['Volumen', 'Adecuado al cliente'],
  ['Producción', '15 a 30 días hábiles'],
  ['Personalización', 'Logo, grabado, etiquetas'],
  ['Muestras', 'Disponibles con costo'],
];

const PREGUNTAS = [
  ['¿Cuál es el volumen de pedido?', 'No manejamos un mínimo fijo: adecuamos el volumen a cada cliente. Escribinos y armamos una propuesta a tu medida.'],
  ['¿Cuánto tarda la producción?', 'De 15 a 30 días hábiles desde la aprobación de la muestra. Pedidos grandes pueden requerir más tiempo.'],
  ['¿Puedo pedir muestras antes?', 'Sí, siempre lo recomendamos. Las muestras tienen un costo que se descuenta del pedido final una vez confirmado.'],
  ['¿Entregan en la oficina?', 'Sí. Coordinamos la entrega en el punto que nos indiques, y hacemos envíos a todo el país.'],
];

function EmpresasPage() {
  const navigate = useNavigate();
  const verCatalogo = (e) => { e.preventDefault(); navigate('/productos'); };
  const verCategoria = (e, cat) => { e.preventDefault(); navigate(`/productos?categoria=${encodeURIComponent(cat)}`); };

  return (
    <PaginaV2 titulo="B2YOU - Empresas">
      <HeroPagina
        base="hero-empresas"
        alto="Maletín de cuero negro apoyado en una oficina"
        eyebrow="Para empresas"
        titulo={<>Un regalo con tu logo que <em>se sigue usando</em> en marzo.</>}
        bajada="Billeteras, maletines, gorras y neceseres de cuero para tu equipo, tus clientes y tus socios. Producidos en Buenos Aires con la identidad de tu empresa."
        acciones={<>
          <a className="v2-btn v2-btn-light" href="/productos" onClick={verCatalogo}>Ver el catálogo</a>
          <a className="v2-btn v2-btn-outline-light" href={waLink(WA)} target="_blank" rel="noopener noreferrer">Pedí tu cotización</a>
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

      <Pasos titulo="Cómo trabajamos" pasos={PASOS} />
      <Ficha datos={FICHA} />
      <ClientLogos />
      <Preguntas items={PREGUNTAS} />

      <Cierre
        titulo="¿Arrancamos con una muestra?"
        texto="Contanos qué producto y cuántas unidades. Te respondemos con una propuesta cerrada."
        textoWa={WA}
      />
    </PaginaV2>
  );
}

export default EmpresasPage;
