import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '/LandingPage.jsx';
import App from '/App.jsx';
import EmpresasPage from '/EmpresasPage.jsx';
import MarcasPage from '/MarcasPage.jsx';
import NosotrosPage from '/NosotrosPage.jsx';
import '/index.css';

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
      </Routes>
    </Router>
  );
}

export default Main;
