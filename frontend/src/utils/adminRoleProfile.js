/**
 * Selección de roles en admin: dos casillas (explorador / investigador) y administrador excluyente.
 * @typedef {{ explorer: boolean; researcher: boolean; admin: boolean }} RoleFlags
 */

/**
 * @param {string[] | undefined | null} roles
 * @returns {RoleFlags}
 */
export function rolesToFlags(roles) {
  const arr = [...new Set(roles || [])];
  if (arr.includes('admin')) {
    return { explorer: false, researcher: false, admin: true };
  }
  return {
    explorer: arr.includes('explorer'),
    researcher: arr.includes('researcher'),
    admin: false,
  };
}

/**
 * @param {RoleFlags} flags
 * @returns {string[]}
 */
export function flagsToRoles(flags) {
  if (flags.admin) return ['admin'];
  const r = [];
  if (flags.explorer) r.push('explorer');
  if (flags.researcher) r.push('researcher');
  return r.sort();
}

/**
 * @param {RoleFlags} flags
 * @returns {{ ok: true; roles: string[] } | { ok: false; error: string }}
 */
export function validateRoleFlags(flags) {
  const roles = flagsToRoles(flags);
  if (roles.length === 0) {
    return {
      ok: false,
      error: 'Seleccione explorador, investigador, ambos, o solo administrador.',
    };
  }
  return { ok: true, roles };
}

/** Estado inicial típico: solo explorador */
export const DEFAULT_ROLE_FLAGS = /** @type {const} */ ({
  explorer: true,
  researcher: false,
  admin: false,
});
