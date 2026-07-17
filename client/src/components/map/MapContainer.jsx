import { MapContainer as LeafletMap, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import PlacePin from './PlacePin.jsx';

function RecenterOnCoords({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView([coords.lat, coords.lng], map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng]);
  return null;
}

export default function MapContainer({ coords, places, onSelectPlace }) {
  const center = coords ? [coords.lat, coords.lng] : [20, 0];
  const zoom = coords ? 15 : 2;

  return (
    <LeafletMap
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {coords && <RecenterOnCoords coords={coords} />}

      {coords && (
        <CircleMarker
          center={[coords.lat, coords.lng]}
          radius={8}
          pathOptions={{ color: '#2DD4BF', fillColor: '#2DD4BF', fillOpacity: 0.9, weight: 2 }}
        />
      )}

      {places.map((place) => (
        <PlacePin key={place.id} place={place} onSelect={onSelectPlace} />
      ))}
    </LeafletMap>
  );
}
