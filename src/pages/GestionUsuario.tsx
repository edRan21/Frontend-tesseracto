// src/pages/GestionUsuario.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Molde exacto basado en tu utr.entity.ts
interface UtrEquipo {
  id: number;
  nsue: string;
  nsm: string;
  nsut: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
}

export const GestionUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchUtrsLoading, setIsFetchUtrsLoading] = useState(false);
  const [equiposVinculados, setEquiposVinculados] = useState<UtrEquipo[]>([]);

  const [formData, setFormData] = useState({
    username: '',
    password: '', // Nuevo campo para la contraseña
    role: '',
    client_id: '',
    is_active: true
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3000/api/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setFormData({
            username: data.user.username,
            password: '', // Dejamos vacío, solo se llena si quieres cambiarla
            role: data.user.role,
            client_id: data.user.client_id ? data.user.client_id.toString() : '',
            is_active: data.user.is_active
          });
        } else {
          alert("Error al obtener usuario: " + data.error);
        }
      } catch (error) {
        console.error("Error conectando al backend", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // Efecto para cargar los equipos cuando cambia el client_id
  useEffect(() => {
    if (!formData.client_id) {
      setEquiposVinculados([]);
      return;
    }

    const fetchEquiposPorCliente = async () => {
      setIsFetchUtrsLoading(true);
      const token = localStorage.getItem('token');
      try {
        // NOTA: Ajusta esta URL si tu endpoint para listar UTRs es diferente
        const response = await fetch(`http://localhost:3000/api/telemetry/utrs?clientId=${formData.client_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setEquiposVinculados(data.utrs || []);
        }
      } catch (err) {
        console.error("Error cargando equipos de la empresa:", err);
      } finally {
        setIsFetchUtrsLoading(false);
      }
    };

    fetchEquiposPorCliente();
  }, [formData.client_id]);

  const handleActualizarDatos = async (e: React.FormEvent) => {
    e.preventDefault();

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      alert("⚠️ El nombre de usuario solo puede contener letras, números y guiones bajos.");
      return;
    }

    const clientIdNumber = parseInt(formData.client_id);
    if (formData.client_id !== '' && isNaN(clientIdNumber)) {
      alert("⚠️ El Client ID debe ser un número válido.");
      return;
    }

    const token = localStorage.getItem('token');

    // Construimos el payload de forma dinámica
    const payload: any = {
      username: formData.username,
      role: formData.role,
      client_id: formData.client_id !== '' ? clientIdNumber : null,
      is_active: formData.is_active
    };

    // Solo enviamos la contraseña si escribiste algo nuevo
    if (formData.password.trim() !== '') {
      payload.password = formData.password;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Datos actualizados correctamente");
        navigate('/admin');
      } else {
        alert("❌ Error del servidor: " + (data.error || 'No se pudo actualizar'));
      }
    } catch (err) {
      console.error("Error enviando actualización:", err);
      alert('Error de conexión con el backend.');
    }
  };

  if (isLoading) return <p>Cargando configuración del usuario...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/admin')} style={{ marginBottom: '20px', padding: '5px 10px' }}>
        ⬅ Volver al Panel
      </button>
      
      <h2>Gestión de Usuario (ID: {id})</h2>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: '#f9f9f9', marginBottom: '30px' }}>
        <h3>Datos Generales</h3>
        <form onSubmit={handleActualizarDatos}>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Nombre de Usuario:</label>
            <input 
              type="text" 
              value={formData.username}
              style={{ width: '100%', padding: '8px' }}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
            <small style={{ color: 'gray' }}>Solo letras, números y guiones bajos.</small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Nueva Contraseña (Opcional):</label>
            <input 
              type="password" 
              value={formData.password}
              placeholder="Escribe aquí para cambiar la contraseña..."
              style={{ width: '100%', padding: '8px' }}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Rol del Sistema:</label>
            <select 
              value={formData.role}
              style={{ width: '100%', padding: '8px' }}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              required
            >
              <option value="super_admin">Super Administrador (Tesseracto)</option>
              <option value="admin">Administrador</option>
              <option value="user">Usuario Final (Cliente)</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Empresa (Client ID):</label>
            <input 
              type="number" 
              value={formData.client_id}
              style={{ width: '100%', padding: '8px' }}
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                style={{ marginRight: '10px', transform: 'scale(1.5)' }}
              />
              Cuenta Activa (Habilitar acceso al sistema)
            </label>
          </div>

          <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', width: '100%', cursor: 'pointer' }}>
            💾 Guardar Cambios
          </button>
        </form>
      </div>

      {/* SECCIÓN DE TELEMETRÍAS */}
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', background: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>📡 Equipos de Telemetría Vinculados</h3>
        <p style={{ color: 'gray', fontSize: '14px' }}>
          Equipos visibles para el Client ID: {formData.client_id || 'Ninguno'}
        </p>

        {isFetchUtrsLoading ? (
          <p>Buscando equipos en la base de datos...</p>
        ) : equiposVinculados.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>ID</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>NSUE</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>NSM</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>NSUT</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {equiposVinculados.map((utr) => (
                  <tr key={utr.id}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{utr.id}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{utr.nsue || '-'}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{utr.nsm || '-'}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>{utr.nsut || '-'}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                      {utr.is_active ? '🟢 Activo' : '🔴 Inactivo'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '15px', background: '#fff3cd', color: '#856404', borderRadius: '4px', marginTop: '10px' }}>
            ⚠️ Esta empresa no tiene equipos de telemetría registrados.
          </div>
        )}
      </div>
    </div>
  );
};