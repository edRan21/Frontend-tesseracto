import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Mapa } from './pages/Mapa';
import { DetalleUTR } from './pages/DetalleUTR';
import { AdminPanel } from './pages/AdminPanel';
import { GestionUsuario } from './pages/GestionUsuario';
import { Reportes } from './pages/Reportes';
import { Clientes } from './pages/Clientes';
import { Equipos } from './pages/Equipos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/mapa" element={<Mapa />} />
        {/* Ruta dinámica para el detalle de cada UTR */}
        <Route path="/mapa/:id" element={<DetalleUTR />} />

        {/* Rutas de Administrador */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/usuarios/:id" element={<GestionUsuario />} />
        <Route path="/reportes/" element={<Reportes />} />
        <Route path="/admin/clientes" element={<Clientes />} />
        <Route path="/admin/equipos" element={<Equipos />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;