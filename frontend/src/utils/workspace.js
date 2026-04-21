/**
 * @param {{ roles?: string[]; role?: string } | null | undefined} user
 * @returns {boolean}
 */
export function isExplorerAndResearcher(user) {
  if (!user) return false;
  const roles = user.roles || (user.role ? [user.role] : []);
  return roles.includes('explorer') && roles.includes('researcher');
}

/**
 * @param {{ roles?: string[]; role?: string } | null | undefined} user
 * @returns {string | null}
 */
export function workspaceHomePath(user) {
  if (!user) return null;
  const roles = user.roles || (user.role ? [user.role] : []);
  if (roles.includes('admin')) return '/admin/dashboard';
  if (roles.includes('explorer') && roles.includes('researcher')) return '/workspace/inicio';
  if (roles.includes('researcher')) return '/researcher/dashboard';
  if (roles.includes('explorer')) return '/explorer/dashboard';
  return null;
}

/**
 * Ruta a «Mis registros» (explorador) según rol: espacio unificado o solo explorador.
 * @param {{ roles?: string[]; role?: string } | null | undefined} user
 */
export function explorerMyRecordsPath(user) {
  if (!user) return '/explorer/my-fossils';
  const roles = user.roles || (user.role ? [user.role] : []);
  if (roles.includes('explorer') && roles.includes('researcher') && !roles.includes('admin')) {
    return '/workspace/explorer/my-fossils';
  }
  return '/explorer/my-fossils';
}

/**
 * Ruta a «Mis estudios» según rol.
 * @param {{ roles?: string[]; role?: string } | null | undefined} user
 */
export function researcherMyStudiesPath(user) {
  if (!user) return '/researcher/my-studies';
  const roles = user.roles || (user.role ? [user.role] : []);
  if (roles.includes('explorer') && roles.includes('researcher') && !roles.includes('admin')) {
    return '/workspace/researcher/my-studies';
  }
  return '/researcher/my-studies';
}

/** Listado unificado de aportes (espacio dual explorador + investigador). */
export const WORKSPACE_MIS_APORTES_PATH = '/workspace/mis-aportes';
