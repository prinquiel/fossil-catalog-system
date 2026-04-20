import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { searchService } from '../../services/searchService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../workspace/workspace-pages.css';
import './researcher-pages.css';

function ResearcherSearch() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const run = useCallback(async () => {
    if (debounced.length < 2) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const res = await searchService.searchFossils(debounced);
      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <div className="workspace-page rw-animate-in">
      <p className="workspace-page__kicker">Consulta avanzada</p>
      <h1 className="workspace-page__title">Búsqueda en catálogo</h1>
      <p className="workspace-page__lead">
        Búsqueda por coincidencia en nombre, descripción o código. Escriba al menos dos caracteres; la
        consulta se envía automáticamente al detener la escritura.
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
            placeholder="Ej. amonita, código CRI…"
          />
          {q ? (
            <button type="button" className="researcher-search-clear" onClick={() => setQ('')}>
              Limpiar
            </button>
          ) : null}
        </div>
      </div>

      {loading && <p className="workspace-muted">Buscando…</p>}

      {!loading && debounced.length >= 2 && rows.length === 0 && (
        <p className="workspace-muted">Sin resultados para «{debounced}».</p>
      )}

      {rows.length > 0 && (
        <div className="workspace-table-wrap" style={{ marginTop: 16 }}>
          <table className="workspace-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.unique_code}</td>
                  <td>{r.name}</td>
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
