const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/database');
const {
  getRolesForUser,
  replaceUserRoles,
  replaceUserRolesForUser,
  parseRolesFromBody,
  normalizeAdminManagedRoles,
  mapUserWithRoles,
} = require('../utils/roles');

const safeSelect = `
  id, username, email, first_name, last_name, country, profession, phone, workplace,
  registration_status, approved_at, approved_by, rejection_reason,
  created_at, updated_at, deleted_at
`;

const getUsers = async (req, res) => {
  const result = await query(`SELECT ${safeSelect} FROM users ORDER BY id`, []);
  const rows = await Promise.all(
    result.rows.map(async (row) => {
      const roles = await getRolesForUser(row.id);
      return mapUserWithRoles(row, roles);
    })
  );
  return res.json({ success: true, data: rows });
};

const getUserById = async (req, res) => {
  const result = await query(`SELECT ${safeSelect} FROM users WHERE id = $1`, [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  const roles = await getRolesForUser(req.params.id);
  return res.json({ success: true, data: mapUserWithRoles(result.rows[0], roles) });
};

const createUser = async (req, res) => {
  let roleList;
  try {
    roleList = normalizeAdminManagedRoles(parseRolesFromBody(req.body));
  } catch (e) {
    if (e.code === 'INVALID_ADMIN_ROLES') {
      return res.status(400).json({
        success: false,
        error:
          'Perfil no válido. Use solo: explorador, investigador, explorador e investigador, o administrador (este último no se combina con otros).',
      });
    }
    return res.status(400).json({ success: false, error: 'username, email, password y role(s) son requeridos' });
  }
  const { username, email, password, first_name, last_name, country, profession, phone, workplace } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: 'username, email, password y role(s) son requeridos' });
  }
  const passwordHash = await bcrypt.hash(password, 10);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const created = await client.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, country, profession, phone, workplace, registration_status, approved_at, approved_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'approved', CURRENT_TIMESTAMP, NULL)
       RETURNING ${safeSelect}`,
      [username, email, passwordHash, first_name, last_name, country, profession, phone, workplace]
    );
    const uid = created.rows[0].id;
    await replaceUserRoles(client, uid, roleList);
    await client.query('COMMIT');
    const roles = await getRolesForUser(uid);
    return res.status(201).json({ success: true, data: mapUserWithRoles(created.rows[0], roles) });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Error en createUser:', e);
    return res.status(500).json({ success: false, error: 'Error al crear usuario' });
  } finally {
    client.release();
  }
};

const updateUser = async (req, res) => {
  const allowed = ['username', 'email', 'first_name', 'last_name', 'country', 'profession', 'phone', 'workplace'];
  const entries = Object.entries(req.body).filter(([k, v]) => allowed.includes(k) && v !== undefined);
  if (entries.length === 0) return res.status(400).json({ success: false, error: 'No hay campos validos para actualizar' });
  const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
  const values = entries.map(([, v]) => v);
  values.push(req.params.id);
  const updated = await query(`UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING ${safeSelect}`, values);
  if (updated.rows.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  const roles = await getRolesForUser(req.params.id);
  return res.json({ success: true, data: mapUserWithRoles(updated.rows[0], roles) });
};

const deleteUser = async (req, res) => {
  const deleted = await query('UPDATE users SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', [req.params.id]);
  if (deleted.rows.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  return res.json({ success: true, data: deleted.rows[0] });
};

const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ success: false, error: 'role es requerido' });
  await replaceUserRolesForUser(parseInt(req.params.id, 10), [role]);
  const updated = await query('SELECT id FROM users WHERE id = $1', [req.params.id]);
  if (updated.rows.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  const roles = await getRolesForUser(req.params.id);
  return res.json({ success: true, data: { id: parseInt(req.params.id, 10), roles } });
};

const activateUser = async (req, res) => {
  const updated = await query('UPDATE users SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, deleted_at', [req.params.id]);
  if (updated.rows.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  return res.json({ success: true, data: updated.rows[0] });
};

const deactivateUser = async (req, res) => {
  const updated = await query('UPDATE users SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, deleted_at', [req.params.id]);
  if (updated.rows.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  return res.json({ success: true, data: updated.rows[0] });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  activateUser,
  deactivateUser,
};
