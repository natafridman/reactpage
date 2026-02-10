function ClientsSection() {
  const clients = [
    { name: 'Nike', logo: '/images/clients/nike.png' },
    { name: 'Adidas', logo: '/images/clients/adidas.png' },
    { name: 'Puma', logo: '/images/clients/puma.png' },
    { name: 'Under Armour', logo: '/images/clients/underarmour.png' },
    { name: 'New Balance', logo: '/images/clients/newbalance.png' },
    { name: 'Reebok', logo: '/images/clients/reebok.png' },
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
