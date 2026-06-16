// Social proof: brands that already produce with B2YOU. A wholesale/retail buyer
// trusts faster when they see real companies who confiaron en la marca.
// Each logo sits on a white chip (so transparent, white-bg and dark marks all
// read consistently in light + dark mode) with the brand name written below.
// Optimized webp comes from scripts/optimize-logos.mjs (.opt/<slug>.webp);
// the original PNG is the onError fallback.
const LOGOS = [
  { name: 'Artful', slug: 'artful', file: 'artful.png' },
  { name: 'Birmingham', slug: 'birmingham', file: 'birmingham.png' },
  { name: 'Floppy Kenny', slug: 'floppy', file: 'floppy.png' },
  { name: 'Samples Studios', slug: 'samples-studios', file: 'samples studios.png' },
  { name: 'TBN Club', slug: 'tbn-club', file: 'tbn club.png' },
  { name: 'Viacotone', slug: 'viacotone', file: 'viacotone.png' },
  { name: 'Yagmour', slug: 'yagmour', file: 'yagmour.png' },
];

const BASE = '/images/Clientes';

function ClientLogos() {
  return (
    <section className="logo-wall">
      <div className="logo-wall-inner">
        <span className="logo-wall-label">Marcas que <em className="accent">confían</em> en nosotros</span>
        <div className="logo-wall-row">
          {LOGOS.map((logo) => (
            <figure className="logo-wall-item" key={logo.slug}>
              <div className="logo-wall-chip">
                <img
                  src={`${BASE}/.opt/${logo.slug}.webp`}
                  alt={`Logo de ${logo.name}`}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (!e.target.dataset.fallback) {
                      e.target.dataset.fallback = '1';
                      e.target.src = encodeURI(`${BASE}/${logo.file}`);
                    }
                  }}
                />
              </div>
              <figcaption className="logo-wall-name">{logo.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClientLogos;
