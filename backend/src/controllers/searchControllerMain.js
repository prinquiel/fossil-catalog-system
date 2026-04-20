const { query } = require('../config/database');

const search = async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ success: false, error: 'Parametro q es requerido' });
  const result = await query(
    `SELECT id, unique_code, name, category, status, description
     FROM fossils
     WHERE deleted_at IS NULL
       AND (name ILIKE $1 OR description ILIKE $1 OR unique_code ILIKE $1)
     ORDER BY created_at DESC
     LIMIT 100`,
    [`%${q}%`]
  );
  return res.json({ success: true, data: result.rows });
};

const advancedSearch = async (req, res) => {
  const filters = [];
  const values = [];
  let i = 1;

  if (req.query.name) {
    filters.push(`f.name ILIKE $${i++}`);
    values.push(`%${req.query.name}%`);
  }
  if (req.query.category) {
    filters.push(`f.category = $${i++}`);
    values.push(req.query.category);
  }
  if (req.query.status) {
    filters.push(`f.status = $${i++}`);
    values.push(req.query.status);
  }
  if (req.query.province_code) {
    filters.push(`l.province_code = $${i++}`);
    values.push(req.query.province_code);
  }
  if (req.query.era_id) {
    filters.push(`fgc.era_id = $${i++}`);
    values.push(req.query.era_id);
  }
  if (req.query.period_id) {
    filters.push(`fgc.period_id = $${i++}`);
    values.push(req.query.period_id);
  }
  if (req.query.species_id) {
    filters.push(`ftc.species_id = $${i++}`);
    values.push(req.query.species_id);
  }

  const where = filters.length > 0 ? `AND ${filters.join(' AND ')}` : '';
  const result = await query(
    `SELECT DISTINCT f.id, f.unique_code, f.name, f.category, f.status
     FROM fossils f
     LEFT JOIN locations l ON l.fossil_id = f.id
     LEFT JOIN fossil_geological_classification fgc ON fgc.fossil_id = f.id
     LEFT JOIN fossil_taxonomic_classification ftc ON ftc.fossil_id = f.id
     WHERE f.deleted_at IS NULL ${where}
     ORDER BY f.created_at DESC
     LIMIT 200`,
    values
  );
  return res.json({ success: true, data: result.rows });
};

module.exports = { search, advancedSearch };
