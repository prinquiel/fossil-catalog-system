/**
 * @param {{ roles?: string[]; role?: string } | null | undefined} user
 * @returns {string | null}
 */
export function workspaceHomePath(user) {
  if (!user) return null;
  const roles = user.roles || (user.role ? [user.role] : []);
  if (roles.includes('admin')) return '/admin/dashboard';
  if (roles.includes('researcher')) return '/researcher/dashboard';
  if (roles.includes('explorer')) return '/explorer/dashboard';
  return null;
}
