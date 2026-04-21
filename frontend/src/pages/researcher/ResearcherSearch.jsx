import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { searchService } from '../../services/searchService';
import { geologyTaxonomyService } from '../../services/geologyTaxonomyService.js';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../workspace/workspace-pages.css';
import './researcher-pages.css';

function ResearcherSearch() {
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
      const res =
        hasAdvanced || debounced.length < 2
          ? await searchService.advancedFossils(advancedParams)
          : await searchService.searchFossils(debounced);
      setRows(Array.isArray(res?.data) ? res.data : []);
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

  return (
    <div className="workspace-page rw-animate-in">
      <p className="workspace-page__kicker">Consulta avanzada</p>
      <h1 className="workspace-page__title">Búsqueda en catálogo</h1>
      <p className="workspace-page__lead">
        Puede combinar búsqueda textual con filtros por ubicación, clasificación geológica y taxonómica.
      </p>

      <div className="workspace-card workspace-form researcher-search-card">
        <label htmlFor="search-q">Término de búsqueda</label>
        <div className="researcher-search-input-wrap">
          <span className="researcher-search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            id="search-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nombre, descripción o código"
          />
          {q ? (
            <button type="button" className="researcher-search-clear" onClick={() => setQ('')}>
              Limpiar
            </button>
          ) : null}
        </div>

        <div className="workspace-form__row" style={{ marginTop: 14 }}>
          <div>
            <label htmlFor="srch-cat">Categoría</label>
            <select id="srch-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Todas</option>
              <option value="FOS">Fósil</option>
              <option value="MIN">Mineral</option>
              <option value="ROC">Roca</option>
              <option value="PAL">Paleontológico</option>
            </select>
          </div>
          <div>
            <label htmlFor="srch-status">Estado</label>
            <select id="srch-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="published">Publicado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
        </div>

        <div className="workspace-form__row" style={{ marginTop: 14 }}>
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

        <div className="workspace-form__row" style={{ marginTop: 14 }}>
          <div>
            <label htmlFor="srch-province">Provincia (código)</label>
            <input
              id="srch-province"
              value={provinceCode}
              onChange={(e) => setProvinceCode(e.target.value)}
              placeholder="Ej. ALA / SJO / 1"
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
      </div>

      {loading && <p className="workspace-muted">Buscando…</p>}

      {!loading && hasAnyInput && rows.length === 0 && (
        <p className="workspace-muted">Sin resultados con los filtros actuales.</p>
      )}

      {rows.length > 0 && (
        <div className="workspace-table-wrap" style={{ marginTop: 16 }}>
          <table className="workspace-table">
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
                  <td>{r.unique_code}</td>
                  <td>{r.name}</td>
                  <td>{r.category || '—'}</td>
                  <td>{r.status}</td>
                  <td>
                    <Link className="workspace-link" to={`/researcher/fossil/${r.id}`}>
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ResearcherSearch;
