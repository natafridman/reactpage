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
  { icono: 'etiqueta', titulo: 'Marca blanca', texto: 'Tu etiqueta, no la nuestra.' },
  { icono: 'volumen', titulo: 'Tiradas chicas o grandes', texto: 'La misma terminación en las dos.' },
  { icono: 'logo', titulo: 'Tu identidad en cada pieza', texto: 'Grabado, bordado y etiquetas propias.' },
  { icono: 'muestra', titulo: 'Muestra antes de producir', texto: 'La aprobás vos.' },
];

const PASOS = [
  { titulo: 'Nos mostrás tu marca', texto: 'Referencias, materiales y la idea.', foto: '/images/proceso/marcas-1.webp', alto: 'Corte de cuero sobre la mesa de trabajo' },
  { titulo: 'Armamos la propuesta', texto: 'Opciones, terminaciones y precio cerrado.', foto: '/images/proceso/marcas-2.webp', alto: 'Billeteras de cuero junto a bocetos' },
  { titulo: 'Te mandamos la muestra', texto: 'Con tu etiqueta puesta. Si va, seguimos.', foto: '/images/proceso/marcas-3.webp', alto: 'Tarjetero de cuero con el logo grabado' },
  { titulo: 'Producimos y despachamos', texto: '15 a 30 días hábiles.', foto: '/images/proceso/marcas-4.webp', alto: 'Cajas listas para despachar' },
];

const FICHA = [
  ['Volumen', 'Adecuado al cliente'],
  ['Producción', '15 a 30 días hábiles'],
  ['Marca blanca', 'Tu logo y tus etiquetas'],
  ['Muestras', 'Disponibles con costo'],
];

const PREGUNTAS = [
  ['¿Los productos salen con mi marca?', 'Sí. Tu etiqueta y tu logo, sin ninguna referencia a nosotros.'],
  ['¿Puedo arrancar con poca cantidad?', 'Sí. No hay mínimo fijo: nos adecuamos a cada cliente.'],
  ['¿Qué técnicas de personalización hay?', 'Grabado láser, estampado en calor, bordado computarizado y etiquetas, según el material.'],
  ['¿Puedo llevar mi propio diseño?', 'Sí. Trabajamos sobre tus moldes y referencias, o adaptamos un modelo del catálogo.'],
];

function MarcasPage() {
  const navigate = useNavigate();
  const verCatalogo = (e) => { e.preventDefault(); navigate('/productos'); };
  const verCategoria = (e, cat) => { e.preventDefault(); navigate(`/productos?categoria=${encodeURIComponent(cat)}`); };
  const botonWa = (texto) => (
    <a className="v2-btn v2-btn-primary" href={waLink(WA)} target="_blank" rel="noopener noreferrer">{texto}</a>
  );

  return (
    <PaginaV2 titulo="B2YOU - Marcas">
      <HeroPagina
        base="hero-marcas"
        alto="Billeteras de cuero natural sobre una mesa de madera"
        eyebrow="Para marcas"
        titulo={<>Tu etiqueta, nuestra <em>fábrica</em>.</>}
        bajada="Producimos accesorios de cuero con tu marca. De la muestra a la entrega."
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

      <Pasos titulo="Cómo trabajamos" pasos={PASOS} cta={botonWa('Pedí tu cotización')} />
      <Ficha datos={FICHA} cta={botonWa('Mostranos tu marca')} />
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

export default MarcasPage;
