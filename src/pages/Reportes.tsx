// src/pages/Reportes.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Reporte {
  id: number;
  utr_id: number;
  report_type: string;
  generated_by: string;
  created_at: string;
  file_url: string; // Asumiendo que tu backend devuelve un enlace para descargar
}

export const Reportes = () => {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filtros de búsqueda
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const fetchReportes = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    // Construimos la URL con los parámetros de fecha si existen
    let url = 'http://localhost:3000/api/reports';
    if (fechaInicio && fechaFin) {
      url += `?startDate=${fechaInicio}&endDate=${fechaFin}`;
    }

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setReportes(data.reports || data.data || []);
      }
    } catch (error) {
      console.error("Error al cargar reportes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar reportes al iniciar la pantalla
  useEffect(() => {
    fetchReportes();
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReportes();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate('/admin')} style={{ marginBottom: '20px', padding: '5px 10px', cursor: 'pointer' }}>
        ⬅ Volver al Panel
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Centro de Reportes y Descargas</h2>
        <button style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          + Generar Nuevo Reporte
        </button>
      </div>

      {/* BARRA DE FILTROS */}
      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px', marginTop: '20px', marginBottom: '20px' }}>
        <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Fecha Inicio:</label>
            <input 
              type="date" 
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Fecha Fin:</label>
            <input 
              type="date" 
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" style={{ padding: '9px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            🔍 Filtrar
          </button>
          <button 
            type="button" 
            onClick={() => { setFechaInicio(''); setFechaFin(''); fetchReportes(); }}
            style={{ padding: '9px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Limpiar
          </button>
        </form>
      </div>

      {/* TABLA DE RESULTADOS */}
      {isLoading ? (
        <p>Buscando reportes en la base de datos...</p>
      ) : reportes.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr style={{ background: '#e9ecef', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>ID</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Tipo de Reporte</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Fecha de Creación</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Generado Por</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((rep) => (
              <tr key={rep.id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{rep.id}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>{rep.report_type}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{new Date(rep.created_at).toLocaleString()}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{rep.generated_by}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                  <a 
                    href={rep.file_url || '#'} 
                    target="_blank"
                    style={{ padding: '6px 12px', background: '#17a2b8', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}
                  >
                    ⬇️ Descargar
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: '20px', background: '#fff3cd', color: '#856404', borderRadius: '5px', textAlign: 'center' }}>
          No se encontraron reportes generados en este rango de fechas.
        </div>
      )}
    </div>
  );
};