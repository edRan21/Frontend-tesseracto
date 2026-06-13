// src/pages/Equipos.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Cliente {
  id: number;
  company_name: string;
  name?: string;
}

interface Equipo {
  id: number;
  nsue: string;
  nsm: string;
  nsut: string;
  client_id: number;
  is_active: boolean;
}

export const Equipos = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    client_id: '',
    nsue: '',
    nsm: '',
    nsut: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      // 1. Cargamos los clientes para la lista desplegable
      const resClientes = await fetch('http://localhost:3000/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataClientes = await resClientes.json();
      if (dataClientes.success) setClientes(dataClientes.data || dataClientes.clients || []);

      // 2. Cargamos el inventario actual de equipos (Requiere que tengas un GET /api/telemetry/utrs o similar en tu backend)
      const resEquipos = await fetch('http://localhost:3000/api/telemetry/utrs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataEquipos = await resEquipos.json();
      if (dataEquipos.success) setEquipos(dataEquipos.utrs || dataEquipos.data || []);

    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEquipo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      alert("⚠️ Selecciona la empresa a la que pertenece esta telemetría.");
      return;
    }

    const token = localStorage.getItem('token');

    try {
      // Apuntamos al endpoint POST que acabamos de crear en el backend
      const response = await fetch('http://localhost:3000/api/utrs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          client_id: parseInt(formData.client_id),
          nsue: formData.nsue,
          nsm: formData.nsm,
          nsut: formData.nsut
        })
      });

      const data = await response.json();

      if (data.success || response.ok) {
        setShowModal(false);
        setFormData({ client_id: '', nsue: '', nsm: '', nsut: '' });
        fetchData(); // Recargamos la tabla para ver el nuevo equipo
      } else {
        alert('❌ Error: ' + (data.error || 'No se pudo registrar el equipo. Verifica que los números de serie no estén duplicados.'));
      }
    } catch (err) {
      console.error("Error enviando datos:", err);
      alert('Error de conexión con el backend.');
    }
  };

  if (isLoading) return <p>Cargando inventario de hardware...</p>;

  return (
    <div style={{ padding: '20px', position: 'relative', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate('/admin')} style={{ padding: '8px 15px', marginBottom: '20px', cursor: 'pointer' }}>
        ⬅ Volver al Panel de Usuarios
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Inventario Maestro de Telemetrías (UTRs)</h2>
        <button 
          onClick={() => setShowModal(true)}
          style={{ padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Aprovisionar Nuevo Equipo
        </button>
      </div>

      <table style={{ width: '100%', marginTop: '20px', textAlign: 'left', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>ID Sistema</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Empresa (Client ID)</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>NSUE</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>NSM</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>NSUT</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((equipo) => (
            <tr key={equipo.id}>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>{equipo.id}</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{equipo.client_id}</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd', fontFamily: 'monospace' }}>{equipo.nsue}</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd', fontFamily: 'monospace' }}>{equipo.nsm}</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd', fontFamily: 'monospace' }}>{equipo.nsut}</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                {equipo.is_active !== false ? '🟢 Activa' : '🔴 Inactiva'}
              </td>
            </tr>
          ))}
          {equipos.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'gray' }}>
                No hay equipos registrados en el sistema. Aprovisiona uno nuevo para comenzar.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL DE APROVISIONAMIENTO PROCEDIMENTAL */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '500px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Registrar Nueva Telemetría</h3>
            <p style={{ color: 'gray', fontSize: '14px', marginBottom: '20px' }}>
              Vincula los números de serie físicos con la empresa destino. Estos datos deben ser únicos.
            </p>
            
            <form onSubmit={handleCreateEquipo}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>1. Seleccionar Empresa Cliente:</label>
                <select 
                  style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                  value={formData.client_id}
                  onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                  required
                >
                  <option value="">-- Elige una empresa de la base de datos --</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.company_name || cliente.name} (ID: {cliente.id})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>2. Número de Serie Electrónica (NSUE):</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                  value={formData.nsue}
                  onChange={(e) => setFormData({...formData, nsue: e.target.value.trim()})}
                  required
                  placeholder="Ej. NSUE-90123"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>3. Número de Serie Medidor (NSM):</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                  value={formData.nsm}
                  onChange={(e) => setFormData({...formData, nsm: e.target.value.trim()})}
                  required
                  placeholder="Ej. NSM-45678"
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>4. Número de Serie Unidad Transmisora (NSUT):</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                  value={formData.nsut}
                  onChange={(e) => setFormData({...formData, nsut: e.target.value.trim()})}
                  required
                  placeholder="Ej. NSUT-00124"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 15px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', background: '#f4f4f4' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Guardar Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};