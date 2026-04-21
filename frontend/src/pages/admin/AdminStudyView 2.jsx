import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { parseStudyContact } from '../../utils/studyContact.js';
import '../workspace/workspace-pages.css';
import '../researcher/researcher-study-detail.css';
import './adminPages.css';

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

const STATUS_COPY = {
  pending: 'Pendiente de publicación',
  published: 'Publicado en catálogo',
  rejected: 'Rechazado',
};

export default function AdminStudyView() {
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
    return <div className="admin-empty">Cargando estudio…</div>;
  }

  if (!study) {
    return (
      <>
        <header className="admin-page-header">
          <p className="admin-page-eyebrow">Estudio</p>
          <h1 className="admin-page-title">No encontrado</h1>
        </header>
        <div className="admin-panel admin-empty">No se pudo cargar el estudio o no tiene permisos para verlo.</div>
        <div className="admin-actions-row" style={{ marginTop: 16 }}>
          <Link to="/admin/pending-studies" className="admin-btn admin-btn--ghost">
            Volver a estudios pendientes
          </Link>
        </div>
      </>
    );
  }

  const dateStr = study.study_date ? String(study.study_date).slice(0, 10) : null;
  const pub = study.publication_status || 'published';
  const statusLabel = STATUS_COPY[pub] || pub;

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Solo lectura</p>
        <h1 className="admin-page-title">{study.title || 'Sin título'}</h1>
        <p className="admin-page-desc" style={{ marginBottom: 8 }}>
          <span className="admin-tag" style={{ marginRight: 8 }}>
            {statusLabel}
          </span>
          Ejemplar <strong>{study.fossil_id != null ? `#${study.fossil_id}` : '—'}</strong>
          {dateStr ? ` · Fecha del estudio: ${dateStr}` : ''}
        </p>
        <p className="admin-page-desc" style={{ marginTop: 0 }}>
          Vista completa del contenido enviado por el investigador. Para aprobar o rechazar use la lista de estudios
          pendientes.
        </p>
      </header>

      {pub === 'rejected' && study.rejection_reason ? (
        <div className="admin-panel" style={{ marginBottom: 16, maxWidth: 780, borderColor: 'rgba(145, 90, 70, 0.45)' }}>
          <p className="admin-page-desc" style={{ margin: 0, fontWeight: 700 }}>
            Motivo de rechazo registrado
          </p>
          <p className="admin-page-desc" style={{ marginTop: 8, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
            {study.rejection_reason}
          </p>
        </div>
      ) : null}

      <div className="admin-panel rsd-page" style={{ maxWidth: 780 }}>
        <div className="workspace-card rsd-card" style={{ boxShadow: 'none', border: 'none', padding: 0 }}>
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
            <Field label="Ubicación geográfica del estudio / hallazgo">{study.study_site_notes}</Field>
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
        </div>

        <div className="admin-actions-row" style={{ marginTop: 20, flexWrap: 'wrap' }}>
          <Link to={`/admin/fossil/${study.fossil_id}/review`} className="admin-btn admin-btn--ghost">
            Revisión del ejemplar
          </Link>
          <Link to="/admin/pending-studies" className="admin-btn admin-btn--ghost">
            Estudios pendientes
          </Link>
          <Link
            to={`/catalog#fossil-${study.fossil_id}`}
            className="admin-btn admin-btn--ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            Catálogo público
          </Link>
        </div>
      </div>
    </>
  );
}
