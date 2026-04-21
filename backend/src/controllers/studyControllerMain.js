const { query } = require('../config/database');

const isAdmin = (user) => user && Array.isArray(user.roles) && user.roles.includes('admin');

const canViewStudy = (study, user) => {
  if (!study) return false;
  if (study.publication_status === 'published') return true;
  if (!user) return false;
  if (isAdmin(user)) return true;
  return study.researcher_id != null && Number(study.researcher_id) === Number(user.id);
};

/** Lista estudios publicados (ficha pública de índice). */
const getPublicStudiesCatalog = async (req, res) => {
  try {
    const result = await query(
      `SELECT
         s.id,
         s.title,
         s.study_date,
         s.created_at,
         s.fossil_id,
         f.name AS fossil_name,
         f.unique_code AS fossil_unique_code
       FROM scientific_studies s
       INNER JOIN fossils f ON f.id = s.fossil_id AND f.deleted_at IS NULL
       WHERE s.publication_status = 'published'
         AND f.status = 'published'
       ORDER BY s.created_at DESC
       LIMIT 500`,
      []
    );
    return res.json({ success: true, data: result.rows });
  } catch (e) {
    if (e.code === '42703') {
      return res.status(500).json({
        success: false,
        error: 'Base de datos sin columnas de publicación de estudios. Ejecute database/migrations/012_scientific_studies_publication.sql',
      });
    }
    console.error('getPublicStudiesCatalog', e);
    return res.status(500).json({ success: false, error: 'Error al listar estudios' });
  }
};

/** Catálogo público: estudios publicados + conteo de pendientes (sin contenido reservado). */
const getPublicStudiesByFossil = async (req, res) => {
  const fossilId = Number(req.params.fossilId);
  if (!fossilId || Number.isNaN(fossilId)) {
    return res.status(400).json({ success: false, error: 'fossilId inválido' });
  }
  try {
    const [published, pendingCnt] = await Promise.all([
      query(
        `SELECT *
         FROM scientific_studies
         WHERE fossil_id = $1 AND publication_status = 'published'
         ORDER BY created_at DESC`,
        [fossilId]
      ),
      query(
        `SELECT COUNT(*)::int AS c
         FROM scientific_studies
         WHERE fossil_id = $1 AND publication_status = 'pending'`,
        [fossilId]
      ),
    ]);
    return res.json({
      success: true,
      data: {
        published: published.rows,
        pending_review_count: pendingCnt.rows[0]?.c ?? 0,
      },
    });
  } catch (e) {
    if (e.code === '42703') {
      return res.status(500).json({
        success: false,
        error: 'Base de datos sin columnas de publicación de estudios. Ejecute database/migrations/012_scientific_studies_publication.sql',
      });
    }
    console.error('getPublicStudiesByFossil', e);
    return res.status(500).json({ success: false, error: 'Error al cargar estudios' });
  }
};

/** Solo publicado — para enlaces públicos */
const getPublicStudyById = async (req, res) => {
  try {
    const result = await query(
      `SELECT s.*, f.name AS fossil_name, f.unique_code AS fossil_unique_code
       FROM scientific_studies s
       INNER JOIN fossils f ON f.id = s.fossil_id AND f.deleted_at IS NULL
       WHERE s.id = $1
         AND s.publication_status = 'published'
         AND f.status = 'published'`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Estudio no encontrado' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    if (e.code === '42703') {
      return res.status(500).json({
        success: false,
        error: 'Base de datos sin columnas de publicación de estudios. Ejecute database/migrations/012_scientific_studies_publication.sql',
      });
    }
    console.error('getPublicStudyById', e);
    return res.status(500).json({ success: false, error: 'Error al cargar estudio' });
  }
};

const getPendingStudies = async (req, res) => {
  try {
    const result = await query(
      `SELECT s.*,
              f.name AS fossil_name,
              f.unique_code AS fossil_unique_code,
              (SELECT uu.username FROM users uu
               WHERE uu.id = s.researcher_id AND uu.deleted_at IS NULL LIMIT 1) AS study_researcher_login,
              (SELECT uu.email FROM users uu
               WHERE uu.id = s.researcher_id AND uu.deleted_at IS NULL LIMIT 1) AS study_researcher_email
       FROM scientific_studies s
       JOIN fossils f ON f.id = s.fossil_id AND f.deleted_at IS NULL
       WHERE s.publication_status = 'pending'
       ORDER BY s.created_at ASC`,
      []
    );
    return res.json({ success: true, data: result.rows });
  } catch (e) {
    if (e.code === '42703') {
      return res.status(500).json({
        success: false,
        error: 'Base de datos sin columnas de publicación de estudios. Ejecute database/migrations/012_scientific_studies_publication.sql',
      });
    }
    console.error('getPendingStudies', e);
    return res.status(500).json({ success: false, error: 'Error al listar estudios pendientes' });
  }
};

const getStudies = async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const st = req.query.status;
      let sql = `SELECT s.*,
                        f.name AS fossil_name,
                        f.unique_code AS fossil_unique_code,
                        (SELECT uu.username FROM users uu
                         WHERE uu.id = s.researcher_id AND uu.deleted_at IS NULL LIMIT 1) AS study_researcher_login,
                        (SELECT uu.email FROM users uu
                         WHERE uu.id = s.researcher_id AND uu.deleted_at IS NULL LIMIT 1) AS study_researcher_email
                 FROM scientific_studies s
                 LEFT JOIN fossils f ON f.id = s.fossil_id AND f.deleted_at IS NULL
                 WHERE 1=1`;
      const params = [];
      if (st && ['pending', 'published', 'rejected'].includes(String(st))) {
        sql += ` AND s.publication_status = $1`;
        params.push(st);
      }
      sql += ' ORDER BY s.created_at DESC';
      const result = await query(sql, params);
      return res.json({ success: true, data: result.rows });
    }
    const result = await query(
      `SELECT * FROM scientific_studies WHERE researcher_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, data: result.rows });
  } catch (e) {
    if (e.code === '42703') {
      return res.status(500).json({
        success: false,
        error: 'Base de datos sin columnas de publicación de estudios. Ejecute database/migrations/012_scientific_studies_publication.sql',
      });
    }
    console.error('getStudies', e);
    return res.status(500).json({ success: false, error: 'Error al listar estudios' });
  }
};

const getStudyById = async (req, res) => {
  try {
    const result = await query('SELECT * FROM scientific_studies WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Estudio no encontrado' });
    }
    const study = result.rows[0];
    if (!canViewStudy(study, req.user)) {
      return res.status(404).json({ success: false, error: 'Estudio no encontrado' });
    }
    return res.json({ success: true, data: study });
  } catch (e) {
    if (e.code === '42703') {
      return res.status(500).json({
        success: false,
        error: 'Base de datos sin columnas de publicación de estudios. Ejecute database/migrations/012_scientific_studies_publication.sql',
      });
    }
    console.error('getStudyById', e);
    return res.status(500).json({ success: false, error: 'Error al cargar estudio' });
  }
};

const getStudiesByFossil = async (req, res) => {
  const fossilId = Number(req.params.fossilId);
  if (!fossilId || Number.isNaN(fossilId)) {
    return res.status(400).json({ success: false, error: 'fossilId inválido' });
  }
  try {
    if (isAdmin(req.user)) {
      const result = await query(
        `SELECT * FROM scientific_studies WHERE fossil_id = $1 ORDER BY created_at DESC`,
        [fossilId]
      );
      return res.json({ success: true, data: result.rows });
    }
    const result = await query(
      `SELECT * FROM scientific_studies
       WHERE fossil_id = $1
         AND (publication_status = 'published' OR researcher_id = $2)
       ORDER BY created_at DESC`,
      [fossilId, req.user.id]
    );
    return res.json({ success: true, data: result.rows });
  } catch (e) {
    if (e.code === '42703') {
      return res.status(500).json({
        success: false,
        error: 'Base de datos sin columnas de publicación de estudios. Ejecute database/migrations/012_scientific_studies_publication.sql',
      });
    }
    console.error('getStudiesByFossil', e);
    return res.status(500).json({ success: false, error: 'Error al cargar estudios' });
  }
};

const createStudy = async (req, res) => {
  const b = req.body || {};
  const fossil_id = Number(b.fossil_id);
  if (!fossil_id || Number.isNaN(fossil_id)) {
    return res.status(400).json({ success: false, error: 'fossil_id es requerido' });
  }

  const composition_image_path = req.file ? `study-composition/${req.file.filename}` : null;

  const {
    researcher_id,
    title,
    introduction,
    analysis_type,
    results,
    composition,
    conditions,
    references,
    references_text,
    study_date,
    context_objectives,
    references_links,
    institution_contact,
    study_site_notes,
    visual_evidence_notes,
  } = b;

  const refText = references_text ?? references ?? null;

  try {
    const created = await query(
      `INSERT INTO scientific_studies (
        fossil_id, researcher_id, title, introduction, analysis_type, results, composition, conditions,
        references_text, study_date,
        context_objectives, references_links, institution_contact, study_site_notes, visual_evidence_notes,
        composition_image_path
      )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [
        fossil_id,
        researcher_id || req.user?.id || null,
        title || null,
        introduction || null,
        analysis_type || null,
        results || null,
        composition || null,
        conditions || null,
        refText,
        study_date || null,
        context_objectives || null,
        references_links || null,
        institution_contact || null,
        study_site_notes || null,
        visual_evidence_notes || null,
        composition_image_path,
      ]
    );
    return res.status(201).json({ success: true, data: created.rows[0] });
  } catch (e) {
    if (e.code === '42703') {
      return res.status(500).json({
        success: false,
        error:
          'Base de datos sin columnas extendidas de estudio o de publicación. Ejecute migraciones 011 y 012.',
      });
    }
    console.error('createStudy', e);
    return res.status(500).json({ success: false, error: 'Error al crear estudio' });
  }
};

const updateStudy = async (req, res) => {
  const existing = await query('SELECT * FROM scientific_studies WHERE id = $1', [req.params.id]);
  if (existing.rows.length === 0) return res.status(404).json({ success: false, error: 'Estudio no encontrado' });
  const row = existing.rows[0];

  const admin = isAdmin(req.user);
  if (!admin) {
    if (row.researcher_id == null || Number(row.researcher_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, error: 'No autorizado a editar este estudio' });
    }
  }

  const incoming = { ...req.body };
  if (req.file) {
    incoming.composition_image_path = `study-composition/${req.file.filename}`;
  }
  if (incoming.references !== undefined && incoming.references_text === undefined) {
    incoming.references_text = incoming.references;
  }
  if (!admin) {
    delete incoming.publication_status;
    delete incoming.approved_by;
    delete incoming.approved_at;
    delete incoming.rejection_reason;
  }

  const allowed = [
    'researcher_id',
    'title',
    'introduction',
    'analysis_type',
    'results',
    'composition',
    'conditions',
    'references_text',
    'study_date',
    'context_objectives',
    'references_links',
    'institution_contact',
    'study_site_notes',
    'visual_evidence_notes',
    'composition_image_path',
    'publication_status',
  ];
  const entries = Object.entries(incoming).filter(([k, v]) => allowed.includes(k) && v !== undefined);
  if (!admin) {
    entries.push(['publication_status', 'pending']);
    entries.push(['approved_by', null]);
    entries.push(['approved_at', null]);
    entries.push(['rejection_reason', null]);
  }
  if (entries.length === 0) return res.status(400).json({ success: false, error: 'No hay campos validos para actualizar' });
  const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
  const values = entries.map(([, v]) => v);
  values.push(req.params.id);
  const updated = await query(
    `UPDATE scientific_studies SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
    values
  );
  if (updated.rows.length === 0) return res.status(404).json({ success: false, error: 'Estudio no encontrado' });
  return res.json({
    success: true,
    message: admin
      ? 'Estudio actualizado'
      : 'Estudio actualizado y enviado nuevamente a revisión administrativa.',
    data: updated.rows[0],
  });
};

const publishStudy = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await query(
      `UPDATE scientific_studies
       SET publication_status = 'published',
           approved_at = CURRENT_TIMESTAMP,
           approved_by = $2,
           rejection_reason = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND publication_status IN ('pending','rejected')
       RETURNING *`,
      [id, req.user.id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Estudio no encontrado o ya publicado' });
    }
    return res.json({ success: true, data: updated.rows[0] });
  } catch (e) {
    if (e.code === '42703') {
      return res.status(500).json({
        success: false,
        error: 'Base de datos sin columnas de publicación de estudios. Ejecute database/migrations/012_scientific_studies_publication.sql',
      });
    }
    console.error('publishStudy', e);
    return res.status(500).json({ success: false, error: 'Error al publicar estudio' });
  }
};

const rejectStudy = async (req, res) => {
  const reason = req.body && req.body.reason != null ? String(req.body.reason).trim() || null : null;
  try {
    const id = req.params.id;
    const updated = await query(
      `UPDATE scientific_studies
       SET publication_status = 'rejected',
           rejection_reason = $2,
           approved_at = NULL,
           approved_by = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND publication_status = 'pending'
       RETURNING *`,
      [id, reason]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Estudio no encontrado o no está pendiente' });
    }
    return res.json({ success: true, data: updated.rows[0] });
  } catch (e) {
    if (e.code === '42703') {
      return res.status(500).json({
        success: false,
        error: 'Base de datos sin columnas de publicación de estudios. Ejecute database/migrations/012_scientific_studies_publication.sql',
      });
    }
    console.error('rejectStudy', e);
    return res.status(500).json({ success: false, error: 'Error al rechazar estudio' });
  }
};

const deleteStudy = async (req, res) => {
  const existing = await query('SELECT * FROM scientific_studies WHERE id = $1', [req.params.id]);
  if (existing.rows.length === 0) return res.status(404).json({ success: false, error: 'Estudio no encontrado' });
  const row = existing.rows[0];
  const admin = isAdmin(req.user);
  if (!admin) {
    if (row.researcher_id == null || Number(row.researcher_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, error: 'No autorizado' });
    }
    if (row.publication_status === 'published') {
      return res.status(403).json({ success: false, error: 'No puede eliminar un estudio publicado; contacte a un administrador' });
    }
  }

  const deleted = await query('DELETE FROM scientific_studies WHERE id = $1 RETURNING id', [req.params.id]);
  if (deleted.rows.length === 0) return res.status(404).json({ success: false, error: 'Estudio no encontrado' });
  return res.json({ success: true, data: deleted.rows[0] });
};

module.exports = {
  getStudies,
  getStudyById,
  getStudiesByFossil,
  getPublicStudiesCatalog,
  getPublicStudiesByFossil,
  getPublicStudyById,
  getPendingStudies,
  createStudy,
  updateStudy,
  deleteStudy,
  publishStudy,
  rejectStudy,
};
