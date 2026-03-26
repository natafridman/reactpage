import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '/LandingPage.jsx';
import App from '/App.jsx';
import EmpresasPage from '/EmpresasPage.jsx';
import MarcasPage from '/MarcasPage.jsx';
import NosotrosPage from '/NosotrosPage.jsx';
import RedProductosPage from '/RedProductosPage.jsx';
import '/index.css';

const WA_NUMBER = '5491178279281';

function WhatsAppFloat() {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola, me gustaría recibir más información sobre sus productos.')}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contactar por WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor">
        <path d="M16.004 0C7.165 0 0 7.163 0 16.001c0 2.82.736 5.573 2.137 7.998L.074 31.79a.5.5 0 0 0 .612.613l7.89-2.066A15.93 15.93 0 0 0 16.004 32C24.837 32 32 24.837 32 16.001 32 7.163 24.837 0 16.004 0zm0 29.333a13.27 13.27 0 0 1-6.87-1.907.5.5 0 0 0-.426-.05l-5.47 1.432 1.43-5.393a.5.5 0 0 0-.054-.432A13.28 13.28 0 0 1 2.667 16C2.667 8.636 8.638 2.667 16.004 2.667c7.364 0 13.33 5.969 13.33 13.334 0 7.364-5.966 13.332-13.33 13.332zm7.327-9.96c-.4-.2-2.366-1.167-2.733-1.3-.366-.133-.633-.2-.9.2s-1.033 1.3-1.266 1.567c-.233.267-.467.3-.867.1s-1.69-.623-3.22-1.987c-1.19-1.062-1.993-2.374-2.227-2.774s-.025-.617.175-.817c.18-.18.4-.467.6-.7.2-.233.267-.4.4-.667s.067-.5-.033-.7c-.1-.2-.9-2.167-1.233-2.967-.325-.778-.655-.673-.9-.685l-.767-.013a1.47 1.47 0 0 0-1.067.5c-.367.4-1.4 1.367-1.4 3.334s1.433 3.867 1.633 4.133c.2.267 2.823 4.31 6.84 6.043.955.413 1.7.659 2.281.844.959.305 1.832.262 2.522.159.77-.115 2.367-.968 2.7-1.902.333-.934.333-1.734.233-1.902-.1-.167-.367-.267-.767-.467z"/>
      </svg>
    </a>
  );
}

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/productos" element={<App />} />
        <Route path="/producto/:categoria/:nombre" element={<App />} />
        <Route path="/Empresas" element={<EmpresasPage />} />
        <Route path="/Marcas" element={<MarcasPage />} />
        <Route path="/Nosotros" element={<NosotrosPage />} />
        <Route path="/red" element={<RedProductosPage />} />
      </Routes>
      <WhatsAppFloat />
    </Router>
  );
}

export default Main;
