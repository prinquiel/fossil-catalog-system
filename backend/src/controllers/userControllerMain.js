const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const safeSelect = `
  id, username, email, role, first_name, last_name, country, profession, phone, workplace, created_at, updated_at, deleted_at
`;

const getUsers = async (req, res) => {
  const result = await query(`SELECT ${safeSelect} FROM users ORDER BY id`, []);
  return res.json({ success: true, data: result.rows });
};

const getUserById = async (req, res) => {
  const result = await query(`SELECT ${safeSelect} FROM users WHERE id = $1`, [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  return res.json({ success: true, data: result.rows[0] });
};

const createUser = async (req, res) => {
  const { username, email, password, role, first_name, last_name, country, profession, phone, workplace } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ success: false, error: 'username, email, password y role son requeridos' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const created = await query(
    `INSERT INTO users (username, email, password_hash, role, first_name, last_name, country, profession, phone, workplace)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING ${safeSelect}`,
    [username, email, passwordHash, role, first_name, last_name, country, profession, phone, workplace]
  );
  return res.status(201).json({ success: true, data: created.rows[0] });
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
  return res.json({ success: true, data: updated.rows[0] });
};

const deleteUser = async (req, res) => {
  const deleted = await query('UPDATE users SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', [req.params.id]);
  if (deleted.rows.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  return res.json({ success: true, data: deleted.rows[0] });
};

const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ success: false, error: 'role es requerido' });
  const updated = await query('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, role', [role, req.params.id]);
  if (updated.rows.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  return res.json({ success: true, data: updated.rows[0] });
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
