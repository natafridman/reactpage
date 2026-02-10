import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '/LandingPage.jsx';
import App from '/App.jsx';
import '/index.css';

function Main() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal - Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Ruta de productos - Catálogo */}
        <Route path="/productos" element={<App />} />
      </Routes>
    </Router>
  );
}

export default Main;
