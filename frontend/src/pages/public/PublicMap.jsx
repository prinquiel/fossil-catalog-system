import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import FossilCodeCopy from '../../components/fossil/FossilCodeCopy.jsx';
import { fossilService } from '../../services/fossilService.js';
import { canViewFossilCode } from '../../utils/fossilCodeVisibility.js';
import FossilPublicMap from '../../components/maps/FossilPublicMap.jsx';
import { hasValidCoords, normalizeGeoPoint } from '../../utils/geoNormalize.js';
import './PublicMap.css';

function PublicMap() {
  const { user } = useAuth();
  const showFossilCode = canViewFossilCode(user);
  const [rows, setRows] = useState([]);
  const [mapRows, setMapRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const allRes = await fossilService.getAll();
        const allPublished = (Array.isArray(allRes?.data) ? allRes.data : []).filter((f) => f.status === 'published');
        if (!mounted) return;
        const normalizedRows = allPublished.map((p) => normalizeGeoPoint(p) || p);
        const points = normalizedRows.filter((p) => hasValidCoords(p));
        setRows(normalizedRows);
        setMapRows(points);
        setSelectedId(normalizedRows[0]?.id ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const selected = useMemo(
    () => rows.find((p) => String(p.id) === String(selectedId)) || rows[0] || null,
    [rows, selectedId]
  );

  return (
    <main className="public-map-shell">
      <SiteHeader />
      <section className="public-map-hero">
        <p className="public-map-kicker">Mapa público</p>
        <h1>Georreferencia de Hallazgos Publicados</h1>
        <p>
          Visualiza la distribución de fósiles publicados en el sistema y entra al catálogo para revisar cada ficha.
        </p>
      </section>

      {loading ? (
        <section className="public-map-loading">Cargando mapa…</section>
      ) : rows.length === 0 ? (
        <section className="public-map-empty">No hay registros publicados con coordenadas disponibles.</section>
      ) : (
        <section className="public-map-layout">
          <article className="public-map-card">
            {mapRows.length > 0 ? (
              <FossilPublicMap
                points={mapRows}
                selectedId={selectedId}
                onSelectId={setSelectedId}
                height="clamp(260px, 52dvh, 460px)"
                showFossilCode={showFossilCode}
              />
            ) : (
              <p className="public-map-empty" style={{ margin: 0 }}>
                Ningún registro publicado tiene coordenadas válidas para graficar.
              </p>
            )}
          </article>
          <aside className="public-map-list">
            <h2>Registros</h2>
            <div className="public-map-list__items">
              {rows.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  className={`public-map-item ${String(selectedId) === String(r.id) ? 'is-active' : ''}${hasValidCoords(r) ? '' : ' is-disabled'}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  {showFossilCode && r.unique_code ? (
                    <span className="public-map-item__code">{r.unique_code}</span>
                  ) : null}
                  <strong>{r.name}</strong>
                  {!hasValidCoords(r) ? <em>Sin coordenadas cargadas</em> : null}
                </button>
              ))}
            </div>
            {selected ? (
              <div className="public-map-selected">
                {showFossilCode && selected.unique_code ? (
                  <div className="public-map-selected__code">
                    <FossilCodeCopy code={selected.unique_code} variant="map" />
                  </div>
                ) : null}
                <h3>{selected.name}</h3>
                <Link to="/catalog" className="public-map-link">
                  Ver detalle en catálogo
                </Link>
              </div>
            ) : null}
          </aside>
        </section>
      )}
    </main>
  );
}

export default PublicMap;
