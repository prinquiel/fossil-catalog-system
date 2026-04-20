import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fossilService } from '../../services/fossilService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { clientPaginate } from '../../utils/pagination.js';
import { FOSSIL_CATEGORIES } from '../../constants/fossilMeta.js';
import '../workspace/workspace-pages.css';

const PAGE_SIZE = 10;

function ResearcherCatalog() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fossilService.getAll();
        if (!mounted) return;
        setRows(Array.isArray(res?.data) ? res.data : []);
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

  const published = useMemo(() => rows.filter((f) => f.status === 'published'), [rows]);
  const {
    slice,
    totalPages,
    page: safePage,
  } = useMemo(() => clientPaginate(published, { page, pageSize: PAGE_SIZE }), [published, page]);

  const catLabel = (v) => FOSSIL_CATEGORIES.find((c) => c.value === v)?.label || v;

  return (
    <div className="workspace-page">
      <p className="workspace-page__kicker">Archivo</p>
      <h1 className="workspace-page__title">Catálogo de trabajo</h1>
      <p className="workspace-page__lead">
        Solo se listan fichas en estado publicado, aptas para citación y nuevos estudios.
      </p>

      {loading ? (
        <p className="workspace-muted">Cargando…</p>
      ) : published.length === 0 ? (
        <div className="workspace-card workspace-muted">No hay registros publicados aún.</div>
      ) : (
        <>
          <div className="workspace-table-wrap">
            <table className="workspace-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {slice.map((f) => (
                  <tr key={f.id}>
                    <td>{f.unique_code}</td>
                    <td>{f.name}</td>
                    <td>{catLabel(f.category)}</td>
                    <td>
                      <Link className="workspace-link" to={`/researcher/fossil/${f.id}`}>
                        Abrir ficha
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="workspace-pager">
              <button
                type="button"
                className="workspace-btn workspace-btn--ghost"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span>
                Página {safePage} de {totalPages}
              </span>
              <button
                type="button"
                className="workspace-btn workspace-btn--ghost"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ResearcherCatalog;
