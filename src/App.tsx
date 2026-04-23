import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Mapa } from './pages/Mapa';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/mapa" element={<Mapa />} />
        {/* Ruta dinámica para el detalle de cada UTR */}
        <Route path="/mapa/:id" element={<div>Próximamente: Detalle de UTR</div>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;