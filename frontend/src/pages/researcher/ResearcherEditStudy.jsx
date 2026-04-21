import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { parseStudyContact, serializeStudyContact } from '../../utils/studyContact.js';
import { parseStudySiteLocation, serializeStudySiteLocation } from '../../utils/studySiteLocation.js';
import { getDefaultStudyContactFromUser } from '../../utils/studyProfileDefaults.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWorkspaceNav } from '../../context/WorkspaceNavContext.jsx';
import { WorkspaceBackNav } from '../../components/workspace/WorkspaceBackNav.jsx';
import { StudyLocationFields } from '../../components/study/StudyLocationFields.jsx';
import { StudyContactFields } from '../../components/study/StudyContactFields.jsx';
import '../workspace/workspace-pages.css';
import './ResearcherStudyContactFields.css';

function ResearcherEditStudy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { res: researcherPath } = useWorkspaceNav();
  const listPath = isAdmin ? '/admin/studies' : researcherPath('/my-studies');
  const detailPath = isAdmin ? `/admin/study/${id}` : researcherPath(`/study/${id}`);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [compositionFile, setCompositionFile] = useState(/** @type {File | null} */ (null));

  const [siteMode, setSiteMode] = useState(/** @type {'text' | 'coords'} */ ('text'));
  const [siteText, setSiteText] = useState('');
  const [siteLat, setSiteLat] = useState('');
  const [siteLng, setSiteLng] = useState('');

  const [form, setForm] = useState({
    title: '',
    context_objectives: '',
    introduction: '',
    analysis_type: '',
    results: '',
    composition: '',
    conditions: '',
    visual_evidence_notes: '',
    contact_email: '',
    contact_name: '',
    contact_phone: '',
    contact_institution: '',
    references_text: '',
    references_links: '',
    study_date: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const studyRes = await studyService.getById(id);
        if (!mounted) return;
        if (!(studyRes?.success && studyRes.data)) {
          toast.error('No se pudo cargar el estudio.');
          navigate(listPath, { replace: true });
          return;
        }
        const s = studyRes.data;
        const contact = parseStudyContact(s.institution_contact);

        const loc = parseStudySiteLocation(s.study_site_notes);
        if (loc.kind === 'text') {
          setSiteMode('text');
          setSiteText(loc.text);
        } else if (loc.kind === 'coords') {
          setSiteMode('coords');
          setSiteLat(String(loc.lat));
          setSiteLng(String(loc.lng));
        } else if (loc.kind === 'legacy') {
          setSiteMode('text');
          setSiteText(loc.raw.slice(0, 280));
        } else {
          setSiteMode('text');
          setSiteText('');
        }

        if (contact.kind === 'structured') {
          setForm({
            title: s.title || '',
            context_objectives: s.context_objectives || '',
            introduction: s.introduction || '',
            analysis_type: s.analysis_type || '',
            results: s.results || '',
            composition: s.composition || '',
            conditions: s.conditions || '',
            visual_evidence_notes: s.visual_evidence_notes || '',
            contact_email: contact.email || '',
            contact_name: contact.name || '',
            contact_phone: contact.phone || '',
            contact_institution: contact.institution || '',
            references_text: s.references_text || '',
            references_links: s.references_links || '',
            study_date: s.study_date ? String(s.study_date).slice(0, 10) : '',
          });
        } else {
          setForm({
            title: s.title || '',
            context_objectives: s.context_objectives || '',
            introduction: s.introduction || '',
            analysis_type: s.analysis_type || '',
            results: s.results || '',
            composition: s.composition || '',
            conditions: s.conditions || '',
            visual_evidence_notes: s.visual_evidence_notes || '',
            contact_email: '',
            contact_name: '',
            contact_phone: '',
            contact_institution: '',
            references_text: s.references_text || '',
            references_links: s.references_links || '',
            study_date: s.study_date ? String(s.study_date).slice(0, 10) : '',
          });
        }
      } catch (e) {
        toast.error(getApiErrorMessage(e));
        navigate(listPath, { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, navigate, listPath]);

  useEffect(() => {
    if (!user) return;
    const d = getDefaultStudyContactFromUser(user);
    setForm((f) => ({
      ...f,
      contact_email: f.contact_email || d.email,
      contact_name: f.contact_name || d.name,
      contact_phone: f.contact_phone || d.phone,
      contact_institution: f.contact_institution || d.institution,
    }));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const studySiteNotes = serializeStudySiteLocation({
      mode: siteMode,
      text: siteText,
      lat: siteLat,
      lng: siteLng,
    });
    if (!studySiteNotes) {
      toast.error(
        siteMode === 'coords'
          ? 'Ingrese latitud y longitud válidas (WGS84, ej. 9.93 y -84.09).'
          : 'Ingrese una dirección breve o cambie a coordenadas y complete latitud y longitud.'
      );
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('study_site_notes', studySiteNotes);
      const {
        contact_email,
        contact_name,
        contact_phone,
        contact_institution,
        ...rest
      } = form;
      Object.entries(rest).forEach(([k, v]) => {
        if (v != null) fd.append(k, String(v));
      });
      const contactPayload = serializeStudyContact({
        email: contact_email,
        name: contact_name,
        phone: contact_phone,
        institution: contact_institution,
      });
      if (contactPayload) fd.append('institution_contact', contactPayload);
      if (compositionFile) fd.append('composition_image', compositionFile);

      const updateRes = await studyService.update(id, fd);
      if (updateRes.success) {
        toast.success(
          isAdmin
            ? 'Estudio actualizado.'
            : 'Estudio actualizado. Pasó nuevamente a revisión de administración.'
        );
        navigate(detailPath);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="workspace-page">
        <WorkspaceBackNav />
        <p className="workspace-muted">Cargando estudio…</p>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <WorkspaceBackNav />
      <p className="workspace-page__kicker">Edición</p>
      <h1 className="workspace-page__title">Editar estudio científico</h1>
      <p className="workspace-page__lead">
        {isAdmin ? (
          <>
            Vista de edición con permisos de administración: puede corregir el contenido; el estado de publicación no
            cambia automáticamente (use aprobar / rechazar desde la gestión de estudios si corresponde).
          </>
        ) : (
          <>
            Al guardar cambios, el estudio vuelve a estado <strong>pendiente</strong> hasta nueva aprobación de un
            administrador.
          </>
        )}
      </p>

      <form className="workspace-card workspace-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="st-edit-title">Título del estudio</label>
          <input id="st-edit-title" value={form.title} onChange={set('title')} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-edit-ctx">Contexto y objetivo del estudio</label>
          <textarea id="st-edit-ctx" value={form.context_objectives} onChange={set('context_objectives')} rows={4} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-edit-intro">Introducción</label>
          <textarea id="st-edit-intro" value={form.introduction} onChange={set('introduction')} rows={4} />
        </div>
        <div className="workspace-form__row" style={{ marginTop: 14 }}>
          <div>
            <label htmlFor="st-edit-type">Tipo de análisis</label>
            <input id="st-edit-type" value={form.analysis_type} onChange={set('analysis_type')} />
          </div>
          <div>
            <label htmlFor="st-edit-date">Fecha del estudio</label>
            <input id="st-edit-date" type="date" value={form.study_date} onChange={set('study_date')} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-edit-res">Resultados</label>
          <textarea id="st-edit-res" value={form.results} onChange={set('results')} rows={4} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-edit-comp">Composición del fósil o muestra (texto)</label>
          <textarea id="st-edit-comp" value={form.composition} onChange={set('composition')} rows={3} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-edit-comp-img">Reemplazar imagen de composición (opcional)</label>
          <input
            id="st-edit-comp-img"
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
          <label htmlFor="st-edit-cond">Condiciones del hallazgo</label>
          <textarea id="st-edit-cond" value={form.conditions} onChange={set('conditions')} rows={3} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-edit-vis">Evidencia visual (antes / después / análisis) — notas</label>
          <textarea id="st-edit-vis" value={form.visual_evidence_notes} onChange={set('visual_evidence_notes')} rows={3} />
        </div>

        <StudyLocationFields
          mode={siteMode}
          onModeChange={setSiteMode}
          siteText={siteText}
          onSiteTextChange={setSiteText}
          siteLat={siteLat}
          onSiteLatChange={setSiteLat}
          siteLng={siteLng}
          onSiteLngChange={setSiteLng}
          idPrefix="edit"
        />

        <StudyContactFields
          email={form.contact_email}
          name={form.contact_name}
          phone={form.contact_phone}
          institution={form.contact_institution}
          onEmailChange={(v) => setForm((f) => ({ ...f, contact_email: v }))}
          onNameChange={(v) => setForm((f) => ({ ...f, contact_name: v }))}
          onPhoneChange={(v) => setForm((f) => ({ ...f, contact_phone: v }))}
          onInstitutionChange={(v) => setForm((f) => ({ ...f, contact_institution: v }))}
          idPrefix="edit"
        />

        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-edit-ref">Referencias bibliográficas (texto)</label>
          <textarea id="st-edit-ref" value={form.references_text} onChange={set('references_text')} rows={3} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="st-edit-links">Referencias o documentos (enlaces, uno por línea)</label>
          <textarea id="st-edit-links" value={form.references_links} onChange={set('references_links')} rows={4} />
        </div>
        <div className="workspace-actions">
          <button type="submit" className="workspace-btn" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <Link to={detailPath} className="workspace-btn workspace-btn--ghost">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ResearcherEditStudy;
