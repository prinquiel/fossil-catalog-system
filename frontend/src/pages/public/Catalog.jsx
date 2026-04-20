import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import FossilMediaGallery from '../../components/fossil/FossilMediaGallery.jsx';
import FossilMiniMap from '../../components/maps/FossilMiniMap.jsx';
import FossilPublicMap from '../../components/maps/FossilPublicMap.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { fossilService } from '../../services/fossilService';
import { hasValidCoords, normalizeGeoPoint } from '../../utils/geoNormalize.js';
import './Catalog.css';

const categoryLabels = {
  FOS: 'Fósil',
  MIN: 'Mineral',
  ROC: 'Roca',
  PAL: 'Paleontológico',
};

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha';
  return parsed.toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

function Catalog() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [allFossils, setAllFossils] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await fossilService.getAll();
        const records = (Array.isArray(response?.data) ? response.data : []).filter(
          (item) => item.status === 'published'
        );

        if (isMounted) {
          setAllFossils(records);
          setSelectedId(records[0]?.id ?? null);
          if (records.length === 0) {
            setErrorMessage(
              'Aún no hay hallazgos publicados. Cuando el equipo editorial publique nuevas fichas, aparecerán aquí.'
            );
          }
        }
      } catch {
        if (isMounted) {
          setAllFossils([]);
          setSelectedId(null);
          setErrorMessage('No se pudo conectar al servidor. Compruebe que la API esté en ejecución y vuelva a intentar.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFossils = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const base = allFossils.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.name?.toLowerCase().includes(normalizedQuery) ||
        item.unique_code?.toLowerCase().includes(normalizedQuery) ||
        item.description?.toLowerCase().includes(normalizedQuery);

      const matchesCategory = category === 'all' || item.category === category;
      return matchesQuery && matchesCategory;
    });

    const sorted = [...base];
    if (sortBy === 'name') {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'));
      return sorted;
    }

    sorted.sort((a, b) => {
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();
      return bDate - aDate;
    });
    return sorted;
  }, [allFossils, category, query, sortBy]);

  const selectedFossil = useMemo(
    () => filteredFossils.find((item) => item.id === selectedId) || filteredFossils[0] || null,
    [filteredFossils, selectedId]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash || '';
    if (!hash.startsWith('#fossil-')) return;
    const hashId = hash.replace('#fossil-', '').trim();
    if (!hashId) return;
    const exists = filteredFossils.find((item) => String(item.id) === hashId);
    if (exists) setSelectedId(exists.id);
  }, [filteredFossils]);

  const normalizedFiltered = useMemo(
    () => filteredFossils.map((item) => normalizeGeoPoint(item) || item),
    [filteredFossils]
  );

  const stats = useMemo(() => {
    const total = filteredFossils.length;
    const withImages = filteredFossils.filter((item) => Number(item.media_count) > 0).length;
    const withCoords = filteredFossils.filter((item) => hasValidCoords(item)).length;
    const categories = new Set(filteredFossils.map((item) => item.category)).size;
    return { total, withImages, withCoords, categories };
  }, [filteredFossils]);

  const selectedHasCoords =
    selectedFossil != null &&
    hasValidCoords(selectedFossil);

  const selectedForMap = normalizeGeoPoint(selectedFossil);

  const mapPoints = useMemo(
    () => normalizedFiltered.filter((item) => hasValidCoords(item)),
    [normalizedFiltered]
  );

  return (
    <main className="catalog-shell">
      <SiteHeader />

      <header className="catalog-hero">
        <p className="catalog-kicker">Archivo Paleontológico</p>
        <h1>Catálogo Público de Hallazgos</h1>
        <p className="catalog-subtitle">
          Exploración curada de piezas fósiles publicadas, con visualización de imágenes, contexto científico y
          georreferencia.
        </p>
        {!authLoading && !isAuthenticated && (
          <div className="catalog-hero-actions">
            <Link className="catalog-btn solid" to="/">
              Volver al inicio
            </Link>
            <Link className="catalog-btn ghost" to="/register">
              Crear cuenta
            </Link>
          </div>
        )}
      </header>

      <section className="catalog-toolbar" aria-label="Filtros de catálogo">
        <label>
          Búsqueda inteligente
          <div className="catalog-search-control">
            <span aria-hidden="true">⌕</span>
            <input
              type="text"
              className="catalog-search-control__input"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre, código o descripción"
            />
          </div>
        </label>

        <label>
          Categoría
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Todas las categorías</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Orden
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="recent">Más recientes</option>
            <option value="name">Nombre A-Z</option>
          </select>
        </label>

        {query.trim() && (
          <button type="button" className="catalog-clear-btn" onClick={() => setQuery('')}>
            Limpiar búsqueda
          </button>
        )}
      </section>

      <section className="catalog-stats" aria-label="Resumen de resultados">
        <article>
          <p>Total</p>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <p>Con fotografías</p>
          <strong>{stats.withImages}</strong>
        </article>
        <article>
          <p>Con ubicación</p>
          <strong>{stats.withCoords}</strong>
        </article>
        <article>
          <p>Categorías</p>
          <strong>{stats.categories}</strong>
        </article>
      </section>

      <section className="catalog-map-overview" aria-label="Mapa general del catálogo">
        <div className="catalog-map-overview__head">
          <p className="catalog-kicker">Mapa general</p>
          <h2>Distribución de registros publicados</h2>
          <p>
            Selecciona un punto para enfocar su ficha, o abre la vista de mapa completa para navegación geográfica.
          </p>
          <Link to="/map" className="catalog-btn ghost">
            Abrir mapa completo
          </Link>
        </div>
        {mapPoints.length > 0 ? (
          <FossilPublicMap points={mapPoints} selectedId={selectedFossil?.id} onSelectId={setSelectedId} height={290} />
        ) : (
          <p className="catalog-map-overview__empty">No hay coordenadas disponibles en los resultados actuales.</p>
        )}
      </section>

      {errorMessage && <p className="catalog-notice">{errorMessage}</p>}

      {isLoading ? (
        <section className="catalog-loading">
          <div />
          <div />
          <div />
        </section>
      ) : (
        <section className="catalog-grid">
          <div className="catalog-list" role="list" aria-label="Resultados del catálogo">
            {filteredFossils.length === 0 && (
              <article className="catalog-empty">
                <h2>No hay coincidencias</h2>
                <p>Ajusta tus filtros para encontrar registros disponibles.</p>
              </article>
            )}

            {filteredFossils.map((item) => (
              <article
                key={item.id}
                id={`fossil-${item.id}`}
                className={item.id === selectedFossil?.id ? 'fossil-card active' : 'fossil-card'}
                role="listitem"
                tabIndex={0}
                onClick={() => setSelectedId(item.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedId(item.id);
                  }
                }}
              >
                <p className="fossil-card-code">{item.unique_code || 'Código pendiente'}</p>
                <h2>{item.name || 'Sin nombre'}</h2>
                <p className="fossil-card-description">
                  {item.description || 'Sin descripción disponible en este registro.'}
                </p>
                <div className="fossil-card-meta">
                  <span>{categoryLabels[item.category] || item.category || 'Sin categoría'}</span>
                  <span>{formatDate(item.discovery_date)}</span>
                </div>
              </article>
            ))}
          </div>

          <aside className="catalog-detail" aria-live="polite">
            {selectedFossil ? (
              <>
                <p className="detail-code">{selectedFossil.unique_code || 'Sin código'}</p>
                <h2>{selectedFossil.name || 'Sin nombre'}</h2>
                <p className="detail-description">
                  {selectedFossil.description || 'Sin descripción para este registro.'}
                </p>
                <dl>
                  <div>
                    <dt>Tipo</dt>
                    <dd>
                      {categoryLabels[selectedFossil.category] || selectedFossil.category || 'No definido'}
                    </dd>
                  </div>
                  <div>
                    <dt>Estado</dt>
                    <dd>Publicado</dd>
                  </div>
                  <div>
                    <dt>Fecha de descubrimiento</dt>
                    <dd>{formatDate(selectedFossil.discovery_date)}</dd>
                  </div>
                  <div>
                    <dt>Contexto geológico</dt>
                    <dd>{selectedFossil.geological_context || 'Sin contexto registrado'}</dd>
                  </div>
                  <div className="catalog-detail-media">
                    <dt>Fotografías</dt>
                    <dd>
                      <FossilMediaGallery fossilId={selectedFossil.id} title={null} />
                    </dd>
                  </div>
                </dl>
                {selectedHasCoords ? (
                  <div className="catalog-detail-map">
                    <p className="catalog-detail-map__label">Mapa del hallazgo</p>
                    <FossilMiniMap
                      latitude={selectedForMap?.latitude}
                      longitude={selectedForMap?.longitude}
                      countryCode={selectedFossil?.country_code}
                      provinceCode={selectedFossil?.province_code}
                      cantonCode={selectedFossil?.canton_code}
                      title={selectedFossil.name}
                      subtitle={selectedFossil.unique_code}
                    />
                  </div>
                ) : (
                  <p className="catalog-detail-footnote">
                    Este registro no tiene coordenadas públicas asociadas para visualizar un punto en el mapa.
                  </p>
                )}
              </>
            ) : (
              <p className="detail-empty">Selecciona una ficha para visualizar su detalle.</p>
            )}
          </aside>
        </section>
      )}
    </main>
  );
}

export default Catalog;
