import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../workspace/workspace-pages.css';
import './researcher-study-detail.css';


function Field({ label, children }) {
  if (children == null || children === '') return null;
  return (
    <div className="rsd-field">
      <div className="rsd-field__label">{label}</div>
      <div className="rsd-field__value">{children}</div>
    </div>
  );
}

export default function ResearcherStudyDetail() {
  const { id } = useParams();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await studyService.getById(id);
        if (!mounted) return;
        if (res.success && res.data) setStudy(res.data);
        else setStudy(null);
      } catch (e) {
        toast.error(getApiErrorMessage(e));
        setStudy(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="workspace-page">
        <p className="workspace-muted">Cargando estudio…</p>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="workspace-page">
        <div className="workspace-alert">No se encontró el estudio.</div>
        <Link to="/researcher/my-studies" className="workspace-link">
          Volver a mis estudios
        </Link>
      </div>
    );
  }

  const dateStr = study.study_date ? String(study.study_date).slice(0, 10) : null;

  return (
    <div className="workspace-page rsd-page">
      <p className="workspace-page__kicker">Estudio científico</p>
      <h1 className="workspace-page__title">{study.title || 'Sin título'}</h1>
      <p className="workspace-page__lead">
        Ficha vinculada al ejemplar{' '}
        <Link className="workspace-link" to={`/researcher/fossil/${study.fossil_id}`}>
          ver registro #{study.fossil_id}
        </Link>
        {dateStr ? ` · Fecha del estudio: ${dateStr}` : ''}
      </p>

      <div className="workspace-card rsd-card">
        <div className="rsd-dl">
          <Field label="Introducción">{study.introduction}</Field>
          <Field label="Tipo de análisis">{study.analysis_type}</Field>
          <Field label="Resultados">{study.results}</Field>
          <Field label="Composición">{study.composition}</Field>
          <Field label="Condiciones">{study.conditions}</Field>
          <Field label="Referencias">{study.references_text}</Field>
        </div>
        <div className="rsd-actions">
          <Link to={`/researcher/fossil/${study.fossil_id}`} className="workspace-btn workspace-btn--ghost">
            Ver ficha del fósil
          </Link>
          <Link to="/researcher/my-studies" className="workspace-btn workspace-btn--ghost">
            Volver a mis estudios
          </Link>
        </div>
      </div>
    </div>
  );
}
