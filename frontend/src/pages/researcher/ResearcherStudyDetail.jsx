import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { parseStudyContact } from '../../utils/studyContact.js';
import { formatStudySiteLocationDisplay } from '../../utils/studySiteLocation.js';
import { useWorkspaceNav } from '../../context/WorkspaceNavContext.jsx';
import { WorkspaceBackNav } from '../../components/workspace/WorkspaceBackNav.jsx';
import '../workspace/workspace-pages.css';
import './researcher-study-detail.css';

function studyImageUrl(path) {
  if (!path) return '';
  let root = import.meta.env.VITE_API_URL?.trim() || '';
  root = root.replace(/\/$/, '').replace(/\/api$/, '');
  if (!root) root = 'http://localhost:5001';
  return `${root}/uploads/${path}`;
}

function Field({ label, children }) {
  if (children == null || children === '') return null;
  return (
    <div className="rsd-field">
      <div className="rsd-field__label">{label}</div>
      <div className="rsd-field__value">{children}</div>
    </div>
  );
}

const PUBLICATION_EXPLAIN = {
  pending: {
    title: 'En revisión editorial',
    body: 'Este estudio no es visible en el catálogo público hasta que un administrador lo apruebe.',
  },
  rejected: {
    title: 'Estudio no aprobado',
    body: 'Revise el comentario del equipo editorial y actualice el contenido si puede volver a enviarlo.',
  },
};

function StudyContactDisplay({ raw }) {
  const p = parseStudyContact(raw);
  if (p.kind === 'empty') return null;
  if (p.kind === 'legacy') {
    return <Field label="Contacto">{p.text}</Field>;
  }
  const rows = [];
  if (p.email) {
    rows.push({
      label: 'Correo',
      node: (
        <a href={`mailto:${p.email}`} className="workspace-link">
          {p.email}
        </a>
      ),
    });
  }
  if (p.name) rows.push({ label: 'Nombre', node: p.name });
  if (p.phone) {
    const telHref = String(p.phone).replace(/[^\d+]/g, '') || p.phone;
    rows.push({
      label: 'Número celular',
      node: (
        <a href={`tel:${telHref}`} className="workspace-link">
          {p.phone}
        </a>
      ),
    });
  }
  if (p.institution) rows.push({ label: 'Institución de trabajo', node: p.institution });
  if (rows.length === 0) return null;
  return (
    <div className="rsd-field">
      <div className="rsd-field__label">Contacto</div>
      <div className="rsd-field__value">
        <dl className="rsd-contact-dl">
          {rows.map((row, i) => (
            <div key={`${row.label}-${i}`} className="rsd-contact-row">
              <dt>{row.label}</dt>
              <dd>{row.node}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export default function ResearcherStudyDetail() {
  const { res } = useWorkspaceNav();
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
        <WorkspaceBackNav />
        <p className="workspace-muted">Cargando estudio…</p>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="workspace-page">
        <WorkspaceBackNav />
        <div className="workspace-alert">No se encontró el estudio.</div>
        <Link to={res('/my-studies')} className="workspace-link">
          Volver a mis estudios
        </Link>
      </div>
    );
  }

  const dateStr = study.study_date ? String(study.study_date).slice(0, 10) : null;
  const publicationStatus = study.publication_status || 'published';
  const pubInfo = PUBLICATION_EXPLAIN[publicationStatus];

  return (
    <div className="workspace-page rsd-page">
      <WorkspaceBackNav />
      <p className="workspace-page__kicker">Estudio científico</p>
      {pubInfo ? (
        <div className="workspace-alert" style={{ marginBottom: 16 }} role="status">
          <strong>{pubInfo.title}.</strong> {pubInfo.body}
          {publicationStatus === 'rejected' && study.rejection_reason ? (
            <p style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap' }}>
              <em>Motivo:</em> {study.rejection_reason}
            </p>
          ) : null}
        </div>
      ) : null}
      <h1 className="workspace-page__title">{study.title || 'Sin título'}</h1>
      <p className="workspace-page__lead">
        Ficha vinculada al ejemplar{' '}
        <Link className="workspace-link" to={res(`/fossil/${study.fossil_id}`)}>
          ver registro #{study.fossil_id}
        </Link>
        {dateStr ? ` · Fecha del estudio: ${dateStr}` : ''}
      </p>

      <div className="workspace-card rsd-card">
        <div className="rsd-dl">
          <Field label="Contexto y objetivo">{study.context_objectives}</Field>
          <Field label="Introducción">{study.introduction}</Field>
          <Field label="Tipo de análisis">{study.analysis_type}</Field>
          <Field label="Resultados">{study.results}</Field>
          <Field label="Composición (texto)">{study.composition}</Field>
          {study.composition_image_path ? (
            <div className="rsd-field">
              <div className="rsd-field__label">Imagen de composición</div>
              <div className="rsd-field__value">
                <img
                  src={studyImageUrl(study.composition_image_path)}
                  alt="Composición"
                  style={{ maxWidth: '100%', borderRadius: 8 }}
                />
              </div>
            </div>
          ) : null}
          <Field label="Condiciones del hallazgo">{study.conditions}</Field>
          <Field label="Evidencia visual (notas)">{study.visual_evidence_notes}</Field>
          <Field label="Ubicación del estudio / trabajo de campo">
            {formatStudySiteLocationDisplay(study.study_site_notes)}
          </Field>
          <StudyContactDisplay raw={study.institution_contact} />
          <Field label="Referencias bibliográficas">{study.references_text}</Field>
          {study.references_links ? (
            <div className="rsd-field">
              <div className="rsd-field__label">Enlaces</div>
              <div className="rsd-field__value">
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {String(study.references_links)
                    .split(/\r?\n/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((line) => (
                      <li key={line}>
                        <a href={line} target="_blank" rel="noopener noreferrer">
                          {line}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
        <div className="rsd-actions">
          <Link to={res(`/study/${study.id}/edit`)} className="workspace-btn">
            Editar estudio
          </Link>
          <Link to={res(`/fossil/${study.fossil_id}`)} className="workspace-btn workspace-btn--ghost">
            Ver ficha del fósil
          </Link>
          <Link to={res('/my-studies')} className="workspace-btn workspace-btn--ghost">
            Volver a mis estudios
          </Link>
        </div>
      </div>
    </div>
  );
}
