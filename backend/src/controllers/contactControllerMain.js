const { query } = require('../config/database');

const createContact = async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: 'name, email, subject y message son requeridos' });
  }
  const created = await query(
    'INSERT INTO contact_messages (name, email, subject, message) VALUES ($1,$2,$3,$4) RETURNING *',
    [name, email, subject, message]
  );
  return res.status(201).json({ success: true, data: created.rows[0] });
};

const getContacts = async (req, res) => {
  const result = await query('SELECT * FROM contact_messages ORDER BY created_at DESC', []);
  return res.json({ success: true, data: result.rows });
};

const getContactById = async (req, res) => {
  const result = await query('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Contacto no encontrado' });
  return res.json({ success: true, data: result.rows[0] });
};

const markContactAsRead = async (req, res) => {
  const updated = await query(`UPDATE contact_messages SET status = 'read' WHERE id = $1 RETURNING *`, [req.params.id]);
  if (updated.rows.length === 0) return res.status(404).json({ success: false, error: 'Contacto no encontrado' });
  return res.json({ success: true, data: updated.rows[0] });
};

const replyContact = async (req, res) => {
  const updated = await query(`UPDATE contact_messages SET status = 'replied' WHERE id = $1 RETURNING *`, [req.params.id]);
  if (updated.rows.length === 0) return res.status(404).json({ success: false, error: 'Contacto no encontrado' });
  return res.json({ success: true, data: updated.rows[0] });
};

const deleteContact = async (req, res) => {
  const deleted = await query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [req.params.id]);
  if (deleted.rows.length === 0) return res.status(404).json({ success: false, error: 'Contacto no encontrado' });
  return res.json({ success: true, data: deleted.rows[0] });
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  markContactAsRead,
  replyContact,
  deleteContact,
};
