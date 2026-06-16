// Social proof: brands that already produce with B2YOU. A wholesale/retail buyer
// trusts faster when they see real companies who confiaron en la marca.
const LOGOS = [
  { name: 'ARTFUL', src: '/images/Clientes/artful.jpg' },
  { name: 'ARTLAB', src: '/images/Clientes/artlab.jpg' },
  { name: 'VIACOTONE', src: '/images/Clientes/viacotone.png' },
];

function ClientLogos() {
  return (
    <section className="logo-wall">
      <div className="logo-wall-inner">
        <span className="logo-wall-label">Marcas que <em className="accent">confían</em> en nosotros</span>
        <div className="logo-wall-row">
          {LOGOS.map((logo) => (
            <div className="logo-wall-item" key={logo.name}>
              <img
                src={logo.src}
                alt={logo.name}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span class="logo-wall-fallback">${logo.name}</span>`;
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClientLogos;
