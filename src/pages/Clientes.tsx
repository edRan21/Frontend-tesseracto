// src/pages/Clientes.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Cliente {
  id: number;
  company_name: string;
  rfc: string;
  is_active: boolean;
  created_at: string;
}

export const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    rfc: ''
  });

  // Cargar la lista de empresas al abrir la pantalla
  const fetchClientes = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setClientes(data.data || data.clients || []);
      }
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Enviar el formulario para crear una nueva empresa
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          company_name: formData.company_name,
          rfc: formData.rfc
        })
      });

      const data = await response.json();

      if (data.success || response.ok) {
        setShowModal(false);
        setFormData({ company_name: '', rfc: '' });
        fetchClientes(); // Recargamos la tabla para ver el nuevo registro
      } else {
        alert('Error: ' + (data.error || 'No se pudo registrar la empresa'));
      }
    } catch (err) {
      console.error("Error enviando datos:", err);
      alert('Error de conexión con el backend.');
    }
  };

  if (isLoading) return <p>Cargando panel de empresas...</p>;

  return (
    <div style={{ padding: '20px', position: 'relative', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate('/admin')} style={{ padding: '8px 15px', marginBottom: '20px', cursor: 'pointer' }}>
        ⬅ Volver al Panel de Usuarios
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Directorio de Empresas (Clientes)</h2>
        <button 
          onClick={() => setShowModal(true)}
          style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          + Registrar Nueva Empresa
        </button>
      </div>

      <table style={{ width: '100%', marginTop: '20px', textAlign: 'left', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Client ID</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Razón Social</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>RFC</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>{cliente.id}</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{cliente.company_name}</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd', fontFamily: 'monospace' }}>{cliente.rfc}</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                {cliente.is_active !== false ? '🟢 Activa' : '🔴 Inactiva'}
              </td>
            </tr>
          ))}
          {clientes.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'gray' }}>
                No hay empresas registradas. Crea una para comenzar a asignar usuarios.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL DE CREACIÓN */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0 }}>Registrar Empresa</h3>
            <form onSubmit={handleCreateClient}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>Razón Social / Nombre Comercial:</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>RFC:</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '8px', marginTop: '5px', textTransform: 'uppercase' }}
                  value={formData.rfc}
                  onChange={(e) => setFormData({...formData, rfc: e.target.value.toUpperCase()})}
                  required
                  placeholder="Ej. ABCD123456XYZ"
                />
                <small style={{ color: 'gray' }}>Este RFC se usará para vincular automáticamente las telemetrías.</small>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 15px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Guardar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};