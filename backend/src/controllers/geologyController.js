const { pool } = require('../config/database');

const getEras = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM geological_eras ORDER BY start_millions_years DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error en getEras:', error);
    res.status(500).json({ success: false, error: 'Error al obtener eras' });
  }
};

const getPeriods = async (req, res) => {
  try {
    const { eraId } = req.params;
    
    let query = `
      SELECT p.*, e.name as era_name
      FROM geological_periods p
      LEFT JOIN geological_eras e ON p.era_id = e.id
    `;
    
    const params = [];
    if (eraId) {
      query += ' WHERE p.era_id = $1';
      params.push(eraId);
    }
    
    query += ' ORDER BY p.start_millions_years DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error en getPeriods:', error);
    res.status(500).json({ success: false, error: 'Error al obtener períodos' });
  }
};

const getGeologyByFossil = async (req, res) => {
  try {
    const { fossilId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        fgc.*,
        e.name as era_name,
        e.start_millions_years as era_start,
        e.end_millions_years as era_end,
        p.name as period_name,
        p.start_millions_years as period_start,
        p.end_millions_years as period_end
      FROM fossil_geological_classification fgc
      LEFT JOIN geological_eras e ON fgc.era_id = e.id
      LEFT JOIN geological_periods p ON fgc.period_id = p.id
      WHERE fgc.fossil_id = $1`,
      [fossilId]
    );
    
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'Este fósil no tiene clasificación geológica asignada'
      });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error en getGeologyByFossil:', error);
    res.status(500).json({ success: false, error: 'Error al obtener clasificación geológica' });
  }
};

const setGeologyForFossil = async (req, res) => {
  try {
    const { fossilId } = req.params;
    const { era_id, period_id } = req.body;
    
    const fossilCheck = await pool.query(
      'SELECT * FROM fossils WHERE id = $1 AND deleted_at IS NULL',
      [fossilId]
    );
    
    if (fossilCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fósil no encontrado' });
    }
    
    const existingCheck = await pool.query(
      'SELECT * FROM fossil_geological_classification WHERE fossil_id = $1',
      [fossilId]
    );
    
    let result;
    
    if (existingCheck.rows.length > 0) {
      result = await pool.query(
        `UPDATE fossil_geological_classification
         SET era_id = $1, period_id = $2
         WHERE fossil_id = $3
         RETURNING *`,
        [era_id, period_id, fossilId]
      );
    } else {
      result = await pool.query(
        `INSERT INTO fossil_geological_classification (fossil_id, era_id, period_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [fossilId, era_id, period_id]
      );
    }
    
    res.json({
      success: true,
      message: 'Clasificación geológica asignada',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error en setGeologyForFossil:', error);
    res.status(500).json({ success: false, error: 'Error al asignar clasificación geológica' });
  }
};

module.exports = {
  getEras,
  getPeriods,
  getGeologyByFossil,
  setGeologyForFossil,
};
