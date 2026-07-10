function TestimonialsSection() {
  // One real client, shown honestly as a single pull-quote rather than a faked
  // wall of cards. Add a second quote here and it becomes a two-up automatically.
  const quote = {
    text: 'Trabajamos con B2YOU para nuestra línea de gorras y bolsos de marca propia. La producción fue impecable y los tiempos se cumplieron al pie de la letra.',
    author: 'Equipo VIACOTONE',
    logo: '/images/Clientes/.opt/viacotone.webp',
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <span className="testimonials-subtitle">En sus palabras</span>
        <blockquote className="testimonial-quote">{quote.text}</blockquote>
        <div className="testimonial-attrib">
          <img
            src={quote.logo}
            alt={quote.author}
            className="testimonial-attrib-logo"
            loading="lazy"
            decoding="async"
          />
          <span className="testimonial-attrib-name">{quote.author}</span>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
