import { useNavigate } from 'react-router-dom';
import ClientLogos from '/components/ClientLogos.jsx';
import PaginaV2, { HeroPagina, Pasos, Ficha, Preguntas, Cierre, Icono, waLink } from '/components/PaginaV2.jsx';
import { medSrc, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

const IMG = (cat, folder, file) => `/${IMAGES_BASE_FOLDER}/${cat}/${folder}/${file}`;
const WA = 'Hola B2YOU, tengo una marca y quiero cotizar una producción con mi etiqueta.';

// Las cuatro lineas mas pedidas por marcas. Cada una entra a su categoria.
const LINEAS = [
  { cat: 'Carteras', titulo: 'Carteras', foto: IMG('Carteras', 'Cartera Eco Hobo U71002-Y71006', '01.jpg'), pos: '50% 35%' },
  { cat: 'Bolsos', titulo: 'Bolsos', foto: IMG('Bolsos', 'Bolso Duffle', 'G28A0280.jpeg'), pos: '50% 50%' },
  { cat: 'Mochilas', titulo: 'Mochilas', foto: IMG('Mochilas', 'Mochila London', 'LONDON(1).jpeg'), pos: '50% 50%' },
  { cat: 'Cinturones', titulo: 'Cinturones', foto: IMG('Cinturones', 'Cinturon Oval Negro', 'FARO(6).jpg'), pos: '50% 62%' },
];

const VENTAJAS = [
  { icono: 'etiqueta', titulo: 'Marca blanca', texto: 'Fabricamos con tu etiqueta. El producto es de tu marca de punta a punta.' },
  { icono: 'volumen', titulo: 'Producción escalable', texto: 'Desde tiradas chicas hasta grandes volúmenes, con la misma terminación.' },
  { icono: 'logo', titulo: 'Tu identidad en cada pieza', texto: 'Grabado láser, estampado, bordado y etiquetas propias.' },
  { icono: 'tilde', titulo: 'Trabajo codo a codo', texto: 'Definimos diseño, materiales y fechas con tu equipo, y aprobás la muestra.' },
];

const PASOS = [
  ['Nos contás qué necesitás', 'Producto, cantidad, la estética de tu marca y cualquier referencia de diseño.'],
  ['Te mandamos una propuesta', 'Con opciones de materiales, terminaciones y presupuesto detallado.'],
  ['Aprobás la muestra', 'Hacemos una muestra con tu branding. Recién cuando la aprobás arranca la producción.'],
  ['Entrega o despacho', 'Coordinamos según tu operación, con envíos a todo el país.'],
];

const FICHA = [
  ['Volumen', 'Adecuado al cliente'],
  ['Producción', '15 a 30 días hábiles'],
  ['Marca blanca', 'Tu logo y tus etiquetas'],
  ['Muestras', 'Disponibles con costo'],
];

const PREGUNTAS = [
  ['¿Puedo vender los productos con mi marca?', 'Sí, para eso trabajamos. Producimos con tu etiqueta y tu logo, sin ninguna referencia a nosotros en el producto.'],
  ['¿Cuál es el volumen de pedido?', 'No manejamos un mínimo fijo: adecuamos el volumen a cada cliente. Escribinos y armamos una propuesta a tu medida.'],
  ['¿Cuánto tarda la producción?', 'De 15 a 30 días hábiles desde la aprobación de la muestra. Pedidos grandes pueden requerir más tiempo.'],
  ['¿Qué técnicas de personalización ofrecen?', 'Grabado láser, estampado en calor, bordado computarizado y etiquetas personalizadas, según el material.'],
];

function MarcasPage() {
  const navigate = useNavigate();
  const verCatalogo = (e) => { e.preventDefault(); navigate('/productos'); };
  const verCategoria = (e, cat) => { e.preventDefault(); navigate(`/productos?categoria=${encodeURIComponent(cat)}`); };

  return (
    <PaginaV2 titulo="B2YOU - Marcas">
      <HeroPagina
        base="hero-marcas"
        alto="Billeteras de cuero natural sobre una mesa de madera"
        eyebrow="Para marcas"
        titulo={<>Tu etiqueta, nuestra <em>fábrica</em>.</>}
        bajada="Producimos accesorios de cuero con tu marca, de la muestra a la entrega. Vos ponés la identidad, nosotros el taller."
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
          <h2 className="v2-h2">Lo que fabricamos</h2>
          <a className="v2-link" href="/productos" onClick={verCatalogo}>Ver todo el catálogo</a>
        </div>
        <div className="v2-banners v2-banners--4">
          {LINEAS.map((b) => (
            <a key={b.cat} className="v2-banner" href={`/productos?categoria=${encodeURIComponent(b.cat)}`} onClick={(e) => verCategoria(e, b.cat)}>
              <span className="v2-banner-media">
                <img src={medSrc(b.foto)} alt="" loading="lazy" decoding="async" style={{ objectPosition: b.pos }} />
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

export default MarcasPage;
