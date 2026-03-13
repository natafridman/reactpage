function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Pedimos gorras personalizadas para todo el equipo. La calidad superó las expectativas y el proceso fue muy claro desde el principio.",
      author: "Equipo ARTFUL",
      company: "ARTFUL",
      logo: '/images/Clientes/artful.jpg'
    },
    {
      quote: "Trabajamos con B2YOU para nuestra línea de gorras y bolsos de marca propia. La producción fue impecable y los tiempos se cumplieron al pie de la letra.",
      author: "Equipo VIACOTONE",
      company: "VIACOTONE",
      logo: '/images/Clientes/viacotone.png'
    }
  ];

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <span className="testimonials-subtitle">Testimonios</span>
          <h2 className="testimonials-title">Lo que dicen nuestros clientes</h2>
          <div className="testimonials-divider"></div>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-quote-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              <p className="testimonial-text">{t.quote}</p>
              <div className="testimonial-author">
                <div className="testimonial-logo-wrapper">
                  <img
                    src={t.logo}
                    alt={t.company}
                    className="testimonial-logo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span class="testimonial-logo-placeholder">${t.company[0]}</span>`;
                    }}
                  />
                </div>
                <div className="testimonial-author-info">
                  <span className="testimonial-author-name">{t.author}</span>
                  <span className="testimonial-author-company">{t.company}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
