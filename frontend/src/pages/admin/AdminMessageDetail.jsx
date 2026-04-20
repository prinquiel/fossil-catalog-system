import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { contactService } from '../../services/contactService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../admin/adminPages.css';

function AdminMessageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [m, setM] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await contactService.getById(id);
        if (alive && res.success && res.data) setM(res.data);
      } catch (e) {
        toast.error(getApiErrorMessage(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const markRead = async () => {
    try {
      const res = await contactService.markRead(id);
      if (res.success && res.data) setM(res.data);
      toast.success('Marcado como leído.');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const markReplied = async () => {
    try {
      const res = await contactService.markReplied(id);
      if (res.success && res.data) setM(res.data);
      toast.success('Marcado como respondido.');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const remove = async () => {
    if (!window.confirm('¿Eliminar este mensaje de forma permanente?')) return;
    try {
      await contactService.remove(id);
      toast.success('Mensaje eliminado.');
      navigate('/admin/messages');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  if (loading) return <div className="admin-empty">Cargando…</div>;
  if (!m) return <div className="admin-panel admin-empty">Mensaje no encontrado.</div>;

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Mensaje</p>
        <h1 className="admin-page-title">{m.subject}</h1>
        <p className="admin-page-desc">
          De <strong>{m.name}</strong> · {m.email}
        </p>
      </header>

      <div className="admin-panel" style={{ maxWidth: 720 }}>
        <p className="admin-page-desc" style={{ whiteSpace: 'pre-wrap' }}>
          {m.message}
        </p>
        <div className="admin-actions-row" style={{ marginTop: 20 }}>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={markRead}>
            Marcar leído
          </button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={markReplied}>
            Marcar respondido
          </button>
          <button type="button" className="admin-btn" onClick={remove}>
            Eliminar
          </button>
          <Link to="/admin/messages" className="admin-btn admin-btn--ghost">
            Volver a la bandeja
          </Link>
        </div>
      </div>
    </>
  );
}

export default AdminMessageDetail;
