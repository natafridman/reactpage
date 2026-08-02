import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { loadCatalogIndex, thumbSrc } from '/utils/productUtils.js';
import { esProtegido } from '/utils/claveNacional.js';

gsap.registerPlugin(useGSAP);

const IMAGES_BASE_FOLDER = 'images/Categorias';

// Tres tiras que se cruzan: la del medio va para el otro lado. Cada una tarda
// distinto en dar la vuelta para que no se muevan como un bloque.
// Marcha lenta: una vuelta entera tarda cerca de dos minutos, asi el bloque
// respira en vez de desfilar.
const ROWS = [
  { dir: -1, seconds: 115 },
  { dir: 1, seconds: 140 },
  { dir: -1, seconds: 128 },
];

// Fotos distintas por tira. Con pocas, el mismo producto entraba dos veces en
// una sola pantalla y parecia que la tira se reiniciaba.
const POR_TIRA = 26;

// Una tira: se desplaza sola, se puede arrastrar con el dedo y sigue de largo
// con la inercia del gesto antes de retomar la marcha.
function BubbleRow({ images, dir, seconds, onPick }) {
  const trackRef = useRef(null);
  const state = useRef({
    position: 0,
    speed: 0,
    touching: false,
    touchStartX: 0,
    touchStartPos: 0,
    lastTouchX: 0,
    lastTouchTime: 0,
    velocity: 0,
    raf: null,
    setWidth: 0,
  });

  // Se repite lo justo para cubrir el doble del ancho de pantalla: asi al
  // volver al principio la costura cae siempre fuera de la vista.
  const items = useMemo(() => {
    if (!images.length) return [];
    const anchoAprox = 96;
    const unaVuelta = images.length * anchoAprox;
    const repeticiones = Math.max(2, Math.ceil((window.innerWidth * 2) / unaVuelta) + 1);
    return Array.from({ length: repeticiones }, () => images).flat();
  }, [images]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !images.length) return;
    const s = state.current;

    const medir = () => {
      const tiles = track.children;
      if (tiles.length <= images.length) return;
      // El largo de una vuelta se mide en el DOM, del primer recuadro de un
      // juego al primero del siguiente. Calcularlo como ancho x cantidad + gap
      // arrastra el redondeo de cada recuadro y la tira termina saltando.
      s.setWidth = tiles[images.length].offsetLeft - tiles[0].offsetLeft;
      s.speed = s.setWidth / (seconds * 60);
    };
    requestAnimationFrame(medir);

    const animar = () => {
      if (s.setWidth > 0 && !s.touching) {
        if (Math.abs(s.velocity) > 0.1) {
          s.position += s.velocity;
          s.velocity *= 0.95;
        } else {
          s.velocity = 0;
          s.position += dir * s.speed;
        }
      }
      // Se mantiene dentro de una vuelta, en cualquiera de los dos sentidos.
      if (s.setWidth > 0) {
        while (s.position < -s.setWidth) s.position += s.setWidth;
        while (s.position > 0) s.position -= s.setWidth;
      }
      // translate3d y no translateX: manda el desplazamiento a la placa de
      // video y el movimiento deja de temblar en pantallas grandes.
      track.style.transform = `translate3d(${s.position.toFixed(2)}px, 0, 0)`;
      s.raf = requestAnimationFrame(animar);
    };
    s.raf = requestAnimationFrame(animar);

    window.addEventListener('resize', medir);
    return () => {
      if (s.raf) cancelAnimationFrame(s.raf);
      window.removeEventListener('resize', medir);
    };
  }, [items, dir, seconds, images.length]);

  const onTouchStart = (e) => {
    const s = state.current;
    s.touching = true;
    s.touchStartX = e.touches[0].clientX;
    s.touchStartPos = s.position;
    s.lastTouchX = e.touches[0].clientX;
    s.lastTouchTime = Date.now();
    s.velocity = 0;
  };

  const onTouchMove = (e) => {
    const s = state.current;
    if (!s.touching) return;
    e.preventDefault();
    const x = e.touches[0].clientX;
    const ahora = Date.now();
    s.position = s.touchStartPos + (x - s.touchStartX);
    const dt = ahora - s.lastTouchTime;
    if (dt > 5) {
      s.velocity = s.velocity * 0.6 + ((x - s.lastTouchX) / dt) * 16 * 0.4;
      s.lastTouchX = x;
      s.lastTouchTime = ahora;
    }
  };

  const onTouchEnd = () => {
    state.current.touching = false;
  };

  return (
    <div
      className="category-bubbles-row"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      <div className="category-bubbles-track" ref={trackRef}>
        {items.map((img, i) => (
          <div className="category-bubble" key={i} onClick={() => onPick(img)}>
            <img
              src={img.src}
              alt={img.name}
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryBanner({ category, claveOk = false }) {
  const [bubbleImages, setBubbleImages] = useState([]);
  const bannerRef = useRef(null);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const isAll = !category;
  const title = isAll ? 'Productos' : category;

  useEffect(() => {
    let cancelado = false;

    async function loadImages() {
      try {
        // Un solo pedido con el metadata de todo el catalogo, en vez de un
        // metadata.txt por producto. Eso permite tomar muchas mas fotos sin
        // que cueste nada: las que no se ven no se descargan.
        const index = await loadCatalogIndex();

        const todos = isAll
          ? Object.entries(index).flatMap(([cat, lista]) =>
              (lista || []).map((p) => ({ ...p, category: cat })))
          : (index[category] || []).map((p) => ({ ...p, category }));

        // Los cinturones nacionales tapados tampoco salen en la cinta: si no,
        // se verian igual arriba aunque el listado los esconda.
        const productos = claveOk ? todos : todos.filter((p) => !esProtegido(p));

        if (!productos.length) return;

        const mezclados = [...productos].sort(() => Math.random() - 0.5);
        const images = [];
        for (const p of mezclados) {
          const lista = p.metadata && p.metadata.images;
          if (!Array.isArray(lista) || !lista.length) continue;
          const foto = lista[Math.floor(Math.random() * lista.length)];
          const ruta = `/${IMAGES_BASE_FOLDER}/${p.category}/${p.productFolder}/${foto}`;
          images.push({
            // Miniatura de 280px para recuadros de 84px: es mas del triple de
            // lo que se muestra, o sea que sobra resolucion. La de 1200px
            // serian ~4,7 MB solo para esta cinta decorativa.
            src: thumbSrc(ruta),
            name: p.productFolder,
            category: p.category,
          });
          if (images.length >= POR_TIRA * ROWS.length) break;
        }

        if (!cancelado) setBubbleImages(images);
      } catch (err) {
        console.error('Error loading banner images:', err);
      }
    }

    setBubbleImages([]);
    loadImages();
    return () => { cancelado = true; };
    // claveOk esta en las dependencias a proposito: al acertar la clave la
    // cinta se rearma sola e incorpora los nacionales, sin recargar la pagina.
  }, [category, isAll, claveOk]);

  const showBubbles = bubbleImages.length >= 6;

  // Reparto uno de cada tres, asi ninguna tira comparte producto con otra y
  // las tres arrancan con fotos distintas.
  const rowImages = useMemo(
    () => ROWS.map((_, r) => bubbleImages.filter((_, i) => i % ROWS.length === r)),
    [bubbleImages]
  );

  // Entrada: primero el titulo, despues el bloque crece y va empujando lo de
  // abajo, y recien ahi entran las tiras una atras de otra con sus recuadros
  // apareciendo en fila.
  useGSAP(() => {
    const chars = bannerRef.current?.querySelectorAll('.banner-char');
    if (chars && chars.length) {
      gsap.fromTo(
        chars,
        { yPercent: 115, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.9, ease: 'power4.out', stagger: 0.035 }
      );
      gsap.fromTo(
        '.category-banner-divider',
        { scaleX: 0, transformOrigin: 'center' },
        { scaleX: 1, duration: 0.8, ease: 'power3.inOut', delay: 0.25 }
      );
    }

    const wrap = wrapperRef.current;
    if (!wrap) return;
    const filas = wrap.querySelectorAll('.category-bubbles-row');
    // Solo se animan los recuadros que caben en pantalla; el resto ya viene
    // detras y animar cientos de nodos no aportaria nada.
    const visibles = [...wrap.querySelectorAll('.category-bubble')].filter(
      (el) => el.offsetLeft < window.innerWidth + 120
    );

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(wrap, { height: 0, duration: 1.1, ease: 'power2.inOut' })
      .fromTo(filas, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.16 }, '-=0.75')
      .fromTo(
        visibles,
        { autoAlpha: 0, scale: 0.86 },
        { autoAlpha: 1, scale: 1, duration: 0.55, stagger: 0.018 },
        '-=0.6'
      );
  }, { scope: bannerRef, dependencies: [title, showBubbles, bubbleImages.length] });

  const goToProduct = (img) => {
    navigate(`/producto/${encodeURIComponent(img.category)}/${encodeURIComponent(img.name)}`);
  };

  return (
    <section className="category-banner" ref={bannerRef}>
      <div className="category-banner-content">
        <div className="category-banner-title-row">
          <h1 className="category-banner-title" aria-label={title}>
            {title.split('').map((ch, i) => (
              <span className="banner-char-wrap" key={i} aria-hidden="true">
                <span className="banner-char">{ch === ' ' ? ' ' : ch}</span>
              </span>
            ))}
          </h1>
        </div>
        <p className="category-banner-subtitle">
          Diseños propios · Personalizables con tu logo · Producción a medida
        </p>
        <div className="category-banner-divider"></div>
      </div>
      {showBubbles && (
        <div className="category-bubbles-wrapper" ref={wrapperRef}>
          {ROWS.map((row, i) => (
            <BubbleRow
              key={i}
              images={rowImages[i]}
              dir={row.dir}
              seconds={row.seconds}
              onPick={goToProduct}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default CategoryBanner;
