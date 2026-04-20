import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { clientPaginate } from '../../utils/pagination.js';
import '../workspace/workspace-pages.css';

const PAGE_SIZE = 8;

function ResearcherMyStudies() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await studyService.getAll();
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

  const mine = useMemo(
    () => rows.filter((s) => String(s.researcher_id) === String(user?.id)),
    [rows, user?.id]
  );

  const {
    slice,
    totalPages,
    page: safePage,
  } = useMemo(() => clientPaginate(mine, { page, pageSize: PAGE_SIZE }), [mine, page]);

  return (
    <div className="workspace-page">
      <p className="workspace-page__kicker">Producción científica</p>
      <h1 className="workspace-page__title">Mis estudios</h1>
      <p className="workspace-page__lead">
        Estudios donde usted figura como investigador principal. El título abre la <strong>ficha del estudio</strong>; el
        enlace del fósil abre el <strong>ejemplar</strong> del catálogo.
      </p>

      {loading ? (
        <p className="workspace-muted">Cargando…</p>
      ) : mine.length === 0 ? (
        <div className="workspace-card workspace-muted">
          No hay estudios asociados a su usuario. Desde la ficha de un fósil publicado puede crear uno nuevo.
        </div>
      ) : (
        <>
          <div className="workspace-table-wrap">
            <table className="workspace-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Fósil (ejemplar)</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link className="workspace-link" to={`/researcher/study/${s.id}`}>
                        {s.title || 'Sin título'}
                      </Link>
                    </td>
                    <td>
                      <Link className="workspace-link" to={`/researcher/fossil/${s.fossil_id}`}>
                        Ver ejemplar #{s.fossil_id}
                      </Link>
                    </td>
                    <td>{s.study_date ? String(s.study_date).slice(0, 10) : '—'}</td>
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

export default ResearcherMyStudies;
