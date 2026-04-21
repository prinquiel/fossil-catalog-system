import { Link } from 'react-router-dom';
import { useWorkspaceNav } from '../../context/WorkspaceNavContext.jsx';
import './workspace-pages.css';
import '../admin/adminPages.css';

/**
 * Elección de tipo de aporte: hallazgo en campo o estudio vinculado a un fósil publicado.
 */
function WorkspaceNewContribution() {
  const { exp, res } = useWorkspaceNav();

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Nuevo aporte</p>
        <h1 className="admin-page-title">¿Qué desea registrar?</h1>
        <p className="admin-page-desc">
          Un <strong>hallazgo</strong> documenta material en campo (fósil, roca o mineral). Un <strong>estudio</strong>{' '}
          se asocia a un ejemplar ya publicado en el catálogo: elija la ficha desde el catálogo o la búsqueda.
        </p>
      </header>

      <div className="workspace-grid-2" style={{ marginTop: 8, maxWidth: 720 }}>
        <section className="admin-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 className="admin-page-desc" style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>
            Hallazgo en campo
          </h2>
          <p className="admin-page-desc" style={{ margin: 0, flex: 1 }}>
            Crear una ficha nueva con ubicación, imágenes y clasificación. Quedará en revisión hasta aprobación
            editorial.
          </p>
          <Link to={exp('/create-fossil')} className="admin-btn admin-btn--primary" style={{ alignSelf: 'flex-start' }}>
            Registrar hallazgo
          </Link>
        </section>

        <section className="admin-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 className="admin-page-desc" style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>
            Estudio científico
          </h2>
          <p className="admin-page-desc" style={{ margin: 0, flex: 1 }}>
            Los estudios se vinculan a un fósil publicado. Abra el ejemplar en el catálogo y use «Registrar estudio» en
            su ficha, o búsquelo primero.
          </p>
          <div className="admin-actions-row" style={{ marginTop: 'auto', flexWrap: 'wrap' }}>
            <Link to={res('/search')} className="admin-btn admin-btn--ghost">
              Buscar ejemplar
            </Link>
            <Link to={res('/catalog')} className="admin-btn admin-btn--primary">
              Abrir catálogo de trabajo
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

export default WorkspaceNewContribution;
