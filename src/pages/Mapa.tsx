// 1. Importamos SOLO las herramientas que necesitamos de React
import { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';

// 2. Definimos el "molde" o la forma de nuestros datos para que TypeScript esté feliz
interface Telemetria {
  id: number;
  nsut: string;
  // Puedes agregar más campos aquí en el futuro (ej. status: string;)
}

export const Mapa = () => {
  // 3. Le decimos a useState que esta variable guardará un arreglo de tipo Telemetria
  const [utrs, setUtrs] = useState<Telemetria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUtrs = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3000/api/utrs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        // Si todo sale bien, guardamos los datos
        if (data.success) setUtrs(data.utrs); 
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUtrs();
  }, []);

  if (isLoading) return <p>Cargando telemetrías...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>🗺️ Mapa de Telemetrías</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        
        {/* Como TypeScript ya conoce el molde, ya no se quejará de 'utr' */}
        {utrs.map((utr) => (
          <div key={utr.id} style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>{utr.nsut}</h3>
            <p>ID: {utr.id}</p>
            {/* Al hacer clic, viajamos a la ruta dinámica usando el ID de esta máquina específica */}
            <button onClick={() => navigate(`/mapa/${utr.id}`)}>
              Ver Lecturas
            </button>
          </div>
        ))}

      </div>
    </div>
  );
};