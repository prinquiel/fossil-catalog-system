import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { normalizeGeoPoint } from '../../utils/geoNormalize.js';

/**
 * Mapa embebido para una sola ficha (coordenadas WGS84).
 * @param {{
 * latitude: number | string | null;
 * longitude: number | string | null;
 * countryCode?: string | null;
 * provinceCode?: string | null;
 * cantonCode?: string | null;
 * title?: string;
 * subtitle?: string;
 * }} props
 */
export default function FossilMiniMap({
  latitude,
  longitude,
  countryCode = null,
  provinceCode = null,
  cantonCode = null,
  title,
  subtitle,
}) {
  const normalized = normalizeGeoPoint({
    latitude,
    longitude,
    country_code: countryCode,
    province_code: provinceCode,
    canton_code: cantonCode,
  });
  const lat = Number(normalized?.latitude);
  const lng = Number(normalized?.longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  function RecenterOnChange({ nextLat, nextLng }) {
    const map = useMap();
    useEffect(() => {
      map.setView([nextLat, nextLng], map.getZoom(), { animate: true });
    }, [map, nextLat, nextLng]);
    return null;
  }

  return (
    <div className="fossil-mini-map" aria-label="Mapa del hallazgo">
      <MapContainer
        center={[lat, lng]}
        zoom={11}
        className="fossil-mini-map__leaflet"
        scrollWheelZoom={false}
        dragging
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterOnChange nextLat={lat} nextLng={lng} />
        <CircleMarker
          center={[lat, lng]}
          radius={12}
          pathOptions={{ color: '#8b1532', fillColor: '#c44d6a', fillOpacity: 0.72, weight: 2 }}
        >
          {(title || subtitle) && (
            <Popup>
              {title ? <strong>{title}</strong> : null}
              {subtitle ? (
                <>
                  {title ? <br /> : null}
                  {subtitle}
                </>
              ) : null}
            </Popup>
          )}
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
