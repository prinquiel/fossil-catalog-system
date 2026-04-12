const { query } = require('../config/database');

const uploadMedia = async (req, res) => {
  try {
    const { fossil_id, file_name, file_path, file_type, media_category, angle, file_size } = req.body;
    if (!fossil_id || !file_name || !file_path || !file_type) {
      return res.status(400).json({ success: false, error: 'fossil_id, file_name, file_path y file_type son requeridos' });
    }
    const created = await query(
      `INSERT INTO media (fossil_id, file_name, file_path, file_type, media_category, angle, file_size)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [fossil_id, file_name, file_path, file_type, media_category || null, angle || null, file_size || null]
    );
    return res.status(201).json({ success: true, message: 'Media subido', data: created.rows[0] });
  } catch (error) {
    console.error('Error en uploadMedia:', error);
    return res.status(500).json({ success: false, error: 'Error al subir media' });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const deleted = await query('DELETE FROM media WHERE id = $1 RETURNING id', [req.params.id]);
    if (deleted.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Media no encontrado' });
    }
    return res.json({ success: true, message: 'Media eliminado', data: deleted.rows[0] });
  } catch (error) {
    console.error('Error en deleteMedia:', error);
    return res.status(500).json({ success: false, error: 'Error al eliminar media' });
  }
};

const getMediaByFossil = async (req, res) => {
  try {
    const result = await query('SELECT * FROM media WHERE fossil_id = $1 ORDER BY uploaded_at DESC', [req.params.fossilId]);
    return res.json({ success: true, message: 'Media por fosil', data: result.rows });
  } catch (error) {
    console.error('Error en getMediaByFossil:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener media del fosil' });
  }
};

const updateMedia = async (req, res) => {
  try {
    const allowed = ['file_name', 'file_path', 'file_type', 'media_category', 'angle', 'file_size'];
    const entries = Object.entries(req.body).filter(([k, v]) => allowed.includes(k) && v !== undefined);
    if (entries.length === 0) {
      return res.status(400).json({ success: false, error: 'No hay campos validos para actualizar' });
    }
    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v);
    values.push(req.params.id);

    const updated = await query(`UPDATE media SET ${setClause} WHERE id = $${values.length} RETURNING *`, values);
    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Media no encontrado' });
    }
    return res.json({ success: true, message: 'Media actualizado', data: updated.rows[0] });
  } catch (error) {
    console.error('Error en updateMedia:', error);
    return res.status(500).json({ success: false, error: 'Error al actualizar media' });
  }
};

module.exports = { uploadMedia, deleteMedia, getMediaByFossil, updateMedia };
