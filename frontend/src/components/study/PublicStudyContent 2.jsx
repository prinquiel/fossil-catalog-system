import { parseStudyContact } from '../../utils/studyContact.js';
import '../../pages/workspace/workspace-pages.css';
import '../../pages/researcher/researcher-study-detail.css';

export function studyAssetUrl(filePath) {
  if (!filePath) return '';
  let root = import.meta.env.VITE_API_URL?.trim() || '';
  root = root.replace(/\/$/, '').replace(/\/api$/, '');
  if (!root) root = 'http://localhost:5001';
  return `${root}/uploads/${filePath}`;
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

/**
 * @param {{ study: Record<string, unknown> }} props
 */
export default function PublicStudyContent({ study }) {
  return (
    <div className="workspace-card rsd-card public-study-content">
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
                src={studyAssetUrl(study.composition_image_path)}
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
  );
}
