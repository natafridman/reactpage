function ClientsSection() {
  const clients = [
    { name: 'ARTLAB', logo: '/images/Clientes/artlab.jpg' }
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
                    // Fallback to placeholder if image doesn't exist
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="client-placeholder">${client.name}</span>`;
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClientsSection;
