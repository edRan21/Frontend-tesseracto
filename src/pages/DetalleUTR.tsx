// src/pages/DetalleUTR.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const DetalleUTR = () => {
  // 1. Extraemos el 'id' mágicamente desde la URL
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [datosUtr, setDatosUtr] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetalles = async () => {
      const token = localStorage.getItem('token');
      try {
        // 2. Inyectamos el 'id' en la URL que viaja hacia tu backend
        const response = await fetch(`http://localhost:3000/api/telemetry/utr/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setDatosUtr(data.data); // Guardamos la información que responde el servidor
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
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate('/mapa')} style={{ padding: '5px 10px', marginBottom: '15px' }}>
        ⬅ Volver al Mapa
      </button>
      <h2>Detalles de la UTR: {datosUtr.nsut}</h2>
      
      <div style={{ border: '1px solid #007bff', padding: '15px', borderRadius: '8px' }}>
        <h3>Últimas Lecturas</h3>
        <p>Flujo Instantáneo: {datosUtr.flow_instant} L/s</p>
        <p>Estado KER: {datosUtr.ker_code}</p>
        {/* Aquí podemos agregar más datos o incluso las gráficas en el futuro */}
      </div>
    </div>
  );
};