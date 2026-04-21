const { query } = require('../config/database');

const generateUniqueCode = (category) => {
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `CRI-UNK-UNK-${category}-${random}`;
};

const LOCATION_KEYS = [
  'country_code',
  'province_code',
  'canton_code',
  'latitude',
  'longitude',
  'location_description',
];

function locationPayloadTouched(body) {
  if (!body || typeof body !== 'object') return false;
  return LOCATION_KEYS.some((k) => Object.prototype.hasOwnProperty.call(body, k));
}

function trimOrNull(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

/**
 * @returns {{ skip?: boolean, clear?: boolean, error?: string, row?: object }}
 */
function parseLocationPayload(body, { allowClear } = {}) {
  const country_code = trimOrNull(body.country_code);
  const province_code = trimOrNull(body.province_code);
  const canton_code = trimOrNull(body.canton_code);
  const location_description = trimOrNull(body.location_description);

  const latRaw = body.latitude;
  const lngRaw = body.longitude;
  const latEmpty = latRaw === undefined || latRaw === null || String(latRaw).trim() === '';
  const lngEmpty = lngRaw === undefined || lngRaw === null || String(lngRaw).trim() === '';

  const latitude = latEmpty ? null : Number(latRaw);
  const longitude = lngEmpty ? null : Number(lngRaw);
  if (latitude !== null && Number.isNaN(latitude)) return { error: 'Latitud no valida' };
  if (longitude !== null && Number.isNaN(longitude)) return { error: 'Longitud no valida' };

  const hasGps = latitude != null && longitude != null;
  const hasDiv = Boolean(province_code && canton_code);
  const hasDesc = Boolean(location_description);

  const empty = !hasGps && !hasDiv && !hasDesc;
  const touched = locationPayloadTouched(body);

  if (empty) {
    if (allowClear && touched) return { clear: true };
    return { skip: true };
  }

  if (hasGps && !hasDiv) {
    return {
      row: {
        country_code,
        province_code: null,
        canton_code: null,
        latitude,
        longitude,
        location_description,
      },
    };
  }

  if (hasDiv) {
    return {
      row: {
        country_code: country_code || 'CRI',
        province_code,
        canton_code,
        latitude: hasGps ? latitude : null,
        longitude: hasGps ? longitude : null,
        location_description,
      },
    };
  }

  return { error: 'Indique coordenadas completas (latitud y longitud) o provincia y canton, o ambos.' };
}

async function syncLocationForFossil(fossilId, body, { allowClear } = {}) {
  const parsed = parseLocationPayload(body, { allowClear });
  if (parsed.error) {
    const e = new Error(parsed.error);
    e.code = 'LOCATION_VALIDATION';
    throw e;
  }
  if (parsed.skip) return;
  if (parsed.clear) {
    await query('DELETE FROM locations WHERE fossil_id = $1', [fossilId]);
    return;
  }
  const r = parsed.row;
  await query(
    `INSERT INTO locations (fossil_id, country_code, province_code, canton_code, latitude, longitude, location_description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (fossil_id) DO UPDATE SET
       country_code = EXCLUDED.country_code,
       province_code = EXCLUDED.province_code,
       canton_code = EXCLUDED.canton_code,
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude,
       location_description = EXCLUDED.location_description`,
    [
      fossilId,
      r.country_code,
      r.province_code,
      r.canton_code,
      r.latitude,
      r.longitude,
      r.location_description,
    ]
  );
}

function parseIdField(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function hasGeologyBody(body) {
  if (!body || typeof body !== 'object') return false;
  return (
    Object.prototype.hasOwnProperty.call(body, 'era_id') ||
    Object.prototype.hasOwnProperty.call(body, 'period_id')
  );
}

const TAXONOMY_KEYS = [
  'kingdom_id',
  'phylum_id',
  'class_id',
  'order_id',
  'family_id',
  'genus_id',
  'species_id',
];

function hasTaxonomyBody(body) {
  if (!body || typeof body !== 'object') return false;
  return TAXONOMY_KEYS.some((k) => Object.prototype.hasOwnProperty.call(body, k));
}

async function syncGeologyForFossil(fossilId, body) {
  if (!hasGeologyBody(body)) return;
  const era_id = parseIdField(body.era_id);
  const period_id = parseIdField(body.period_id);
  if (era_id == null && period_id == null) {
    await query('DELETE FROM fossil_geological_classification WHERE fossil_id = $1', [fossilId]);
    return;
  }
  const existing = await query('SELECT fossil_id FROM fossil_geological_classification WHERE fossil_id = $1', [
    fossilId,
  ]);
  if (existing.rows.length > 0) {
    await query(
      `UPDATE fossil_geological_classification SET era_id = $1, period_id = $2 WHERE fossil_id = $3`,
      [era_id, period_id, fossilId]
    );
  } else {
    await query(
      `INSERT INTO fossil_geological_classification (fossil_id, era_id, period_id) VALUES ($1, $2, $3)`,
      [fossilId, era_id, period_id]
    );
  }
}

async function syncTaxonomyForFossil(fossilId, body) {
  if (!hasTaxonomyBody(body)) return;
  const kingdom_id = parseIdField(body.kingdom_id);
  const phylum_id = parseIdField(body.phylum_id);
  const class_id = parseIdField(body.class_id);
  const order_id = parseIdField(body.order_id);
  const family_id = parseIdField(body.family_id);
  const genus_id = parseIdField(body.genus_id);
  const species_id = parseIdField(body.species_id);
  const allEmpty =
    kingdom_id == null &&
    phylum_id == null &&
    class_id == null &&
    order_id == null &&
    family_id == null &&
    genus_id == null &&
    species_id == null;
  if (allEmpty) {
    await query('DELETE FROM fossil_taxonomic_classification WHERE fossil_id = $1', [fossilId]);
    return;
  }
  const existing = await query('SELECT fossil_id FROM fossil_taxonomic_classification WHERE fossil_id = $1', [
    fossilId,
  ]);
  const updateVals = [kingdom_id, phylum_id, class_id, order_id, family_id, genus_id, species_id, fossilId];
  if (existing.rows.length > 0) {
    await query(
      `UPDATE fossil_taxonomic_classification
       SET kingdom_id = $1, phylum_id = $2, class_id = $3, order_id = $4,
           family_id = $5, genus_id = $6, species_id = $7
       WHERE fossil_id = $8`,
      updateVals
    );
  } else {
    await query(
      `INSERT INTO fossil_taxonomic_classification
        (fossil_id, kingdom_id, phylum_id, class_id, order_id, family_id, genus_id, species_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [fossilId, kingdom_id, phylum_id, class_id, order_id, family_id, genus_id, species_id]
    );
  }
}

/** SELECT + FROM + joins para una ficha con ubicación, era/período y taxonomía. */
const FOSSIL_FULL_SELECT = `
      SELECT f.*,
              l.country_code, l.province_code, l.canton_code, l.latitude, l.longitude, l.location_description,
              cu.username AS created_by_username,
              au.username AS approved_by_username,
              fgc.era_id, fgc.period_id,
              ge.name AS era_name,
              gp.name AS period_name,
              ftc.kingdom_id, ftc.phylum_id, ftc.class_id, ftc.order_id AS taxonomic_order_id,
              ftc.family_id, ftc.genus_id, ftc.species_id,
              tk.name AS kingdom_name,
              tph.name AS phylum_name,
              tcl.name AS class_name,
              tord.name AS order_name,
              tfa.name AS family_name,
              tge.name AS genus_name,
              tsp.name AS species_name,
              tsp.common_name AS species_common_name
       FROM fossils f
       LEFT JOIN locations l ON l.fossil_id = f.id
       JOIN users cu ON cu.id = f.created_by
       LEFT JOIN users au ON au.id = f.approved_by
       LEFT JOIN fossil_geological_classification fgc ON fgc.fossil_id = f.id
       LEFT JOIN geological_eras ge ON ge.id = fgc.era_id
       LEFT JOIN geological_periods gp ON gp.id = fgc.period_id
       LEFT JOIN fossil_taxonomic_classification ftc ON ftc.fossil_id = f.id
       LEFT JOIN taxonomic_kingdoms tk ON tk.id = ftc.kingdom_id
       LEFT JOIN taxonomic_phylums tph ON tph.id = ftc.phylum_id
       LEFT JOIN taxonomic_classes tcl ON tcl.id = ftc.class_id
       LEFT JOIN taxonomic_orders tord ON tord.id = ftc.order_id
       LEFT JOIN taxonomic_families tfa ON tfa.id = ftc.family_id
       LEFT JOIN taxonomic_genera tge ON tge.id = ftc.genus_id
       LEFT JOIN taxonomic_species tsp ON tsp.id = ftc.species_id`;

async function getFossilRowFullById(id) {
  const result = await query(`${FOSSIL_FULL_SELECT} WHERE f.id = $1 AND f.deleted_at IS NULL`, [id]);
  return result.rows[0] || null;
}

const getFossils = async (req, res) => {
  try {
    const result = await query(
      `SELECT f.*,
              l.country_code, l.province_code, l.canton_code, l.latitude, l.longitude, l.location_description,
              cu.username AS created_by_username,
              au.username AS approved_by_username,
              fgc.era_id, fgc.period_id,
              ge.name AS era_name,
              gp.name AS period_name,
              tk.name AS kingdom_name,
              tph.name AS phylum_name,
              tcl.name AS class_name,
              tord.name AS order_name,
              tfa.name AS family_name,
              tge.name AS genus_name,
              tsp.name AS species_name,
              COALESCE(m.media_count, 0)::int AS media_count
       FROM fossils f
       LEFT JOIN locations l ON l.fossil_id = f.id
       JOIN users cu ON cu.id = f.created_by
       LEFT JOIN users au ON au.id = f.approved_by
       LEFT JOIN fossil_geological_classification fgc ON fgc.fossil_id = f.id
       LEFT JOIN geological_eras ge ON ge.id = fgc.era_id
       LEFT JOIN geological_periods gp ON gp.id = fgc.period_id
       LEFT JOIN fossil_taxonomic_classification ftc ON ftc.fossil_id = f.id
       LEFT JOIN taxonomic_kingdoms tk ON tk.id = ftc.kingdom_id
       LEFT JOIN taxonomic_phylums tph ON tph.id = ftc.phylum_id
       LEFT JOIN taxonomic_classes tcl ON tcl.id = ftc.class_id
       LEFT JOIN taxonomic_orders tord ON tord.id = ftc.order_id
       LEFT JOIN taxonomic_families tfa ON tfa.id = ftc.family_id
       LEFT JOIN taxonomic_genera tge ON tge.id = ftc.genus_id
       LEFT JOIN taxonomic_species tsp ON tsp.id = ftc.species_id
       LEFT JOIN LATERAL (
         SELECT COUNT(*)::int AS media_count
         FROM media md
         WHERE md.fossil_id = f.id
       ) m ON TRUE
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
    const row = await getFossilRowFullById(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Fosil no encontrado' });
    }
    return res.json({ success: true, data: row });
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
    try {
      await syncLocationForFossil(fossil.id, req.body, { allowClear: false });
    } catch (locErr) {
      if (locErr.code === 'LOCATION_VALIDATION') {
        return res.status(400).json({ success: false, error: locErr.message });
      }
      if (locErr.code === '23502' || locErr.code === '23514') {
        return res.status(400).json({
          success: false,
          error:
            'No se pudo guardar la ubicacion: ejecute database/migrations/008_locations_optional_divisions.sql para permitir coordenadas sin provincia/canton.',
        });
      }
      throw locErr;
    }

    try {
      await syncGeologyForFossil(fossil.id, req.body);
      await syncTaxonomyForFossil(fossil.id, req.body);
    } catch (geoErr) {
      console.error('sync geo/tax create:', geoErr);
      return res.status(400).json({ success: false, error: 'No se pudo guardar era, periodo o taxonomia.' });
    }

    const full = await getFossilRowFullById(fossil.id);
    return res.status(201).json({ success: true, message: 'Fosil creado', data: full || fossil });
  } catch (error) {
    console.error('Error en createFossil:', error);
    return res.status(500).json({ success: false, error: 'Error al crear fosil' });
  }
};

const updateFossil = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await query(
      `SELECT id, created_by, status FROM fossils WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fosil no encontrado' });
    }

    const isAdmin = Array.isArray(req.user.roles) && req.user.roles.includes('admin');
    const ownerId = String(existing.rows[0].created_by);
    const requesterId = String(req.user.id);
    if (!isAdmin && ownerId !== requesterId) {
      return res.status(403).json({
        success: false,
        error: 'Solo el autor del registro o un administrador puede editar esta ficha.',
      });
    }

    const allowed = [
      'name',
      'category',
      'description',
      'discoverer_name',
      'discovery_date',
      'original_state_description',
      'geological_context',
    ];
    if (isAdmin) allowed.push('status');

    const body = { ...req.body };
    const entries = Object.entries(body).filter(([k, v]) => allowed.includes(k) && v !== undefined);

    const locTouched = locationPayloadTouched(body);
    const geoTouched = hasGeologyBody(body);
    const taxTouched = hasTaxonomyBody(body);
    const needsReapproval = !isAdmin && (entries.length > 0 || locTouched || geoTouched || taxTouched);
    if (entries.length === 0 && !locTouched && !geoTouched && !taxTouched) {
      return res.status(400).json({ success: false, error: 'No hay campos validos para actualizar' });
    }

    let updatedRow = existing.rows[0];
    const updateEntries = [...entries];
    if (needsReapproval) {
      updateEntries.push(['status', 'pending']);
      updateEntries.push(['approved_by', null]);
    }
    if (updateEntries.length > 0) {
      const setClause = updateEntries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
      const values = updateEntries.map(([, v]) => v);
      values.push(id);
      const updated = await query(
        `UPDATE fossils SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${values.length} AND deleted_at IS NULL
         RETURNING *`,
        values
      );
      if (updated.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Fosil no encontrado' });
      }
      updatedRow = updated.rows[0];
    }

    if (locTouched) {
      try {
        await syncLocationForFossil(id, body, { allowClear: true });
      } catch (locErr) {
        if (locErr.code === 'LOCATION_VALIDATION') {
          return res.status(400).json({ success: false, error: locErr.message });
        }
        if (locErr.code === '23502' || locErr.code === '23514') {
          return res.status(400).json({
            success: false,
            error:
              'Ubicacion: ejecute database/migrations/008_locations_optional_divisions.sql para guardar solo GPS sin codigos CR.',
          });
        }
        throw locErr;
      }
    }

    if (geoTouched || taxTouched) {
      try {
        if (geoTouched) await syncGeologyForFossil(id, body);
        if (taxTouched) await syncTaxonomyForFossil(id, body);
      } catch (geoErr) {
        console.error('sync geo/tax update:', geoErr);
        return res.status(400).json({ success: false, error: 'No se pudo actualizar era, periodo o taxonomia.' });
      }
    }

    const full = await getFossilRowFullById(id);
    return res.json({
      success: true,
      message: needsReapproval
        ? 'Fosil actualizado y enviado nuevamente a revisión administrativa.'
        : 'Fosil actualizado',
      data: full || updatedRow,
    });
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
       WHERE id = $2 AND deleted_at IS NULL AND status = 'pending'
       RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (updated.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El fosil no esta en revision, ya fue publicado o rechazado, o no existe.',
      });
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
       WHERE id = $2 AND deleted_at IS NULL AND status = 'pending'
       RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (updated.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El fosil no esta en revision o ya fue procesado.',
      });
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
       WHERE f.deleted_at IS NULL
         AND f.status = 'published'
         AND l.latitude IS NOT NULL
         AND l.longitude IS NOT NULL`,
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
