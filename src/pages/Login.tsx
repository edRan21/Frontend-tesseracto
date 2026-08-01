import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/Login.css';

import logoTesseracto from '../assets/TESSERACTOLOGONEGROp.png';

import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/roles';
import { ROUTES } from '../utils/constants';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectByRole = (role: string) => {
    if (role === ROLES.SUPER_ADMIN) {
      navigate(ROUTES.SUPER_ADMIN);
      return;
    }

    if (role === ROLES.ADMIN) {
      navigate(ROUTES.ADMIN);
      return;
    }

    navigate(ROUTES.USER);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Ingresa usuario y contraseña.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const user = await login(username, password);
      redirectByRole(user.role);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesión.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-background-grid"></div>

      <section className="login-shell">

        {/* Parte izquierda */}
        <aside className="login-info">

          <div className="system-status">
            <span></span>
            Sistema activo
          </div>

          <h1>
            Plataforma de monitoreo y control industrial
          </h1>

          <p>
            Accede de forma segura para visualizar equipos, variables,
            telemetría y reportes desde un entorno centralizado.
          </p>

          <div className="login-info-cards">

            <div>
              <strong>Acceso</strong>
              <span>Ingreso seguro al sistema</span>
            </div>

            <div>
              <strong>Roles</strong>
              <span>Permisos según usuario</span>
            </div>

            <div>
              <strong>Control</strong>
              <span>Supervisión centralizada</span>
            </div>

          </div>
        </aside>

        {/* Parte derecha */}
        <section className="login-panel">

          <div className="login-brand">

            <img
              className="brand-logo"
              src={logoTesseracto}
              alt="Logo Tesseracto"
            />

            <div>
              <h2>Tesseracto</h2>
              <p>Sistema de monitoreo remoto</p>
            </div>

          </div>

          <form className="login-form" onSubmit={handleLogin}>

            <div className="form-heading">
              <span>Acceso seguro</span>

              <h3>Inicio de sesión</h3>

              <p>
                Ingresa tus credenciales para acceder al sistema.
              </p>
            </div>

            <label>
              Usuario

              <input
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </label>

            <label>
              Contraseña

              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? 'Verificando acceso...'
                : 'Iniciar sesión'}
            </button>

          </form>

          <footer className="login-footer">
            Sistema de control y monitoreo industrial
          </footer>

        </section>

      </section>
    </main>
  );
};