/**
 * El código de ejemplar (unique_code) solo debe mostrarse a usuarios con rol
 * explorador, investigador o administrador.
 *
 * @param {{ roles?: string[], role?: string } | null | undefined} user
 * @returns {boolean}
 */
export function canViewFossilCode(user) {
  if (!user) return false;
  const roles = Array.isArray(user.roles) ? user.roles : user.role ? [user.role] : [];
  return roles.some((r) => ['explorer', 'researcher', 'admin'].includes(r));
}
