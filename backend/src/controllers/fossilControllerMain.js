const { query } = require('../config/database');

const generateUniqueCode = (category) => {
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `CRI-UNK-UNK-${category}-${random}`;
};

const getFossils = async (req, res) => {
  try {
    const result = await query(
      `SELECT f.*, u.username AS created_by_username
       FROM fossils f
       JOIN users u ON u.id = f.created_by
       WHERE f.deleted_at IS NULL
       ORDER BY f.created_at DESC`,
      []
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error en getFossils:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener fosiles' });
  }
};

const getFossilById = async (req, res) => {
  try {
    const result = await query(
      `SELECT f.*, l.country_code, l.province_code, l.canton_code, l.latitude, l.longitude, l.location_description
       FROM fossils f
       LEFT JOIN locations l ON l.fossil_id = f.id
       WHERE f.id = $1 AND f.deleted_at IS NULL`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fosil no encontrado' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error en getFossilById:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener fosil' });
  }
};

const createFossil = async (req, res) => {
  try {
    const {
      unique_code,
      name,
      category,
      description,
      discoverer_name,
      discovery_date,
      original_state_description,
      geological_context,
      province_code,
      canton_code,
      latitude,
      longitude,
      location_description,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, error: 'name y category son requeridos' });
    }

    const finalCode = unique_code || generateUniqueCode(category);
    const created = await query(
      `INSERT INTO fossils (unique_code, name, category, description, discoverer_name, discovery_date, original_state_description, geological_context, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [finalCode, name, category, description, discoverer_name, discovery_date, original_state_description, geological_context, req.user.id]
    );

    const fossil = created.rows[0];
    if (province_code && canton_code) {
      await query(
        `INSERT INTO locations (fossil_id, province_code, canton_code, latitude, longitude, location_description)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [fossil.id, province_code, canton_code, latitude || null, longitude || null, location_description || null]
      );
    }

    return res.status(201).json({ success: true, message: 'Fosil creado', data: fossil });
  } catch (error) {
    console.error('Error en createFossil:', error);
    return res.status(500).json({ success: false, error: 'Error al crear fosil' });
  }
};

const updateFossil = async (req, res) => {
  try {
    const allowed = [
      'name',
      'category',
      'description',
      'status',
      'discoverer_name',
      'discovery_date',
      'original_state_description',
      'geological_context',
    ];
    const entries = Object.entries(req.body).filter(([k, v]) => allowed.includes(k) && v !== undefined);
    if (entries.length === 0) {
      return res.status(400).json({ success: false, error: 'No hay campos validos para actualizar' });
    }
    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v);
    values.push(req.params.id);

    const updated = await query(
      `UPDATE fossils SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${values.length} AND deleted_at IS NULL
       RETURNING *`,
      values
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fosil no encontrado' });
    }
    return res.json({ success: true, message: 'Fosil actualizado', data: updated.rows[0] });
  } catch (error) {
    console.error('Error en updateFossil:', error);
    return res.status(500).json({ success: false, error: 'Error al actualizar fosil' });
  }
};

const deleteFossil = async (req, res) => {
  try {
    const deleted = await query(
      `UPDATE fossils SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [req.params.id]
    );
    if (deleted.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fosil no encontrado' });
    }
    return res.json({ success: true, message: 'Fosil eliminado', data: deleted.rows[0] });
  } catch (error) {
    console.error('Error en deleteFossil:', error);
    return res.status(500).json({ success: false, error: 'Error al eliminar fosil' });
  }
};

const getPendingFossils = async (req, res) => {
  try {
    const result = await query(
      `SELECT f.*, u.username AS created_by_username
       FROM fossils f
       JOIN users u ON u.id = f.created_by
       WHERE f.status = 'pending' AND f.deleted_at IS NULL
       ORDER BY f.created_at DESC`,
      []
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error en getPendingFossils:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener fosiles pendientes' });
  }
};

const approveFossil = async (req, res) => {
  try {
    const updated = await query(
      `UPDATE fossils
       SET status = 'published', approved_by = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fosil no encontrado' });
    }
    return res.json({ success: true, message: 'Fosil aprobado', data: updated.rows[0] });
  } catch (error) {
    console.error('Error en approveFossil:', error);
    return res.status(500).json({ success: false, error: 'Error al aprobar fosil' });
  }
};

const rejectFossil = async (req, res) => {
  try {
    const updated = await query(
      `UPDATE fossils
       SET status = 'rejected', approved_by = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fosil no encontrado' });
    }
    return res.json({ success: true, message: 'Fosil rechazado', data: updated.rows[0] });
  } catch (error) {
    console.error('Error en rejectFossil:', error);
    return res.status(500).json({ success: false, error: 'Error al rechazar fosil' });
  }
};

const getFossilsMap = async (req, res) => {
  try {
    const result = await query(
      `SELECT f.id, f.unique_code, f.name, f.category, f.status, l.latitude, l.longitude, l.province_code, l.canton_code
       FROM fossils f
       JOIN locations l ON l.fossil_id = f.id
       WHERE f.deleted_at IS NULL AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL`,
      []
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error en getFossilsMap:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener mapa de fosiles' });
  }
};

module.exports = {
  getFossils,
  getFossilById,
  createFossil,
  updateFossil,
  deleteFossil,
  getPendingFossils,
  approveFossil,
  rejectFossil,
  getFossilsMap,
};
