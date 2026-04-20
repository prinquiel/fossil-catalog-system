import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { serializeStudyContact } from '../../utils/studyContact.js';
import '../workspace/workspace-pages.css';
import './ResearcherStudyContactFields.css';

function ResearcherCreateStudy() {
  const { fossilId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [compositionFile, setCompositionFile] = useState(/** @type {File | null} */ (null));
  const [form, setForm] = useState({
    title: '',
    context_objectives: '',
    introduction: '',
    analysis_type: '',
    results: '',
    composition: '',
    conditions: '',
    visual_evidence_notes: '',
    study_site_notes: '',
    contact_email: '',
    contact_name: '',
    contact_phone: '',
    contact_institution: '',
    references_text: '',
    references_links: '',
    study_date: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('fossil_id', String(fossilId));
      const {
        contact_email,
        contact_name,
        contact_phone,
        contact_institution,
        ...rest
      } = form;
      Object.entries(rest).forEach(([k, v]) => {
        if (v !== '' && v != null) fd.append(k, String(v));
      });
      const contactPayload = serializeStudyContact({
        email: contact_email,
        name: contact_name,
        phone: contact_phone,
        institution: contact_institution,
      });
      if (contactPayload) fd.append('institution_contact', contactPayload);
      if (compositionFile) fd.append('composition_image', compositionFile);

      const res = await studyService.create(fd);
      if (res.success && res.data?.id) {
        toast.success('Estudio enviado. Quedará pendiente de aprobación para aparecer en el catálogo público.');
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
      <h1 className="workspace-page__title">Información científica adicional</h1>
      <p className="workspace-page__lead">
        Documento vinculado al ejemplar #{fossilId}. Tras enviarlo, un administrador lo revisará antes de publicarlo en
        el catálogo. Incluya contexto del estudio, análisis, composición, evidencia visual, ubicación del estudio,
        datos de contacto y referencias o enlaces.
      </p>

      <form className="workspace-card workspace-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="st-title">Título del estudio</label>
          <input id="st-title" value={form.title} onChange={set('title')} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-ctx">Contexto y objetivo del estudio</label>
          <textarea id="st-ctx" value={form.context_objectives} onChange={set('context_objectives')} rows={4} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-intro">Introducción</label>
          <textarea id="st-intro" value={form.introduction} onChange={set('introduction')} rows={4} />
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
          <textarea id="st-res" value={form.results} onChange={set('results')} rows={4} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-comp">Composición del fósil o muestra (texto)</label>
          <textarea id="st-comp" value={form.composition} onChange={set('composition')} rows={3} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-comp-img">Imagen de composición (opcional, JPG/PNG/WEBP)</label>
          <input
            id="st-comp-img"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setCompositionFile(e.target.files?.[0] || null)}
          />
          {compositionFile ? (
            <p className="workspace-muted" style={{ fontSize: '0.86rem', marginTop: 6 }}>
              {compositionFile.name}
            </p>
          ) : null}
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-cond">Condiciones del hallazgo</label>
          <textarea id="st-cond" value={form.conditions} onChange={set('conditions')} rows={3} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-vis">Evidencia visual (antes / después / análisis) — notas</label>
          <textarea id="st-vis" value={form.visual_evidence_notes} onChange={set('visual_evidence_notes')} rows={3} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-site">Ubicación geográfica del estudio / hallazgo (notas)</label>
          <textarea id="st-site" value={form.study_site_notes} onChange={set('study_site_notes')} rows={3} />
        </div>
        <div className="study-contact">
          <p className="study-contact__title">Contacto</p>
          <p className="study-contact__blank">
            <span className="study-contact__label">Correo electrónico:</span>
            <input
              id="st-contact-email"
              className="study-contact__input"
              type="email"
              autoComplete="email"
              value={form.contact_email}
              onChange={set('contact_email')}
              placeholder="correo@institución.ac.cr"
            />
          </p>
          <p className="study-contact__blank">
            <span className="study-contact__label">Nombre:</span>
            <input
              id="st-contact-name"
              className="study-contact__input"
              type="text"
              autoComplete="name"
              value={form.contact_name}
              onChange={set('contact_name')}
              placeholder="Nombre completo"
            />
          </p>
          <p className="study-contact__blank">
            <span className="study-contact__label">Número celular:</span>
            <input
              id="st-contact-phone"
              className="study-contact__input"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={form.contact_phone}
              onChange={set('contact_phone')}
              placeholder="+506 …"
            />
          </p>
          <p className="study-contact__blank">
            <span className="study-contact__label">Institución de trabajo:</span>
            <input
              id="st-contact-institution"
              className="study-contact__input"
              type="text"
              value={form.contact_institution}
              onChange={set('contact_institution')}
              placeholder="Universidad u organización"
            />
          </p>
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-ref">Referencias bibliográficas (texto)</label>
          <textarea id="st-ref" value={form.references_text} onChange={set('references_text')} rows={3} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-links">Referencias o documentos (enlaces, uno por línea)</label>
          <textarea
            id="st-links"
            value={form.references_links}
            onChange={set('references_links')}
            rows={4}
            placeholder="https://..."
          />
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
