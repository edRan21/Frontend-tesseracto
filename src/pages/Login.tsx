// src/pages/Login.tsx
import React, { useState } from 'react';

export const Login = () => {
  // Estos son como nuestros "atributos privados" para guardar lo que el usuario escribe
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Esta función se ejecuta al hacer clic en el botón
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    console.log("Intentando iniciar sesión con:", username, password);
    // Aquí es donde nos conectaremos con tu backend más adelante
  };

  return (
    <div className="login-container">
      <h2>Sistema de Monitoreo Remoto de Tesseracto</h2>
      
      <form onSubmit={handleLogin}>
        <div>
          <label>Ingrese nombre de Usuario:</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>

        <div>
          <label>Ingrese contraseña:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
};