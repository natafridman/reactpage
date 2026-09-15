// Lo que se ve mientras carga. Usa las mismas clases que el contenido real
// (.product-section, .gallery-rail, .products-grid, .product-card) para que las
// cajas midan exactamente lo mismo: cuando llegan los datos, el contenido entra
// en el lugar que ya estaba ocupado y no se mueve nada.
//
// Antes era una capa fija que tapaba la pagina entera, header incluido, con seis
// cuadrados a la izquierda y un bloque gris a la derecha: no se parecia a
// ninguna de las dos pantallas, asi que al desaparecer todo saltaba de golpe.

function Bloque({ className = '', ...resto }) {
  return <span className={`hueso ${className}`.trim()} {...resto} />;
}

function EsqueletoFicha() {
  return (
    <section className="product-section" aria-hidden="true">
      <div className="hero-side">
        <div className="gallery-rail">
          <span className="rail-arrow" />
          <div className="gallery-rail-track">
            {Array.from({ length: 5 }, (_, i) => (
              <span className="gallery-item hueso" key={i} />
            ))}
          </div>
          <span className="rail-arrow" />
        </div>
        <div className="hero-image-wrapper">
          <Bloque className="hueso-foto" />
        </div>
      </div>

      <div className="gallery-side">
        <Bloque className="hueso-linea" style={{ width: '9rem' }} />
        <Bloque className="hueso-titulo" />
        <Bloque className="hueso-linea" style={{ width: '12rem' }} />
        <div className="hueso-parrafo">
          <Bloque className="hueso-linea" />
          <Bloque className="hueso-linea" />
          <Bloque className="hueso-linea" style={{ width: '62%' }} />
        </div>
        <div className="hueso-botones">
          <Bloque className="hueso-boton" />
          <Bloque className="hueso-boton" />
        </div>
      </div>
    </section>
  );
}

function EsqueletoGrilla() {
  return (
    <div className="products-grid" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <div className="product-card card-visible" key={i}>
          <div className="product-card-image hueso" />
          <div className="product-card-info">
            <Bloque className="hueso-linea" style={{ width: '70%' }} />
            <Bloque className="hueso-linea" style={{ width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton({ variant = 'grid' }) {
  return variant === 'product' ? <EsqueletoFicha /> : <EsqueletoGrilla />;
}

export default LoadingSkeleton;
