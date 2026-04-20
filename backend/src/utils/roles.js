const { pool } = require('../config/database');

const VALID_ROLES = ['explorer', 'researcher', 'admin'];

/** Valores legados o manuales en `user_roles` que deben tratarse como `admin` en JWT y middleware. */
const ADMIN_ROLE_ALIASES = new Set(['superadmin', 'super_admin']);

function canonicalizeAuthRoles(roles) {
  if (!Array.isArray(roles)) return [];
  const out = [];
  for (const r of roles) {
    if (typeof r !== 'string' || !r.trim()) continue;
    const mapped = ADMIN_ROLE_ALIASES.has(r.toLowerCase()) ? 'admin' : r;
    if (!out.includes(mapped)) out.push(mapped);
  }
  return out;
}

function primaryRole(roles) {
  if (!roles || roles.length === 0) return 'explorer';
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('researcher')) return 'researcher';
  return 'explorer';
}

async function getRolesForUser(userId, client = null) {
  const executor = client || pool;
  const res = await executor.query('SELECT role FROM user_roles WHERE user_id = $1 ORDER BY role', [userId]);
  return res.rows.map((r) => r.role);
}

async function replaceUserRoles(client, userId, roles) {
  const uniq = [...new Set(roles)].filter((r) => VALID_ROLES.includes(r));
  if (uniq.length === 0) {
    throw new Error('roles_vacios');
  }
  await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
  for (const r of uniq.sort()) {
    await client.query('INSERT INTO user_roles (user_id, role) VALUES ($1, $2)', [userId, r]);
  }
  await client.query('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
  return uniq.sort();
}

async function replaceUserRolesForUser(userId, roles) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const out = await replaceUserRoles(client, userId, roles);
    await client.query('COMMIT');
    return out;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Admin / creación: acepta `roles: []` o `role` string.
 */
function parseRolesFromBody(body) {
  if (!body) throw new Error('missing');
  if (body.roles && Array.isArray(body.roles) && body.roles.length > 0) {
    const uniq = [...new Set(body.roles)];
    if (uniq.some((r) => !VALID_ROLES.includes(r))) {
      throw new Error('invalid');
    }
    return uniq.sort();
  }
  if (body.role && typeof body.role === 'string') {
    if (!VALID_ROLES.includes(body.role)) throw new Error('invalid');
    return [body.role];
  }
  throw new Error('missing');
}

/**
 * Registro público: solo explorer y researcher; acepta `roles` o `role`.
 */
function parseRegistrationRoles(body) {
  const allowed = ['explorer', 'researcher'];
  if (body.roles && Array.isArray(body.roles) && body.roles.length > 0) {
    if (body.roles.some((r) => !allowed.includes(r))) {
      return { error: 'Solo se permiten roles explorer y researcher en el registro' };
    }
    const uniq = [...new Set(body.roles)].sort();
    return { roles: uniq };
  }
  if (body.role && typeof body.role === 'string') {
    if (!allowed.includes(body.role)) {
      return { error: 'Solo se permiten roles explorer y researcher en el registro' };
    }
    return { roles: [body.role] };
  }
  return { roles: ['explorer'] };
}

function mapUserWithRoles(row, roles) {
  const r = [...roles].sort();
  return {
    ...row,
    roles: r,
    role: primaryRole(r),
  };
}

function isExplorerOnlyScope(roles) {
  return roles.includes('explorer') && !roles.includes('researcher') && !roles.includes('admin');
}

module.exports = {
  VALID_ROLES,
  canonicalizeAuthRoles,
  primaryRole,
  getRolesForUser,
  replaceUserRoles,
  replaceUserRolesForUser,
  parseRolesFromBody,
  parseRegistrationRoles,
  mapUserWithRoles,
  isExplorerOnlyScope,
};
