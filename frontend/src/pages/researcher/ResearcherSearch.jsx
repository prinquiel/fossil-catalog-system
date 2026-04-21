import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { searchService } from '../../services/searchService';
import { geologyTaxonomyService } from '../../services/geologyTaxonomyService.js';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWorkspaceNav } from '../../context/WorkspaceNavContext.jsx';
import { FOSSIL_CATEGORIES, FOSSIL_STATUS_LABELS } from '../../constants/fossilMeta.js';
import '../workspace/workspace-pages.css';
import './researcher-pages.css';

function SearchIcon() {
  return (
    <svg className="rw-search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function ResearcherSearch() {
  const { isAdmin } = useAuth();
  const { res } = useWorkspaceNav();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [eraId, setEraId] = useState('');
  const [periodId, setPeriodId] = useState('');
  const [speciesId, setSpeciesId] = useState('');
  const [eraOptions, setEraOptions] = useState([]);
  const [periodOptions, setPeriodOptions] = useState([]);
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!isAdmin && status === 'rejected') setStatus('');
  }, [isAdmin, status]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      geologyTaxonomyService.getEras(),
      geologyTaxonomyService.getAllPeriods(),
      geologyTaxonomyService.getAllSpecies(),
    ]).then(([er, pr, sp]) => {
      if (!mounted) return;
      if (er?.success && Array.isArray(er.data)) setEraOptions(er.data);
      if (pr?.success && Array.isArray(pr.data)) setPeriodOptions(pr.data);
      if (sp?.success && Array.isArray(sp.data)) setSpeciesOptions(sp.data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredPeriods = useMemo(() => {
    if (!eraId) return periodOptions;
    return periodOptions.filter((p) => String(p.era_id) === String(eraId));
  }, [eraId, periodOptions]);

  const hasAnyInput = Boolean(
    debounced.length >= 2 || category || status || provinceCode.trim() || eraId || periodId || speciesId
  );

  const run = useCallback(async () => {
    const hasAdvanced = Boolean(category || status || provinceCode.trim() || eraId || periodId || speciesId);
    if (!hasAdvanced && debounced.length < 2) {
      setRows([]);
      return;
    }

    const advancedParams = {
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
      ...(provinceCode.trim() ? { province_code: provinceCode.trim() } : {}),
      ...(eraId ? { era_id: eraId } : {}),
      ...(periodId ? { period_id: periodId } : {}),
      ...(speciesId ? { species_id: speciesId } : {}),
      ...(debounced.length >= 2 ? { name: debounced } : {}),
    };

    setLoading(true);
    try {
      const resSearch =
        hasAdvanced || debounced.length < 2
          ? await searchService.advancedFossils(advancedParams)
          : await searchService.searchFossils(debounced);
      setRows(Array.isArray(resSearch?.data) ? resSearch.data : []);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [category, status, provinceCode, eraId, periodId, speciesId, debounced]);

  useEffect(() => {
    run();
  }, [run]);

  const categoryLabel = useMemo(() => {
    const m = Object.fromEntries(FOSSIL_CATEGORIES.map((c) => [c.value, c.label]));
    return (code) => m[code] || code || '—';
  }, []);

  const statusLabel = (s) => FOSSIL_STATUS_LABELS[s] || s || '—';

  return (
    <div className="workspace-page workspace-page--search rw-search-page rw-animate-in">
      <header className="rw-search-hero">
        <p className="rw-search-hero__eyebrow">Consultas</p>
        <h1 className="rw-search-hero__title">Búsqueda en catálogo</h1>
      </header>

      <section className="rw-search-shell" aria-label="Criterios de búsqueda">
        <div className="rw-search-primary">
          <label className="rw-search-field-label" htmlFor="search-q">
            Término de búsqueda
          </label>
          <div className="rw-search-input-shell">
            <SearchIcon />
            <input
              id="search-q"
              className="rw-search-input"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nombre, descripción o código único"
              autoComplete="off"
            />
            {q ? (
              <button type="button" className="rw-search-clear" onClick={() => setQ('')}>
                Limpiar
              </button>
            ) : null}
          </div>
        </div>

        <div className="rw-search-results rw-search-results--in-shell" aria-live="polite">
          {loading && (
            <p className="rw-search-results__state">
              <span className="rw-search-results__pulse" aria-hidden />
              Buscando en el catálogo…
            </p>
          )}

          {!loading && hasAnyInput && rows.length === 0 && (
            <p className="rw-search-results__state rw-search-results__state--muted">
              No hay fichas que coincidan con estos criterios. Pruebe a relajar filtros o acortar el texto.
            </p>
          )}

          {!loading && !hasAnyInput && (
            <p className="rw-search-results__state rw-search-results__state--muted">
              Escriba en el buscador o elija al menos un filtro para ver resultados.
            </p>
          )}

          {rows.length > 0 && (
            <div className="rw-search-table-wrap">
              <table className="rw-search-table workspace-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Estado</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span className="rw-search-table__code">{r.unique_code}</span>
                      </td>
                      <td>{r.name}</td>
                      <td>{categoryLabel(r.category)}</td>
                      <td>{statusLabel(r.status)}</td>
                      <td>
                        <Link className="workspace-link rw-search-table__link" to={res(`/fossil/${r.id}`)}>
                          Ver ficha
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rw-search-divider" role="presentation" />

        <div className="rw-search-filters">
          <h2 className="rw-search-filters__heading">Refinar resultados</h2>
          <p className="rw-search-filters__sub">Opcional — puede usar solo filtros, solo texto, o ambos.</p>

          <div className="rw-search-filter-groups">
            <fieldset className="rw-search-group">
              <legend className="rw-search-group__legend">Pieza y estado</legend>
              <div className="rw-search-group__grid">
                <div>
                  <label htmlFor="srch-cat">Categoría</label>
                  <select id="srch-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Todas</option>
                    {FOSSIL_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="srch-status">Estado editorial</label>
                  <select id="srch-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="pending">En revisión</option>
                    <option value="published">Publicado</option>
                    {isAdmin ? <option value="rejected">Rechazado (solo administración)</option> : null}
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="rw-search-group">
              <legend className="rw-search-group__legend">Marcador temporal</legend>
              <div className="rw-search-group__grid">
                <div>
                  <label htmlFor="srch-era">Era geológica</label>
                  <select
                    id="srch-era"
                    value={eraId}
                    onChange={(e) => {
                      setEraId(e.target.value);
                      setPeriodId('');
                    }}
                  >
                    <option value="">Todas</option>
                    {eraOptions.map((er) => (
                      <option key={er.id} value={String(er.id)}>
                        {er.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="srch-period">Período</label>
                  <select id="srch-period" value={periodId} onChange={(e) => setPeriodId(e.target.value)}>
                    <option value="">Todos</option>
                    {filteredPeriods.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="rw-search-group">
              <legend className="rw-search-group__legend">Ubicación y taxón</legend>
              <div className="rw-search-group__grid">
                <div>
                  <label htmlFor="srch-province">Provincia (código)</label>
                  <input
                    id="srch-province"
                    value={provinceCode}
                    onChange={(e) => setProvinceCode(e.target.value)}
                    placeholder="Ej. ALA, SJO, 1"
                  />
                </div>
                <div>
                  <label htmlFor="srch-species">Especie</label>
                  <select id="srch-species" value={speciesId} onChange={(e) => setSpeciesId(e.target.value)}>
                    <option value="">Todas</option>
                    {speciesOptions.map((sp) => (
                      <option key={sp.id} value={String(sp.id)}>
                        {sp.name}
                        {sp.common_name ? ` (${sp.common_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ResearcherSearch;
