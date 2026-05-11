// src/pages/Mapa.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet'; // Importamos la librería base para manejar coordenadas
import 'leaflet/dist/leaflet.css';

interface Telemetria {
  id: number;
  nsut: string;
  latitude: number; // Basado en la entidad UTR
  longitude: number; // Basado en la entidad UTR
}

// Este componente es el "cerebro" que mueve la cámara
const RecalcularMapa = ({ utrs }: { utrs: Telemetria[] }) => {
  const map = useMap();

  useEffect(() => {
    if (utrs.length > 0) {
      // Creamos un área que envuelve a todos los puntos
      const bounds = L.latLngBounds(utrs.map(u => [u.latitude, u.longitude]));
      // Le decimos al mapa que se ajuste a esa área con un poco de margen (padding)
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [utrs, map]);

  return null;
};

export const Mapa = () => {
  const [utrs, setUtrs] = useState<Telemetria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUtrs = async () => {
      const token = localStorage.getItem('token');
      try {
        // Llamada a tu endpoint del backend
        const response = await fetch('http://localhost:3000/api/utrs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setUtrs(data.utrs);
      } catch (err) {
        console.error("Error al cargar UTRs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUtrs();
  }, []);

  if (isLoading) return <p>Cargando mapa...</p>;

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer 
        center={[23.6345, -102.5528]} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Componente que ajusta la vista automáticamente */}
        <RecalcularMapa utrs={utrs} />

        {utrs.map((utr) => (
          <Marker key={utr.id} position={[utr.latitude, utr.longitude]}>
            <Popup>
              <strong>{utr.nsut}</strong> <br />
              <button onClick={() => navigate(`/mapa/${utr.id}`)}>
                Ver Detalles Completos
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};