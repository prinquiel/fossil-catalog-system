import { Link, useLocation } from 'react-router-dom';

/** Rutas “raíz” del espacio dual donde no mostramos volver */
const WORKSPACE_TOP = new Set([
  '/workspace/inicio',
  '/workspace/mis-aportes',
  '/workspace/nuevo-aporte',
  '/workspace/researcher/search',
  '/workspace/researcher/catalog',
  '/workspace/researcher/map',
  '/workspace/explorer/profile',
]);

/**
 * En rutas bajo `/workspace/…` (excepto las de nivel superior), muestra enlace para regresar a Mis aportes.
 */
export function WorkspaceBackNav({ to = '/workspace/mis-aportes', children = '← Volver a Mis aportes' }) {
  const { pathname } = useLocation();
  const normalized = pathname.replace(/\/$/, '') || '/';
  if (!normalized.startsWith('/workspace/')) return null;
  if (WORKSPACE_TOP.has(normalized)) return null;

  return (
    <nav className="workspace-back-nav" aria-label="Volver al listado de aportes">
      <Link to={to} className="workspace-back-nav__link">
        {children}
      </Link>
    </nav>
  );
}
