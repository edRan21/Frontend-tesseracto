// src/pages/AdminPanel.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. IMPORTAMOS useNavigate AQUÍ

interface Usuario {
  id: number;
  username: string;
  role: string;
  is_locked: boolean;
}

interface Cliente {
  id: number;
  name: string; 
}

export const AdminPanel = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]); 
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate(); // 2. INICIAMOS LA HERRAMIENTA DE NAVEGACIÓN

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    client_id: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success || data.length >= 0) setUsuarios(data.data || data);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
      }
    };

    const fetchClientes = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/clients', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setClientes(data.data);
      } catch (err) {
        console.error("Error al cargar clientes:", err);
      }
    };

    Promise.all([fetchUsuarios(), fetchClientes()]).then(() => setIsLoading(false));
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id || formData.client_id === "") {
      alert("⚠️ Por favor, seleccione la empresa a la que pertenece el usuario.");
      return; 
    }

    const clientIdNumber = parseInt(formData.client_id);
    if (isNaN(clientIdNumber)) {
      alert("⚠️ El identificador de la empresa no es válido.");
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          role: formData.role,
          client_id: clientIdNumber 
        })
      });

      const data = await response.json();

      if (data.success || response.ok) {
        setShowModal(false);
        setFormData({ username: '', password: '', role: 'user', client_id: '' });
        window.location.reload(); 
      } else {
        alert('Error del servidor: ' + (data.message || data.error || 'No se pudo crear el usuario'));
      }
    } catch (err) {
      console.error("Error enviando datos:", err);
      alert('Error de conexión con el backend.');
    }
  };

  if (isLoading) return <p>Cargando panel...</p>;

  return (
    <div style={{ padding: '20px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Panel de Control - Administrador</h2>
        
        {/* --- AQUÍ ESTÁ EL NUEVO CONTENEDOR CON AMBOS BOTONES --- */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => navigate('/admin/clientes')}
            style={{ padding: '10px 15px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🏢 Gestionar Empresas
          </button>
          
          <button 
            onClick={() => setShowModal(true)}
            style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            + Crear Nuevo Usuario
          </button>

          <button 
          onClick={() => navigate('/admin/equipos')}
          style={{ padding: '10px 15px', background: '#6f42c1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📡 Inventario de Equipos
          </button>
        </div>
      </div>

      <table style={{ width: '100%', marginTop: '20px', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Usuario</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Rol</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Estado</th>
            {/* 3. AÑADIMOS LA CABECERA DE LA COLUMNA DE ACCIONES */}
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id}>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.id}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.username}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.role}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                {user.is_locked ? '🔴 Bloqueado' : '🟢 Activo'}
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                {/* 4. AÑADIMOS EL BOTÓN CON LA RUTA DINÁMICA DE CADA USUARIO */}
                <button 
                  onClick={() => navigate(`/admin/usuario/${user.id}`)}
                  style={{ padding: '5px 10px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ⚙️ Gestionar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3>Crear Nuevo Usuario</h3>
            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block' }}>Usuario:</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '8px' }}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block' }}>Contraseña:</label>
                <input 
                  type="password" 
                  style={{ width: '100%', padding: '8px' }}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block' }}>Rol del Usuario:</label>
                <select 
                  style={{ width: '100%', padding: '8px' }}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  defaultValue="user"
                >
                  <option value="user">Cliente Final (Solo ve sus equipos)</option>
                  <option value="intermediario">Intermediario (Ve equipos instalados)</option>
                  <option value="admin">Administrador (Tesseracto)</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block' }}>Empresa a la que pertenece:</label>
                <select 
                  style={{ width: '100%', padding: '8px' }}
                  onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                  required
                >
                  <option value="">Seleccione una empresa...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.name} 
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 15px' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>Guardar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};