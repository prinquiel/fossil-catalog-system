const { query } = require('../config/database');

const getAuditLogs = async (req, res) => {
  const result = await query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 500', []);
  return res.json({ success: true, data: result.rows });
};

const getAuditByUser = async (req, res) => {
  const result = await query('SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC', [req.params.userId]);
  return res.json({ success: true, data: result.rows });
};

const getAuditByTable = async (req, res) => {
  const result = await query('SELECT * FROM audit_logs WHERE table_name = $1 ORDER BY created_at DESC', [req.params.tableName]);
  return res.json({ success: true, data: result.rows });
};

const getAuditById = async (req, res) => {
  const result = await query('SELECT * FROM audit_logs WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Registro no encontrado' });
  return res.json({ success: true, data: result.rows[0] });
};

module.exports = { getAuditLogs, getAuditByUser, getAuditByTable, getAuditById };
