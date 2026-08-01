import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Login } from './pages/Login';
import { Mapa } from './pages/Mapa';
import { UserPanel } from './pages/UserPanel';
import { AdminPanel } from './pages/AdminPanel';
import { SuperAdminPanel } from './pages/SuperAdminPanel';

import { ROUTES } from './utils/constants';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />

        <Route path={ROUTES.USER} element={<UserPanel />} />

        <Route path={ROUTES.ADMIN} element={<AdminPanel />} />

        <Route path={ROUTES.SUPER_ADMIN} element={<SuperAdminPanel />} />

        <Route path={ROUTES.MAPA} element={<Mapa />} />

        <Route
          path="/mapa/:id"
          element={<div>Próximamente: Detalle de UTR</div>}
        />

        <Route path="/" element={<Navigate to={ROUTES.LOGIN} />} />

        <Route path="*" element={<Navigate to={ROUTES.LOGIN} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;