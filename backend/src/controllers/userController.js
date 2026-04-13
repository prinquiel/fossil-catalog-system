const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, username, email, role, first_name, last_name, 
             country, profession, workplace, created_at, deleted_at,
             COUNT(*) OVER() as total_count
      FROM users
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (role) {
      query += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (search) {
      query += ` AND (username ILIKE $${paramCount} OR email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: result.rows.map(row => {
        const { total_count, password_hash, ...user } = row;
        return user;
      }),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
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
      `SELECT id, username, email, role, first_name, last_name, 
              country, profession, phone, workplace, created_at, updated_at, deleted_at
       FROM users 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({ success: false, error: 'Error al obtener usuario' });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      username, email, password, role, first_name, last_name,
      country, profession, phone, workplace
    } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: username, email, password, role'
      });
    }

    const validRoles = ['explorer', 'researcher', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rol inválido. Debe ser: explorer, researcher o admin'
      });
    }

    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'El email o username ya está registrado'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, first_name, last_name, country, profession, phone, workplace)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, username, email, role, first_name, last_name, created_at`,
      [username, email, password_hash, role, first_name, last_name, country, profession, phone, workplace]
    );

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error en createUser:', error);
    res.status(500).json({ success: false, error: 'Error al crear usuario' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username, email, first_name, last_name,
      country, profession, phone, workplace
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
          error: 'El email o username ya está en uso'
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
       RETURNING id, username, email, role, first_name, last_name, country, profession, phone, workplace`,
      [username, email, first_name, last_name, country, profession, phone, workplace, id]
    );

    res.json({
      success: true,
      message: 'Usuario actualizado',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar usuario' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes eliminar tu propio usuario'
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
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar usuario' });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['explorer', 'researcher', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rol inválido. Debe ser: explorer, researcher o admin'
      });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes cambiar tu propio rol'
      });
    }

    const result = await pool.query(
      `UPDATE users 
       SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING id, username, email, role`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Rol actualizado',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error en changeUserRole:', error);
    res.status(500).json({ success: false, error: 'Error al cambiar rol' });
  }
};

const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE users 
       SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, username, email, role`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Usuario activado',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error en activateUser:', error);
    res.status(500).json({ success: false, error: 'Error al activar usuario' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes desactivar tu propio usuario'
      });
    }

    const result = await pool.query(
      `UPDATE users 
       SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, username, email, role`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado o ya desactivado' });
    }

    res.json({
      success: true,
      message: 'Usuario desactivado',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error en deactivateUser:', error);
    res.status(500).json({ success: false, error: 'Error al desactivar usuario' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_active,
        COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as total_inactive,
        COUNT(*) FILTER (WHERE role = 'explorer' AND deleted_at IS NULL) as explorers,
        COUNT(*) FILTER (WHERE role = 'researcher' AND deleted_at IS NULL) as researchers,
        COUNT(*) FILTER (WHERE role = 'admin' AND deleted_at IS NULL) as admins
      FROM users
    `);

    res.json({
      success: true,
      data: result.rows[0]
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
  activateUser,
  deactivateUser,
  getUserStats,
};
