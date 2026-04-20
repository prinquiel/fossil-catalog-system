import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../workspace/workspace-pages.css';

function ResearcherCreateStudy() {
  const { fossilId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    introduction: '',
    analysis_type: '',
    results: '',
    composition: '',
    conditions: '',
    references_text: '',
    study_date: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await studyService.create({
        fossil_id: Number(fossilId),
        title: form.title.trim() || null,
        introduction: form.introduction.trim() || null,
        analysis_type: form.analysis_type.trim() || null,
        results: form.results.trim() || null,
        composition: form.composition.trim() || null,
        conditions: form.conditions.trim() || null,
        references_text: form.references_text.trim() || null,
        study_date: form.study_date || null,
      });
      if (res.success && res.data?.id) {
        toast.success('Estudio registrado.');
        navigate('/researcher/my-studies');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace-page">
      <p className="workspace-page__kicker">Nuevo estudio</p>
      <h1 className="workspace-page__title">Documento científico</h1>
      <p className="workspace-page__lead">
        Ficha vinculada al ejemplar #{fossilId}. Complete los campos según el protocolo de su institución.
      </p>

      <form className="workspace-card workspace-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="st-title">Título del estudio</label>
          <input id="st-title" value={form.title} onChange={set('title')} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-intro">Introducción</label>
          <textarea id="st-intro" value={form.introduction} onChange={set('introduction')} />
        </div>
        <div className="workspace-form__row" style={{ marginTop: 14 }}>
          <div>
            <label htmlFor="st-type">Tipo de análisis</label>
            <input id="st-type" value={form.analysis_type} onChange={set('analysis_type')} />
          </div>
          <div>
            <label htmlFor="st-date">Fecha del estudio</label>
            <input id="st-date" type="date" value={form.study_date} onChange={set('study_date')} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-res">Resultados</label>
          <textarea id="st-res" value={form.results} onChange={set('results')} />
        </div>
        <div className="workspace-form__row" style={{ marginTop: 14 }}>
          <div>
            <label htmlFor="st-comp">Composición</label>
            <textarea id="st-comp" value={form.composition} onChange={set('composition')} />
          </div>
          <div>
            <label htmlFor="st-cond">Condiciones</label>
            <textarea id="st-cond" value={form.conditions} onChange={set('conditions')} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-ref">Referencias bibliográficas</label>
          <textarea id="st-ref" value={form.references_text} onChange={set('references_text')} />
        </div>
        <div className="workspace-actions">
          <button type="submit" className="workspace-btn" disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar estudio'}
          </button>
          <Link to={`/researcher/fossil/${fossilId}`} className="workspace-btn workspace-btn--ghost">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ResearcherCreateStudy;
