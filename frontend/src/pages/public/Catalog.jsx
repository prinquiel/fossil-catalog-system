import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import FossilMediaGallery from '../../components/fossil/FossilMediaGallery.jsx';
import FossilMiniMap from '../../components/maps/FossilMiniMap.jsx';
import FossilPublicMap from '../../components/maps/FossilPublicMap.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import FossilCodeCopy from '../../components/fossil/FossilCodeCopy.jsx';
import { canViewFossilCode } from '../../utils/fossilCodeVisibility.js';
import { fossilService } from '../../services/fossilService';
import { studyService } from '../../services/studyService';
import { geologyTaxonomyService } from '../../services/geologyTaxonomyService';
import { mediaService } from '../../services/mediaService';
import { mediaFileUrlCandidates } from '../../utils/mediaUrl.js';
import { hasValidCoords, normalizeGeoPoint } from '../../utils/geoNormalize.js';
import { clientPaginate } from '../../utils/pagination.js';
import './Catalog.css';

const categoryLabels = {
  FOS: 'Fósil',
  MIN: 'Mineral',
  ROC: 'Roca',
  PAL: 'Paleontológico',
};
const PAGE_SIZE = 12;

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
  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const showFossilCode = canViewFossilCode(user);
  const [allFossils, setAllFossils] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [locationQuery, setLocationQuery] = useState('');
  const [eraFilter, setEraFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [eraOptions, setEraOptions] = useState([]);
  const [allPeriods, setAllPeriods] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [coverByFossilId, setCoverByFossilId] = useState({});
  const [detailHeroBroken, setDetailHeroBroken] = useState(false);
  /** @type {null | { loading?: boolean, error?: boolean, published?: unknown[] }} */
  const [fossilStudies, setFossilStudies] = useState(null);
  const closeButtonRef = useRef(null);

  const closeDetail = () => setSelectedId(null);

  useEffect(() => {
    let m = true;
    Promise.all([geologyTaxonomyService.getEras(), geologyTaxonomyService.getAllPeriods()]).then(([er, pr]) => {
      if (!m) return;
      if (er?.success && Array.isArray(er.data)) setEraOptions(er.data);
      if (pr?.success && Array.isArray(pr.data)) setAllPeriods(pr.data);
    });
    return () => {
      m = false;
    };
  }, []);

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
          setSelectedId(null);
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
    const normalizedLocation = locationQuery.trim().toLowerCase();

    const base = allFossils.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.name?.toLowerCase().includes(normalizedQuery) ||
        (showFossilCode && item.unique_code?.toLowerCase().includes(normalizedQuery)) ||
        item.description?.toLowerCase().includes(normalizedQuery);

      const matchesCategory = category === 'all' || item.category === category;
      const matchesEra = eraFilter === 'all' || String(item.era_id) === eraFilter;
      const matchesPeriod = periodFilter === 'all' || String(item.period_id) === periodFilter;
      const locationRaw = [item.country_code, item.province_code, item.canton_code, item.location_description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesLocation =
        normalizedLocation.length === 0 ||
        locationRaw.includes(normalizedLocation);
      return matchesQuery && matchesCategory && matchesEra && matchesPeriod && matchesLocation;
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
  }, [allFossils, category, query, sortBy, eraFilter, periodFilter, showFossilCode, locationQuery]);

  useEffect(() => {
    setPage(1);
  }, [query, category, sortBy, eraFilter, periodFilter, locationQuery]);

  const paged = useMemo(
    () => clientPaginate(filteredFossils, { page, pageSize: PAGE_SIZE }),
    [filteredFossils, page]
  );
  const pagedFossils = paged.slice;

  useEffect(() => {
    let cancelled = false;
    const list = pagedFossils;
    if (list.length === 0) {
      setCoverByFossilId({});
      return undefined;
    }
    (async () => {
      const entries = await Promise.all(
        list.map(async (f) => {
          if (Number(f.media_count) === 0) return [f.id, []];
          try {
            const res = await mediaService.getByFossil(f.id);
            const first = Array.isArray(res?.data) ? res.data[0] : null;
            return [f.id, first?.file_path ? mediaFileUrlCandidates(first.file_path) : []];
          } catch {
            return [f.id, []];
          }
        })
      );
      if (!cancelled) setCoverByFossilId(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [pagedFossils]);

  const periodOptionsForToolbar = useMemo(() => {
    if (eraFilter === 'all') return allPeriods;
    return allPeriods.filter((p) => String(p.era_id) === eraFilter);
  }, [allPeriods, eraFilter]);

  const selectedFossil = useMemo(() => {
    if (selectedId == null) return null;
    return filteredFossils.find((item) => item.id === selectedId) ?? null;
  }, [filteredFossils, selectedId]);

  useEffect(() => {
    if (selectedId == null) return;
    const stillVisible = filteredFossils.some((item) => item.id === selectedId);
    if (!stillVisible) setSelectedId(null);
  }, [filteredFossils, selectedId]);

  useEffect(() => {
    setDetailHeroBroken(false);
  }, [selectedFossil?.id]);

  useEffect(() => {
    if (selectedFossil?.id == null) {
      setFossilStudies(null);
      return undefined;
    }
    let cancelled = false;
    setFossilStudies({ loading: true });
    studyService
      .getPublicByFossil(selectedFossil.id)
      .then((res) => {
        if (cancelled) return;
        if (res?.success && res.data && typeof res.data === 'object') {
          setFossilStudies({
            loading: false,
            published: Array.isArray(res.data.published) ? res.data.published : [],
          });
        } else {
          setFossilStudies({ loading: false, error: true });
        }
      })
      .catch(() => {
        if (!cancelled) setFossilStudies({ loading: false, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedFossil?.id]);

  useEffect(() => {
    if (!selectedFossil) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = window.setTimeout(() => closeButtonRef.current?.focus(), 50);
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedFossil]);

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

  const catalogStudiesMarkup = useMemo(() => {
    if (!fossilStudies || fossilStudies.loading || fossilStudies.error) return null;
    const published = fossilStudies.published || [];
    if (published.length === 0) {
      return (
        <p className="catalog-studies-hint">
          No hay estudios científicos publicados para este ejemplar todavía.
        </p>
      );
    }
    return (
      <section className="catalog-studies" aria-label="Estudios científicos">
        <h3 className="catalog-studies__title">Estudios científicos</h3>
        <ul className="catalog-studies-titles">
          {published.map((st) => (
            <li key={st.id}>
              <Link to={`/catalog/estudio/${st.id}`} className="catalog-study-title-link">
                {st.title || 'Estudio sin título'}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }, [fossilStudies]);

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

        <label>
          Era geológica
          <select
            value={eraFilter}
            onChange={(e) => {
              setEraFilter(e.target.value);
              setPeriodFilter('all');
            }}
          >
            <option value="all">Todas</option>
            {eraOptions.map((er) => (
              <option key={er.id} value={String(er.id)}>
                {er.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Período
          <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
            <option value="all">Todos</option>
            {periodOptionsForToolbar.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ubicación
          <input
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            placeholder="Provincia, cantón o descripción"
          />
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
          <FossilPublicMap
            points={mapPoints}
            selectedId={selectedFossil?.id}
            onSelectId={setSelectedId}
            height="clamp(220px, 40dvh, 290px)"
            showFossilCode={showFossilCode}
          />
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

            {pagedFossils.map((item) => {
              const cover = coverByFossilId[item.id];
              const hasCover = Array.isArray(cover) && cover.length > 0;
              return (
                <article
                  key={item.id}
                  id={`fossil-${item.id}`}
                  className={
                    item.id === selectedId
                      ? 'fossil-card fossil-card--visual fossil-card--compact active'
                      : 'fossil-card fossil-card--visual fossil-card--compact'
                  }
                  role="listitem"
                  aria-label={`${item.name || 'Hallazgo'}. Pulsa para ver la ficha completa.`}
                  tabIndex={0}
                  onClick={() => setSelectedId(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedId(item.id);
                    }
                  }}
                >
                  <div className="fossil-card__visual">
                    {hasCover ? (
                      <img
                        src={cover[0]}
                        alt={item.name ? `Vista previa: ${item.name}` : 'Vista previa del hallazgo'}
                        className="fossil-card__thumb"
                        loading="lazy"
                        onError={(event) => {
                          const options = cover || [];
                          const current = event.currentTarget.getAttribute('src') || '';
                          const idx = options.findIndex((u) => u === current);
                          const nextUrl = idx >= 0 ? options[idx + 1] : options[1];
                          if (nextUrl) event.currentTarget.setAttribute('src', nextUrl);
                          else event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="fossil-card__placeholder" aria-hidden="true" />
                    )}
                  </div>
                  <div className="fossil-card__body">
                    <h2 className="fossil-card__title">{item.name || 'Sin nombre'}</h2>
                    <p className="fossil-card-minimal">
                      {showFossilCode && item.unique_code ? (
                        <>
                          <FossilCodeCopy code={item.unique_code} variant="card" />
                          <span className="fossil-card-minimal__sep" aria-hidden="true">
                            ·
                          </span>
                        </>
                      ) : null}
                      <span>{categoryLabels[item.category] || item.category || '—'}</span>
                    </p>
                    <p className="fossil-card-minimal">
                      <Link to={`/fossil/${item.id}`}>Abrir ficha</Link>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
      {!isLoading && paged.totalPages > 1 ? (
        <section className="catalog-pager" aria-label="Paginación">
          <button
            type="button"
            className="catalog-btn ghost"
            disabled={paged.page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Anterior
          </button>
          <p>
            Página {paged.page} de {paged.totalPages}
          </p>
          <button
            type="button"
            className="catalog-btn ghost"
            disabled={paged.page >= paged.totalPages}
            onClick={() => setPage((prev) => Math.min(paged.totalPages, prev + 1))}
          >
            Siguiente
          </button>
        </section>
      ) : null}

      {typeof document !== 'undefined' &&
        selectedFossil &&
        createPortal(
          <div
            className="catalog-modal-backdrop"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeDetail();
            }}
          >
            <div
              className="catalog-detail catalog-modal-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="catalog-detail-heading"
            >
              <button
                ref={closeButtonRef}
                type="button"
                className="catalog-modal-close"
                aria-label="Cerrar ficha del hallazgo"
                onClick={closeDetail}
              >
                Cerrar{' '}
                <span className="catalog-modal-close__x" aria-hidden="true">
                  ×
                </span>
              </button>
              <div className="catalog-detail__hero">
                {(() => {
                  const urls = coverByFossilId[selectedFossil.id];
                  const hasCover = Array.isArray(urls) && urls.length > 0 && !detailHeroBroken;
                  if (hasCover) {
                    return (
                      <img
                        src={urls[0]}
                        alt={
                          selectedFossil.name
                            ? `Fotografía principal del hallazgo «${selectedFossil.name}»`
                            : 'Fotografía principal del hallazgo'
                        }
                        className="catalog-detail__hero-img"
                        onError={(event) => {
                          const options = urls || [];
                          const current = event.currentTarget.getAttribute('src') || '';
                          const idx = options.findIndex((u) => u === current);
                          const nextUrl = idx >= 0 ? options[idx + 1] : options[1];
                          if (nextUrl) event.currentTarget.setAttribute('src', nextUrl);
                          else setDetailHeroBroken(true);
                        }}
                      />
                    );
                  }
                  return <div className="catalog-detail__hero-fallback" aria-hidden="true" />;
                })()}
              </div>
              <div className="catalog-detail__inner">
                {showFossilCode && selectedFossil.unique_code ? (
                  <div className="detail-code detail-code--with-copy">
                    <FossilCodeCopy code={selectedFossil.unique_code} variant="detail" />
                  </div>
                ) : null}
                <h2 className="catalog-detail__title" id="catalog-detail-heading">
                  {selectedFossil.name || 'Sin nombre'}
                </h2>
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
                  <div>
                    <dt>Era</dt>
                    <dd>{selectedFossil.era_name || '—'}</dd>
                  </div>
                  <div>
                    <dt>Período</dt>
                    <dd>{selectedFossil.period_name || '—'}</dd>
                  </div>
                  <div>
                    <dt>Clasificación taxonómica</dt>
                    <dd>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                        <li>Reino: {selectedFossil.kingdom_name || '—'}</li>
                        <li>Filo: {selectedFossil.phylum_name || '—'}</li>
                        <li>Clase: {selectedFossil.class_name || '—'}</li>
                        <li>Orden: {selectedFossil.order_name || '—'}</li>
                        <li>Familia: {selectedFossil.family_name || '—'}</li>
                        <li>Género: {selectedFossil.genus_name || '—'}</li>
                        <li>Especie: {selectedFossil.species_name || '—'}</li>
                      </ul>
                    </dd>
                  </div>
                  <div className="catalog-detail-media">
                    <dt>Más fotografías</dt>
                    <dd>
                      <FossilMediaGallery fossilId={selectedFossil.id} title={null} />
                    </dd>
                  </div>
                </dl>

                {fossilStudies?.loading ? (
                  <p className="catalog-studies-hint">Cargando estudios científicos…</p>
                ) : (
                  catalogStudiesMarkup
                )}
                <p className="catalog-detail-footnote">
                  <Link to={`/fossil/${selectedFossil.id}`}>Abrir ficha</Link>
                </p>
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
                      subtitle={showFossilCode ? selectedFossil.unique_code : undefined}
                    />
                  </div>
                ) : (
                  <p className="catalog-detail-footnote">
                    Este registro no tiene coordenadas públicas asociadas para visualizar un punto en el mapa.
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </main>
  );
}

export default Catalog;
