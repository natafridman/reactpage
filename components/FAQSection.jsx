import { useState } from 'react';

const faqs = [
  {
    q: '¿Cuál es el pedido mínimo?',
    a: 'Trabajamos desde 10 unidades por producto. Para pedidos menores podemos evaluar cada caso puntualmente.'
  },
  {
    q: '¿Cuánto tarda la producción?',
    a: 'El tiempo estándar es de 15 a 30 días hábiles desde la aprobación de la muestra. Pedidos grandes pueden requerir más tiempo según la complejidad.'
  },
  {
    q: '¿Puedo pedir muestras antes de hacer el pedido?',
    a: 'Sí, siempre lo recomendamos. Las muestras tienen un costo que se descuenta del pedido final una vez confirmado.'
  },
  {
    q: '¿Qué técnicas de personalización ofrecen?',
    a: 'Grabado láser, estampado en calor, bordado computarizado y etiquetas personalizadas. La técnica más adecuada depende del material y el producto elegido.'
  },
  {
    q: '¿Hacen envíos al interior o al exterior?',
    a: 'Sí, coordinamos envíos a todo el país y al exterior. Los costos y tiempos de logística se informan junto con la propuesta.'
  }
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(i) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-header">
          <span className="faq-subtitle">FAQ</span>
          <h2 className="faq-title">Preguntas frecuentes</h2>
          <div className="faq-divider"></div>
        </div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => toggle(i)}>
                <span>{faq.q}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="faq-chevron"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
