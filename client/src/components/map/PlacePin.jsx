import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';

const CATEGORY_COLOR = {
  hospital: '#F5A623',
  pharmacy: '#2DD4BF',
  police: '#5B8DEF',
  bank: '#F5A623',
  fuel: '#8B95A7',
  'fire-station': '#E5484D',
};

function buildIcon(category) {
  const color = CATEGORY_COLOR[category] || '#F5A623';
  return L.divIcon({
    className: 'safetyhub-pin',
    html: `<span style="
      display:block;
      width:16px;
      height:16px;
      border-radius:9999px;
      background:${color};
      border:2px solid #0B1220;
      box-shadow:0 0 0 2px ${color}55;
    "></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function PlacePin({ place, onSelect }) {
  return (
    <Marker
      position={[place.lat, place.lng]}
      icon={buildIcon(place.category)}
      eventHandlers={{ click: () => onSelect(place) }}
    >
      <Popup>{place.name}</Popup>
    </Marker>
  );
}
