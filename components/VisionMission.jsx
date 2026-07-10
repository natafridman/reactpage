function VisionMission() {
  return (
    <section className="vision-section">
      <div className="vision-container">
        <div className="vision-content">
          <div className="vision-block">
            <span className="vision-label">Lo que nos mueve</span>
            <h2 className="vision-title">Hacer productos que valgan la pena</h2>
            <p className="vision-text">
              Queremos que cada idea que sale de nuestro taller sea algo que
              de verdad uses y disfrutes. No buscamos hacer productos descartables,
              sino que te acompañen y que representen bien a quien los lleva.
            </p>
            <ul className="vision-features">
              <li>Buenos materiales</li>
              <li>Diseño con criterio</li>
              <li>Trabajo honesto</li>
            </ul>
          </div>

          <div className="vision-block">
            <span className="vision-label">Cómo trabajamos</span>
            <h2 className="vision-title">De cerca y a medida</h2>
            <p className="vision-text">
              Nos gusta trabajar en contacto directo con cada cliente.
              Entender qué necesitan, proponer ideas y llegar a un producto
              que les cierre de verdad. No hay moldes fijos, cada proyecto
              es distinto y así lo encaramos.
            </p>
            <ul className="vision-spec">
              <li>
                <span className="vision-spec-label">Producción</span>
                <span className="vision-spec-value">Taller propio en Buenos Aires</span>
              </li>
              <li>
                <span className="vision-spec-label">A medida</span>
                <span className="vision-spec-value">Sin moldes fijos, cada proyecto distinto</span>
              </li>
              <li>
                <span className="vision-spec-label">Alcance</span>
                <span className="vision-spec-value">Pedidos por mayor y por menor</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VisionMission;
