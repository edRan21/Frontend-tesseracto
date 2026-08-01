import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface UtrMapData {
  id: number;
  nsut: string;
  latitude: number;
  longitude: number;
}

interface Props {
  utrs: UtrMapData[];
}

const FixMapSize = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);

  return null;
};

export const UserMap = ({ utrs }: Props) => {
  return (
    <div className="user-map-container">
      <MapContainer
        center={[23.6345, -102.5528]}
        zoom={5}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <FixMapSize />

        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="OpenStreetMap"
        />

        {utrs.map((utr) => (
          <Marker key={utr.id} position={[utr.latitude, utr.longitude]}>
            <Popup>
              <strong>{utr.nsut}</strong>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};