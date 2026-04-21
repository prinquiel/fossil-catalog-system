import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWorkspaceNav } from '../../context/WorkspaceNavContext.jsx';
import { fossilService } from '../../services/fossilService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { clientPaginate } from '../../utils/pagination.js';
import { FOSSIL_CATEGORIES, FOSSIL_STATUS_LABELS } from '../../constants/fossilMeta.js';
import { WorkspaceBackNav } from '../../components/workspace/WorkspaceBackNav.jsx';
import '../workspace/workspace-pages.css';

const PAGE_SIZE = 8;

function ExplorerMyFossils() {
  const { user } = useAuth();
  const { exp } = useWorkspaceNav();
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

  const mine = useMemo(() => rows.filter((f) => String(f.created_by) === String(user?.id)), [rows, user?.id]);

  const {
    slice,
    totalPages,
    page: safePage,
  } = useMemo(() => clientPaginate(mine, { page, pageSize: PAGE_SIZE }), [mine, page]);

  useEffect(() => {
    setPage(1);
  }, [mine.length]);

  const catLabel = (v) => FOSSIL_CATEGORIES.find((c) => c.value === v)?.label || v;

  return (
    <div className="workspace-page">
      <WorkspaceBackNav />
      <p className="workspace-page__kicker">Mis fichas</p>
      <h1 className="workspace-page__title">Hallazgos registrados</h1>
      <p className="workspace-page__lead">
        Listado de ejemplares que usted ha ingresado al sistema. Puede editar metadatos y ubicación como autor
        del registro; las correcciones en fichas ya publicadas conviene que sean puntuales y documentadas en
        campo.
      </p>

      {loading ? (
        <p className="workspace-muted">Cargando…</p>
      ) : mine.length === 0 ? (
        <div className="workspace-card">
          <p className="workspace-muted">Aún no tiene registros propios.</p>
          <Link to={exp('/create-fossil')} className="workspace-link">
            Registrar el primer hallazgo
          </Link>
        </div>
      ) : (
        <>
          <div className="workspace-table-wrap">
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
                {slice.map((f) => (
                  <tr key={f.id}>
                    <td>{f.unique_code || '—'}</td>
                    <td>{f.name}</td>
                    <td>{catLabel(f.category)}</td>
                    <td>{FOSSIL_STATUS_LABELS[f.status] || f.status}</td>
                    <td>
                      <Link className="workspace-link" to={exp(`/edit-fossil/${f.id}`)}>
                        Editar
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
                Página {safePage} de {totalPages} ({mine.length} registros)
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

export default ExplorerMyFossils;
