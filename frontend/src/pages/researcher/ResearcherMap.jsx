import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import L from 'leaflet';
import { MapContainer, TileLayer, Popup, CircleMarker, useMap } from 'react-leaflet';
import { fossilService } from '../../services/fossilService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import 'leaflet/dist/leaflet.css';
import '../workspace/workspace-pages.css';

const DEFAULT_CENTER = [9.7, -84.1];
const DEFAULT_ZOOM = 7;

function MapFitBounds({ points }) {
  const map = useMap();

  const key = useMemo(() => points.map((p) => p.id).join(','), [points]);

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([Number(points[0].latitude), Number(points[0].longitude)], 8);
      return;
    }
    const latLngs = points.map((p) => L.latLng(Number(p.latitude), Number(p.longitude)));
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds.pad(0.15), { maxZoom: 12, animate: true });
  }, [map, points, key]);

  return null;
}

function ResearcherMap() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fossilService.getMap();
        if (!mounted) return;
        setPoints(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        toast.error(getApiErrorMessage(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const center =
    points.length > 0 ? [Number(points[0].latitude), Number(points[0].longitude)] : DEFAULT_CENTER;

  return (
    <div className="workspace-page">
      <p className="workspace-page__kicker">Georreferencia</p>
      <h1 className="workspace-page__title">Mapa de hallazgos</h1>
      <p className="workspace-page__lead">
        Solo aparecen fichas <strong>publicadas</strong> con latitud y longitud. La vista ajusta el encuadre
        automáticamente si los puntos están fuera de Costa Rica.
      </p>

      {loading ? (
        <p className="workspace-muted">Cargando coordenadas…</p>
      ) : points.length === 0 ? (
        <div className="workspace-card workspace-muted">
          No hay ejemplares publicados con coordenadas. Cuando existan ubicaciones aprobadas, aparecerán aquí.
        </div>
      ) : (
        <div className="workspace-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ height: 420, width: '100%' }}>
            <MapContainer center={center} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapFitBounds points={points} />
              {points.map((p) => (
                <CircleMarker
                  key={p.id}
                  center={[Number(p.latitude), Number(p.longitude)]}
                  radius={8}
                  pathOptions={{ color: '#8b1532', fillColor: '#c44d6a', fillOpacity: 0.65 }}
                >
                  <Popup>
                    <strong>{p.name}</strong>
                    <br />
                    {p.unique_code}
                    <br />
                    <Link to={`/researcher/fossil/${p.id}`}>Abrir ficha</Link>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResearcherMap;
