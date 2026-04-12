const { pool } = require('../config/database');
const { processImage, deleteImage } = require('../services/imageProcessor');
const path = require('path');

const uploadMedia = async (req, res) => {
  const client = await pool.connect();
  
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se subieron archivos'
      });
    }

    const { fossil_id, media_category, angle } = req.body;

    if (!fossil_id) {
      return res.status(400).json({
        success: false,
        error: 'fossil_id es requerido'
      });
    }

    const fossilCheck = await pool.query(
      'SELECT * FROM fossils WHERE id = $1 AND deleted_at IS NULL',
      [fossil_id]
    );

    if (fossilCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Fósil no encontrado'
      });
    }

    const fossil = fossilCheck.rows[0];

    if (req.user.role === 'explorer' && fossil.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para subir imágenes a este fósil'
      });
    }

    await client.query('BEGIN');

    const uploadedMedia = [];

    for (const file of req.files) {
      console.log('📸 Procesando imagen:', file.filename);

      const processed = await processImage(file.path);

      const relativePath = path.relative(
        path.join(__dirname, '../../'),
        processed.optimized.path
      );

      const result = await client.query(
        `INSERT INTO media (fossil_id, file_name, file_path, file_type, media_category, angle, file_size)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          fossil_id,
          file.filename,
          relativePath,
          'image',
          media_category || 'general',
          angle || 'other',
          processed.optimized.size
        ]
      );

      uploadedMedia.push(result.rows[0]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: `${uploadedMedia.length} imagen(es) subida(s) exitosamente`,
      data: uploadedMedia
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en uploadMedia:', error);
    res.status(500).json({
      success: false,
      error: 'Error al subir imágenes: ' + error.message
    });
  } finally {
    client.release();
  }
};

const getMediaByFossil = async (req, res) => {
  try {
    const { fossilId } = req.params;

    const result = await pool.query(
      `SELECT m.*, f.name as fossil_name
       FROM media m
       JOIN fossils f ON m.fossil_id = f.id
       WHERE m.fossil_id = $1
       ORDER BY m.uploaded_at ASC`,
      [fossilId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error en getMediaByFossil:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener imágenes'
    });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const mediaResult = await pool.query(
      `SELECT m.*, f.created_by
       FROM media m
       JOIN fossils f ON m.fossil_id = f.id
       WHERE m.id = $1`,
      [id]
    );

    if (mediaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada'
      });
    }

    const media = mediaResult.rows[0];

    if (req.user.role === 'explorer' && media.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para eliminar esta imagen'
      });
    }

    const fullPath = path.join(__dirname, '../../', media.file_path);
    await deleteImage(fullPath);

    await pool.query('DELETE FROM media WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteMedia:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar imagen'
    });
  }
};

const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { media_category, angle } = req.body;

    const result = await pool.query(
      `UPDATE media
       SET media_category = COALESCE($1, media_category),
           angle = COALESCE($2, angle)
       WHERE id = $3
       RETURNING *`,
      [media_category, angle, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Metadatos actualizados',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error en updateMedia:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar imagen'
    });
  }
};

module.exports = {
  uploadMedia,
  getMediaByFossil,
  deleteMedia,
  updateMedia,
};
