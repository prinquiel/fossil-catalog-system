import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWorkspaceNav } from '../../context/WorkspaceNavContext.jsx';
import { fossilService } from '../../services/fossilService';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { FOSSIL_STATUS_LABELS } from '../../constants/fossilMeta.js';
import './workspace-pages.css';

const PUBLICATION_LABEL = {
  pending: 'En revisión',
  published: 'Publicado',
  rejected: 'Rechazado',
};

/**
 * Lista unificada: registros propios + estudios propios (orden por id descendente aproximación a recientes).
 */
function WorkspaceMyContributions() {
  const { user } = useAuth();
  const { exp, res } = useWorkspaceNav();
  const [fossils, setFossils] = useState([]);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [fRes, sRes] = await Promise.all([fossilService.getAll(), studyService.getAll()]);
        if (!mounted) return;
        setFossils(Array.isArray(fRes?.data) ? fRes.data : []);
        setStudies(Array.isArray(sRes?.data) ? sRes.data : []);
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

  const mineFossils = useMemo(
    () => fossils.filter((f) => String(f.created_by) === String(user?.id)),
    [fossils, user?.id]
  );
  const mineStudies = useMemo(
    () => studies.filter((s) => String(s.researcher_id) === String(user?.id)),
    [studies, user?.id]
  );

  const rows = useMemo(() => {
    const fRows = mineFossils.map((f) => ({
      key: `f-${f.id}`,
      kind: 'Registro',
      label: f.name || 'Sin nombre',
      code: f.unique_code || '—',
      status: FOSSIL_STATUS_LABELS[f.status] || f.status,
      sortId: f.id,
      to: exp(`/edit-fossil/${f.id}`),
      linkLabel: 'Editar ficha',
    }));
    const sRows = mineStudies.map((s) => ({
      key: `s-${s.id}`,
      kind: 'Estudio',
      label: s.title || 'Sin título',
      code: s.fossil_id ? `#${s.fossil_id}` : '—',
      status: PUBLICATION_LABEL[s.publication_status] || s.publication_status || '—',
      sortId: s.id,
      to: res(`/study/${s.id}`),
      linkLabel: 'Ver estudio',
    }));
    return [...fRows, ...sRows].sort((a, b) => b.sortId - a.sortId);
  }, [mineFossils, mineStudies, exp, res]);

  return (
    <div className="workspace-page">
      <p className="workspace-page__kicker">Tu producción</p>
      <h1 className="workspace-page__title">Mis aportes</h1>
      <p className="workspace-page__lead">
        Registros de campo que creaste como explorador y estudios donde figuras como investigador. Para listados
        detallados use también las entradas del menú o los accesos rápidos del inicio.
      </p>

      {loading ? (
        <p className="workspace-muted">Cargando…</p>
      ) : rows.length === 0 ? (
        <div className="workspace-card workspace-muted">
          Aún no hay aportes. Use <strong>Nuevo aporte</strong> o el catálogo para comenzar.
        </div>
      ) : (
        <div className="workspace-table-wrap">
          <table className="workspace-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Título / nombre</th>
                <th>Ref.</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td>{r.kind}</td>
                  <td>{r.label}</td>
                  <td>{r.code}</td>
                  <td>{r.status}</td>
                  <td>
                    <Link className="workspace-link" to={r.to}>
                      {r.linkLabel}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="workspace-actions" style={{ marginTop: 18 }}>
        <Link to={exp('/my-fossils')} className="workspace-btn workspace-btn--ghost">
          Solo mis registros
        </Link>
        <Link to={res('/my-studies')} className="workspace-btn workspace-btn--ghost">
          Solo mis estudios
        </Link>
      </div>
    </div>
  );
}

export default WorkspaceMyContributions;
