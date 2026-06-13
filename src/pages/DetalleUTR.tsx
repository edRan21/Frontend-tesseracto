// src/pages/DetalleUTR.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const DetalleUTR = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [datosUtr, setDatosUtr] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetalles = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3000/api/telemetry/utr/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setDatosUtr(data.data); 
        }
      } catch (error) {
        console.error("Error al obtener detalles", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetalles();
  }, [id]);

  if (isLoading) return <h2>Cargando lecturas del equipo {id}...</h2>;
  if (!datosUtr) return <h2>No se encontraron datos para este equipo.</h2>;

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/mapa')} style={{ padding: '8px 15px', marginBottom: '20px', cursor: 'pointer' }}>
        ⬅ Volver al Mapa
      </button>
      
      <h2>Panel de Monitoreo - UTR: {datosUtr.nsut ?? 'Sin NSUT'}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
        
        {/* SECCIÓN 1: DATOS TÉCNICOS REALES DE TU ENTIDAD UTR */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: '#f9f9f9' }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>📋 Información del Dispositivo</h3>
          <p style={{ margin: '8px 0' }}><strong>ID del Sistema:</strong> {datosUtr.id}</p>
          <p style={{ margin: '8px 0' }}><strong>Número de Serie Electrónica (NSUE):</strong> {datosUtr.nsue ?? '-'}</p>
          <p style={{ margin: '8px 0' }}><strong>Número de Serie Medidor (NSM):</strong> {datosUtr.nsm ?? '-'}</p>
          <p style={{ margin: '8px 0' }}><strong>Ubicación:</strong> {datosUtr.latitude ?? '0'}, {datosUtr.longitude ?? '0'}</p>
          <p style={{ margin: '8px 0' }}>
            <strong>Estado de Operación:</strong> {datosUtr.is_active ? '🟢 Activo (Transmitiendo)' : '🔴 Inactivo (Kill Switch)'}
          </p>
        </div>

        {/* SECCIÓN 2: TELEMETRÍA Y LECTURAS RECIBIDAS */}
        <div style={{ border: '1px solid #007bff', padding: '20px', borderRadius: '8px', background: '#f0f7ff' }}>
          <h3 style={{ marginTop: 0, color: '#0056b3' }}>📡 Últimas Lecturas de Telemetría</h3>
          <p style={{ fontSize: '18px', margin: '10px 0' }}>
            <strong>Flujo Instantáneo:</strong> {datosUtr.flow_instant ?? '-'} L/s
          </p>
          <p style={{ fontSize: '18px', margin: '10px 0' }}>
            <strong>Estado KER:</strong> {datosUtr.ker_code ?? '-'}
          </p>
          <p style={{ fontSize: '14px', color: 'gray', marginTop: '20px' }}>
            * Datos actualizados según el último paquete de transmisión recibido por el servidor web.
          </p>
        </div>

      </div>

      {/* SECCIÓN HISTÓRICA ADAPTATIVA (Para mapear arreglos de datos si tu backend los incluye) */}
      {datosUtr.readings && datosUtr.readings.length > 0 && (
        <div style={{ marginTop: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>📊 Historial Reciente de Transmisiones</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Fecha / Hora</th>
                <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Flujo (L/s)</th>
                <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Código KER</th>
              </tr>
            </thead>
            <tbody>
              {datosUtr.readings.map((reading: any, index: number) => (
                <tr key={index}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{reading.created_at ?? '-'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{reading.flow_instant ?? '-'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{reading.ker_code ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};