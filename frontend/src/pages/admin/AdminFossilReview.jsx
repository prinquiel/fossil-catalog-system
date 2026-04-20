import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fossilService } from '../../services/fossilService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../admin/adminPages.css';

function AdminFossilReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [f, setF] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const res = await fossilService.getById(id);
        if (m && res.success && res.data) setF(res.data);
      } catch (e) {
        toast.error(getApiErrorMessage(e));
      } finally {
        if (m) setLoading(false);
      }
    })();
    return () => {
      m = false;
    };
  }, [id]);

  const approve = async () => {
    try {
      await fossilService.approve(id);
      toast.success('Publicado.');
      navigate('/admin/pending-fossils');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const reject = async () => {
    if (!window.confirm('¿Rechazar este fósil?')) return;
    try {
      await fossilService.reject(id);
      toast.success('Rechazado.');
      navigate('/admin/pending-fossils');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  if (loading) return <div className="admin-empty">Cargando ficha…</div>;
  if (!f) return <div className="admin-panel admin-empty">No se encontró el registro.</div>;

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Revisión</p>
        <h1 className="admin-page-title">{f.name}</h1>
        <p className="admin-page-desc">
          {f.unique_code} · Estado: <strong>{f.status}</strong>
        </p>
      </header>

      <div className="admin-panel" style={{ maxWidth: 720 }}>
        <p className="admin-page-desc">{f.description || 'Sin descripción.'}</p>
        <dl style={{ marginTop: 16 }}>
          <dt className="admin-page-desc" style={{ fontWeight: 700 }}>
            Contexto geológico
          </dt>
          <dd className="admin-page-desc" style={{ margin: '4px 0 12px' }}>
            {f.geological_context || '—'}
          </dd>
          <dt className="admin-page-desc" style={{ fontWeight: 700 }}>
            Descubridor
          </dt>
          <dd className="admin-page-desc" style={{ margin: '4px 0 0' }}>
            {f.discoverer_name || '—'}
          </dd>
        </dl>
        {f.status === 'pending' && (
          <div className="admin-actions-row" style={{ marginTop: 24 }}>
            <button type="button" className="admin-btn" onClick={approve}>
              Publicar en catálogo
            </button>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={reject}>
              Rechazar
            </button>
          </div>
        )}
        <div className="admin-actions-row">
          <Link to="/admin/pending-fossils" className="admin-btn admin-btn--ghost">
            Volver a pendientes
          </Link>
          <Link to="/admin/fossils" className="admin-btn admin-btn--ghost">
            Todos los fósiles
          </Link>
        </div>
      </div>
    </>
  );
}

export default AdminFossilReview;
