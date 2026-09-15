import { useNavigate } from 'react-router-dom';
import ClientLogos from '/components/ClientLogos.jsx';
import PaginaV2, { HeroPagina, Cierre, Icono, waLink } from '/components/PaginaV2.jsx';
import { medSrc, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

const IMG = (cat, folder, file) => `/${IMAGES_BASE_FOLDER}/${cat}/${folder}/${file}`;
const LOGO = '/images/Branding/B2 B2YOU Header Landscape 2.png';
const WA = 'Hola B2YOU, quiero saber más sobre cómo trabajan.';

// Las mismas dos fotos propias que enmarcan el bloque de la landing.
const FOTOS = [
  IMG('Carteras', 'Cartera Buckle Z71018', '01.jpg'),
  IMG('Carteras', 'Cartera Convertible Terra Y71009', '01.jpg'),
];

const COMO = [
  { icono: 'taller', titulo: 'Taller propio', texto: 'Producimos en Buenos Aires. No tercerizamos la terminación.' },
  { icono: 'cuero', titulo: 'Materiales reales', texto: 'Cuero genuino y herrajes elegidos pieza por pieza.' },
  { icono: 'logo', titulo: 'A medida', texto: 'Grabado, estampado, bordado y etiquetas con tu identidad.' },
  { icono: 'reloj', titulo: 'Fechas que se cumplen', texto: 'De 15 a 30 días hábiles desde que aprobás la muestra.' },
];

function NosotrosPage() {
  const navigate = useNavigate();
  const verCatalogo = (e) => { e.preventDefault(); navigate('/productos'); };

  return (
    <PaginaV2 titulo="B2YOU - Quiénes somos">
      <HeroPagina
        base="hero-nosotros"
        alto="Herramientas de marroquinería sobre la mesa de trabajo"
        eyebrow="Quiénes somos"
        titulo={<>Una fábrica de accesorios, <em>no un catálogo prestado</em>.</>}
        bajada="Diseñamos y producimos en Buenos Aires para marcas y empresas que quieren productos con su identidad y que duren."
        acciones={<>
          <a className="v2-btn v2-btn-light" href="/productos" onClick={verCatalogo}>Ver el catálogo</a>
          <a className="v2-btn v2-btn-outline-light" href={waLink(WA)} target="_blank" rel="noopener noreferrer">Hablemos por WhatsApp</a>
        </>}
      />

      {/* El bloque enmarcado de la landing: dos fotos propias y el texto al medio. */}
      <section className="v2-section v2-about">
        <div className="v2-about-frame">
          <img className="v2-about-photo" src={medSrc(FOTOS[0])} alt="Cartera de cuero marrón al hombro" loading="lazy" decoding="async" />
          <div className="v2-about-copy">
            <h2 className="v2-about-title">Lo que nos mueve</h2>
            <img className="v2-about-logo" src={LOGO} alt="B2YOU" loading="lazy" decoding="async" />
            <p>Arrancamos con una idea simple: los accesorios tienen que durar. Que lo que sale del taller sea algo que de verdad uses, que te acompañe, y que represente bien a quien lo lleva.</p>
            <p>Trabajamos con marcas y empresas que buscan lo mismo. Cada proyecto se encara desde cero, sin moldes fijos: producción artesanal con escala profesional, para que el resultado sea igual de bueno en diez unidades que en mil.</p>
          </div>
          <img className="v2-about-photo" src={medSrc(FOTOS[1])} alt="Mochila de cuero marrón en la espalda" loading="lazy" decoding="async" />
        </div>
      </section>

      <section className="v2-benefits">
        <div className="v2-benefits-inner v2-benefits-inner--4">
          {COMO.map((v) => (
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

      {/* Las dos puertas de entrada: por que lado viene cada visitante. */}
      <section className="v2-section">
        <div className="v2-section-head"><h2 className="v2-h2">Cómo podemos trabajar juntos</h2></div>
        <div className="v2-puertas">
          <a className="v2-puerta" href="/Marcas" onClick={(e) => { e.preventDefault(); navigate('/Marcas'); }}>
            <span className="v2-puerta-titulo">Tenés una marca</span>
            <span className="v2-puerta-texto">Producimos con tu etiqueta, de la muestra a la entrega.</span>
            <span className="v2-banner-cta">Ver cómo <span aria-hidden="true">→</span></span>
          </a>
          <a className="v2-puerta" href="/Empresas" onClick={(e) => { e.preventDefault(); navigate('/Empresas'); }}>
            <span className="v2-puerta-titulo">Sos una empresa</span>
            <span className="v2-puerta-texto">Regalos y productos con tu logo para tu equipo y tus clientes.</span>
            <span className="v2-banner-cta">Ver cómo <span aria-hidden="true">→</span></span>
          </a>
        </div>
      </section>

      <ClientLogos />

      <Cierre
        titulo="¿Querés trabajar con nosotros?"
        texto="Contanos qué necesitás y armamos una propuesta a medida."
        textoWa={WA}
      />
    </PaginaV2>
  );
}

export default NosotrosPage;
