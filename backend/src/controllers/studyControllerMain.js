const { query } = require('../config/database');

const getStudies = async (req, res) => {
  const result = await query('SELECT * FROM scientific_studies ORDER BY created_at DESC', []);
  return res.json({ success: true, data: result.rows });
};

const getStudyById = async (req, res) => {
  const result = await query('SELECT * FROM scientific_studies WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Estudio no encontrado' });
  return res.json({ success: true, data: result.rows[0] });
};

const getStudiesByFossil = async (req, res) => {
  const result = await query('SELECT * FROM scientific_studies WHERE fossil_id = $1 ORDER BY created_at DESC', [req.params.fossilId]);
  return res.json({ success: true, data: result.rows });
};

const createStudy = async (req, res) => {
  const { fossil_id, researcher_id, title, introduction, analysis_type, results, composition, conditions, references, study_date } = req.body;
  if (!fossil_id) return res.status(400).json({ success: false, error: 'fossil_id es requerido' });
  const created = await query(
    `INSERT INTO scientific_studies (fossil_id, researcher_id, title, introduction, analysis_type, results, composition, conditions, references, study_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [fossil_id, researcher_id || req.user?.id || null, title || null, introduction || null, analysis_type || null, results || null, composition || null, conditions || null, references || null, study_date || null]
  );
  return res.status(201).json({ success: true, data: created.rows[0] });
};

const updateStudy = async (req, res) => {
  const allowed = ['researcher_id', 'title', 'introduction', 'analysis_type', 'results', 'composition', 'conditions', 'references', 'study_date'];
  const entries = Object.entries(req.body).filter(([k, v]) => allowed.includes(k) && v !== undefined);
  if (entries.length === 0) return res.status(400).json({ success: false, error: 'No hay campos validos para actualizar' });
  const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
  const values = entries.map(([, v]) => v);
  values.push(req.params.id);
  const updated = await query(`UPDATE scientific_studies SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`, values);
  if (updated.rows.length === 0) return res.status(404).json({ success: false, error: 'Estudio no encontrado' });
  return res.json({ success: true, data: updated.rows[0] });
};

const deleteStudy = async (req, res) => {
  const deleted = await query('DELETE FROM scientific_studies WHERE id = $1 RETURNING id', [req.params.id]);
  if (deleted.rows.length === 0) return res.status(404).json({ success: false, error: 'Estudio no encontrado' });
  return res.json({ success: true, data: deleted.rows[0] });
};

module.exports = {
  getStudies,
  getStudyById,
  getStudiesByFossil,
  createStudy,
  updateStudy,
  deleteStudy,
};
