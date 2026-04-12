const { query } = require('../config/database');

const ok = (res, data) => res.json({ success: true, data });
const created = (res, data) => res.status(201).json({ success: true, data });

const getEras = async (req, res) => ok(res, (await query('SELECT * FROM geological_eras ORDER BY id', [])).rows);
const getEraById = async (req, res) => {
  const r = await query('SELECT * FROM geological_eras WHERE id = $1', [req.params.id]);
  if (r.rows.length === 0) return res.status(404).json({ success: false, error: 'Era no encontrada' });
  return ok(res, r.rows[0]);
};
const createEra = async (req, res) => created(
  res,
  (await query(
    'INSERT INTO geological_eras (name, start_millions_years, end_millions_years, description) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.body.name, req.body.start_millions_years || null, req.body.end_millions_years || null, req.body.description || null]
  )).rows[0]
);

const getPeriods = async (req, res) => ok(res, (await query('SELECT * FROM geological_periods ORDER BY id', [])).rows);
const getPeriodsByEra = async (req, res) => ok(res, (await query('SELECT * FROM geological_periods WHERE era_id = $1 ORDER BY id', [req.params.id])).rows);
const createPeriod = async (req, res) => created(
  res,
  (await query(
    'INSERT INTO geological_periods (era_id, name, start_millions_years, end_millions_years, description) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.body.era_id, req.body.name, req.body.start_millions_years || null, req.body.end_millions_years || null, req.body.description || null]
  )).rows[0]
);

const createFossilGeology = async (req, res) => {
  const { era_id, period_id } = req.body;
  const r = await query(
    `INSERT INTO fossil_geological_classification (fossil_id, era_id, period_id)
     VALUES ($1,$2,$3)
     ON CONFLICT (fossil_id) DO UPDATE SET era_id = EXCLUDED.era_id, period_id = EXCLUDED.period_id
     RETURNING *`,
    [req.params.fossilId, era_id || null, period_id || null]
  );
  return created(res, r.rows[0]);
};

const getFossilGeology = async (req, res) => {
  const r = await query('SELECT * FROM fossil_geological_classification WHERE fossil_id = $1', [req.params.fossilId]);
  if (r.rows.length === 0) return res.status(404).json({ success: false, error: 'Clasificacion geologica no encontrada' });
  return ok(res, r.rows[0]);
};

const updateFossilGeology = createFossilGeology;

module.exports = {
  getEras,
  getEraById,
  createEra,
  getPeriods,
  getPeriodsByEra,
  createPeriod,
  createFossilGeology,
  getFossilGeology,
  updateFossilGeology,
};
