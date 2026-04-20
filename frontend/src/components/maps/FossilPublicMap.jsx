import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './FossilPublicMap.css';

const DEFAULT_CENTER = [9.7, -84.1];
const DEFAULT_ZOOM = 7;

function FitBounds({ points }) {
  const map = useMap();
  const key = useMemo(() => points.map((p) => p.id).join(','), [points]);

  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView([Number(points[0].latitude), Number(points[0].longitude)], 9);
      return;
    }
    const bounds = points.map((p) => [Number(p.latitude), Number(p.longitude)]);
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12, animate: true });
  }, [map, points, key]);

  return null;
}

/**
 * @param {{
 * points: Array<{id:number|string, name:string, unique_code?:string, latitude:number|string, longitude:number|string}>,
 * selectedId?: number|string|null,
 * onSelectId?: (id:number|string)=>void,
 * height?: number
 * }} props
 */
export default function FossilPublicMap({ points, selectedId = null, onSelectId, height = 320 }) {
  const normalizedPoints = Array.isArray(points)
    ? points.filter((p) => p?.latitude != null && p?.longitude != null)
    : [];

  if (!normalizedPoints.length) return null;

  const center = [Number(normalizedPoints[0].latitude), Number(normalizedPoints[0].longitude)];

  return (
    <div className="fossil-public-map" style={{ height }}>
      <MapContainer center={center || DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="fossil-public-map__leaflet">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={normalizedPoints} />
        {normalizedPoints.map((p) => {
          const isActive = String(p.id) === String(selectedId);
          return (
            <CircleMarker
              key={p.id}
              center={[Number(p.latitude), Number(p.longitude)]}
              radius={isActive ? 11 : 8}
              pathOptions={{
                color: isActive ? '#6f0f26' : '#8b1532',
                fillColor: isActive ? '#d55d79' : '#c44d6a',
                fillOpacity: isActive ? 0.85 : 0.7,
                weight: 2,
              }}
              eventHandlers={onSelectId ? { click: () => onSelectId(p.id) } : undefined}
            >
              <Popup>
                <strong>{p.name}</strong>
                <br />
                {p.unique_code || 'Registro'}
                <br />
                <Link to={`/catalog#fossil-${p.id}`}>Ver en catálogo</Link>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
