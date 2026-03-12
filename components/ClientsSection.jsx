function ClientsSection() {
  const clients = [
    { name: 'ARTFUL', logo: '/images/Clientes/artful.jpg' },
    { name: 'VIACOTONE', logo: '/images/Clientes/viacotone.png' }
  ];

  return (
    <section className="clients-section">
      <div className="clients-container">
        <div className="clients-header">
          <span className="clients-subtitle">Confianza</span>
          <h2 className="clients-title">Marcas que confían en nosotros</h2>
          <div className="clients-divider"></div>
        </div>
        
        <div className="clients-grid">
          {clients.map((client, index) => (
            <div 
              key={client.name} 
              className="client-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="client-logo-wrapper">
                <img
                  src={client.logo}
                  alt={client.name}
                  className="client-logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="client-placeholder">${client.name}</span>`;
                  }}
                />
              </div>
              <span className="client-name">{client.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClientsSection;
