const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { sendRegistrationApprovedEmail } = require('../services/emailService');
const {
  getRolesForUser,
  replaceUserRoles,
  replaceUserRolesForUser,
  parseRolesFromBody,
  mapUserWithRoles,
  primaryRole,
} = require('../utils/roles');

const userListSelect = `
  u.id, u.username, u.email, u.first_name, u.last_name,
  u.country, u.profession, u.phone, u.workplace, u.created_at, u.deleted_at,
  u.registration_status, u.approved_at, u.approved_by, u.rejection_reason,
  COALESCE(
    (SELECT ARRAY_AGG(ur.role ORDER BY ur.role) FROM user_roles ur WHERE ur.user_id = u.id),
    ARRAY[]::varchar[]
  ) AS roles
`;

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, registration_status } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT ${userListSelect},
             COUNT(*) OVER() as total_count
      FROM users u
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (role) {
      sql += ` AND EXISTS (SELECT 1 FROM user_roles urf WHERE urf.user_id = u.id AND urf.role = $${paramCount})`;
      params.push(role);
      paramCount++;
    }

    if (search) {
      sql += ` AND (u.username ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (registration_status) {
      sql += ` AND u.registration_status = $${paramCount}`;
      params.push(registration_status);
      paramCount++;
    }

    sql += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(sql, params);
    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: result.rows.map((row) => {
        const { total_count, ...rest } = row;
        const roles = rest.roles || [];
        return { ...rest, roles, role: primaryRole(roles) };
      }),
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages,
        totalItems: totalCount,
        itemsPerPage: parseInt(limit, 10),
      },
    });
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    res.status(500).json({ success: false, error: 'Error al obtener usuarios' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT ${userListSelect.replace(/\n/g, ' ')}
       FROM users u
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const row = result.rows[0];
    const roles = row.roles || [];
    res.json({ success: true, data: { ...row, roles, role: primaryRole(roles) } });
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({ success: false, error: 'Error al obtener usuario' });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      username, email, password, first_name, last_name,
      country, profession, phone, workplace,
    } = req.body;

    let roleList;
    try {
      roleList = parseRolesFromBody(req.body);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: role (string) o roles (array). Valores: explorer, researcher, admin',
      });
    }

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: username, email, password',
      });
    }

    const userExists = await pool.query(
      'SELECT id FROM users WHERE deleted_at IS NULL AND (email = $1 OR username = $2)',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'El email o username ya está registrado',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const nullIfEmpty = (v) => (v === undefined || v === null || v === '' ? null : v);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, country, profession, phone, workplace, registration_status, approved_at, approved_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'approved', CURRENT_TIMESTAMP, $10)
         RETURNING id, username, email, first_name, last_name, created_at, registration_status, approved_at, approved_by`,
        [
          username,
          email,
          password_hash,
          nullIfEmpty(first_name),
          nullIfEmpty(last_name),
          nullIfEmpty(country),
          nullIfEmpty(profession),
          nullIfEmpty(phone),
          nullIfEmpty(workplace),
          req.user.id,
        ]
      );

      const userRow = result.rows[0];
      await replaceUserRoles(client, userRow.id, roleList);
      await client.query('COMMIT');

      const roles = await getRolesForUser(userRow.id);
      return res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: mapUserWithRoles(userRow, roles),
      });
    } catch (inner) {
      await client.query('ROLLBACK').catch(() => {});
      throw inner;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error en createUser:', error);
    const detail =
      process.env.NODE_ENV !== 'production' && error.message ? ` (${error.message})` : '';
    res.status(500).json({ success: false, error: `Error al crear usuario${detail}` });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username, email, first_name, last_name,
      country, profession, phone, workplace,
    } = req.body;

    const checkResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    if (email || username) {
      const duplicateCheck = await pool.query(
        'SELECT * FROM users WHERE (email = $1 OR username = $2) AND id != $3',
        [email || '', username || '', id]
      );

      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'El email o username ya está en uso',
        });
      }
    }

    const result = await pool.query(
      `UPDATE users
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           first_name = COALESCE($3, first_name),
           last_name = COALESCE($4, last_name),
           country = COALESCE($5, country),
           profession = COALESCE($6, profession),
           phone = COALESCE($7, phone),
           workplace = COALESCE($8, workplace),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING id, username, email, first_name, last_name, country, profession, phone, workplace`,
      [username, email, first_name, last_name, country, profession, phone, workplace, id]
    );

    const roles = await getRolesForUser(id);
    res.json({
      success: true,
      message: 'Usuario actualizado',
      data: mapUserWithRoles(result.rows[0], roles),
    });
  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar usuario' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes eliminar tu propio usuario',
      });
    }

    const result = await pool.query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar usuario' });
  }
};

/** Sustituye todos los roles por uno solo (compatibilidad) */
const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['explorer', 'researcher', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rol inválido. Debe ser: explorer, researcher o admin',
      });
    }

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes cambiar tu propio rol',
      });
    }

    const exists = await pool.query('SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    await replaceUserRolesForUser(parseInt(id, 10), [role]);

    const userRow = await pool.query(
      'SELECT id, username, email, first_name, last_name FROM users WHERE id = $1',
      [id]
    );
    const roles = await getRolesForUser(id);
    res.json({
      success: true,
      message: 'Rol actualizado',
      data: mapUserWithRoles(userRow.rows[0], roles),
    });
  } catch (error) {
    console.error('Error en changeUserRole:', error);
    res.status(500).json({ success: false, error: 'Error al cambiar rol' });
  }
};

/** Sustituye el conjunto de roles: body `{ roles: ['explorer','researcher'] }` */
const updateUserRoles = async (req, res) => {
  try {
    const { id } = req.params;
    let roleList;
    try {
      roleList = parseRolesFromBody(req.body);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Envía roles (array) o role (string). Valores: explorer, researcher, admin',
      });
    }

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes cambiar tus propios roles',
      });
    }

    const exists = await pool.query('SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    await replaceUserRolesForUser(parseInt(id, 10), roleList);

    const userRow = await pool.query(
      'SELECT id, username, email, first_name, last_name FROM users WHERE id = $1',
      [id]
    );
    const roles = await getRolesForUser(id);
    res.json({
      success: true,
      message: 'Roles actualizados',
      data: mapUserWithRoles(userRow.rows[0], roles),
    });
  } catch (error) {
    console.error('Error en updateUserRoles:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar roles' });
  }
};

const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE users
       SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, username, email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const roles = await getRolesForUser(id);
    res.json({
      success: true,
      message: 'Usuario activado',
      data: mapUserWithRoles(result.rows[0], roles),
    });
  } catch (error) {
    console.error('Error en activateUser:', error);
    res.status(500).json({ success: false, error: 'Error al activar usuario' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes desactivar tu propio usuario',
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, username, email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado o ya desactivado' });
    }

    const roles = await getRolesForUser(id);
    res.json({
      success: true,
      message: 'Usuario desactivado',
      data: mapUserWithRoles(result.rows[0], roles),
    });
  } catch (error) {
    console.error('Error en deactivateUser:', error);
    res.status(500).json({ success: false, error: 'Error al desactivar usuario' });
  }
};

const pendingWhere = `
  u.registration_status = 'pending' AND u.deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role IN ('explorer', 'researcher')
  )
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role = 'admin'
  )
`;

const getPendingRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const list = await pool.query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name,
              u.country, u.profession, u.phone, u.workplace, u.registration_status, u.created_at, u.updated_at,
              COALESCE(
                (SELECT ARRAY_AGG(ur.role ORDER BY ur.role) FROM user_roles ur WHERE ur.user_id = u.id),
                ARRAY[]::varchar[]
              ) AS roles
       FROM users u
       WHERE ${pendingWhere}
       ORDER BY u.created_at ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS c FROM users u WHERE ${pendingWhere}`
    );
    const totalItems = countResult.rows[0].c;
    const totalPages = Math.ceil(totalItems / limit) || 1;

    res.json({
      success: true,
      data: list.rows.map((row) => {
        const roles = row.roles || [];
        return { ...row, roles, role: primaryRole(roles) };
      }),
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit, 10),
      },
    });
  } catch (error) {
    console.error('Error en getPendingRegistrations:', error);
    res.status(500).json({ success: false, error: 'Error al obtener solicitudes pendientes' });
  }
};

const approveRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, error: 'No puedes aprobar tu propia cuenta' });
    }

    const existing = await pool.query(
      `SELECT u.id, u.email, u.registration_status, u.first_name, u.deleted_at
       FROM users u WHERE u.id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const u = existing.rows[0];
    if (u.deleted_at) {
      return res.status(400).json({ success: false, error: 'El usuario esta desactivado' });
    }

    if (u.registration_status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden aprobar cuentas en estado pendiente',
        code: 'NOT_PENDING',
      });
    }

    const result = await pool.query(
      `UPDATE users SET
         registration_status = 'approved',
         approved_at = CURRENT_TIMESTAMP,
         approved_by = $1,
         rejection_reason = NULL,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND registration_status = 'pending'
       RETURNING id, username, email, first_name, last_name, registration_status, approved_at, approved_by`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'No se pudo aprobar el registro' });
    }

    const approved = result.rows[0];
    const roles = await getRolesForUser(approved.id);
    const emailResult = await sendRegistrationApprovedEmail({
      to: approved.email,
      firstName: approved.first_name,
      roles,
    });

    res.json({
      success: true,
      message: 'Registro aprobado',
      data: mapUserWithRoles(approved, roles),
      email: emailResult,
    });
  } catch (error) {
    console.error('Error en approveRegistration:', error);
    res.status(500).json({ success: false, error: 'Error al aprobar el registro' });
  }
};

const rejectRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = (req.body && req.body.reason) || null;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, error: 'No puedes rechazar tu propia cuenta' });
    }

    const existing = await pool.query(
      `SELECT id, registration_status, deleted_at FROM users WHERE id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const u = existing.rows[0];
    if (u.deleted_at) {
      return res.status(400).json({ success: false, error: 'El usuario esta desactivado' });
    }

    if (u.registration_status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden rechazar cuentas en estado pendiente',
        code: 'NOT_PENDING',
      });
    }

    const result = await pool.query(
      `UPDATE users SET
         registration_status = 'rejected',
         rejection_reason = $1,
         approved_at = NULL,
         approved_by = NULL,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND registration_status = 'pending'
       RETURNING id, username, email, registration_status, rejection_reason`,
      [reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'No se pudo rechazar el registro' });
    }

    const row = result.rows[0];
    const roles = await getRolesForUser(id);
    res.json({
      success: true,
      message: 'Registro rechazado',
      data: mapUserWithRoles(row, roles),
    });
  } catch (error) {
    console.error('Error en rejectRegistration:', error);
    res.status(500).json({ success: false, error: 'Error al rechazar el registro' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_active,
        COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as total_inactive,
        (SELECT COUNT(DISTINCT ur.user_id) FROM user_roles ur
         JOIN users u ON u.id = ur.user_id WHERE ur.role = 'explorer' AND u.deleted_at IS NULL) as explorers,
        (SELECT COUNT(DISTINCT ur.user_id) FROM user_roles ur
         JOIN users u ON u.id = ur.user_id WHERE ur.role = 'researcher' AND u.deleted_at IS NULL) as researchers,
        (SELECT COUNT(DISTINCT ur.user_id) FROM user_roles ur
         JOIN users u ON u.id = ur.user_id WHERE ur.role = 'admin' AND u.deleted_at IS NULL) as admins,
        (SELECT COUNT(*) FROM users u WHERE ${pendingWhere.replace(/\n/g, ' ')}) as pending_registrations
      FROM users
    `);

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error en getUserStats:', error);
    res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  updateUserRoles,
  activateUser,
  deactivateUser,
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
  getUserStats,
};
