const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, query } = require('../config/database');
const {
  getRolesForUser,
  replaceUserRoles,
  parseRegistrationRoles,
  mapUserWithRoles,
  primaryRole,
  canonicalizeAuthRoles,
} = require('../utils/roles');

const safeUserColumns = `
  id, username, email, first_name, last_name, country, profession, phone, workplace,
  registration_status, approved_at, approved_by, rejection_reason,
  created_at, updated_at
`;

async function buildSafeUser(userRow) {
  const roles = canonicalizeAuthRoles(await getRolesForUser(userRow.id));
  const { password_hash, ...rest } = userRow;
  return mapUserWithRoles(rest, roles);
}

const register = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, country, profession, phone, workplace } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'username, email y password son requeridos' });
    }

    const parsed = parseRegistrationRoles(req.body);
    if (parsed.error) {
      return res.status(400).json({ success: false, error: parsed.error });
    }
    const requestedRoles = parsed.roles;

    const dup = await query(
      `SELECT email, username FROM users
       WHERE deleted_at IS NULL AND (email = $1 OR username = $2)`,
      [email, username]
    );
    if (dup.rows.length > 0) {
      const emailTaken = dup.rows.some((r) => r.email === email);
      const usernameTaken = dup.rows.some((r) => r.username === username);
      if (emailTaken && usernameTaken) {
        return res.status(400).json({
          success: false,
          error: 'Ese correo y ese nombre de usuario ya estan registrados.',
        });
      }
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          error: 'Ese correo ya esta registrado. Inicia sesion o usa otro email.',
        });
      }
      return res.status(400).json({
        success: false,
        error:
          `El nombre de usuario "${username}" ya esta en uso. Elige otro.`,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const v = (x) => (x === undefined || x === '' ? null : x);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const created = await client.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, country, profession, phone, workplace, registration_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending')
         RETURNING ${safeUserColumns}`,
        [username, email, passwordHash, v(first_name), v(last_name), v(country), v(profession), v(phone), v(workplace)]
      );

      const userRow = created.rows[0];
      await replaceUserRoles(client, userRow.id, requestedRoles);
      await client.query('COMMIT');

      const roles = await getRolesForUser(userRow.id);
      const user = mapUserWithRoles(userRow, roles);

      return res.status(201).json({
        success: true,
        message:
          'Registro recibido. Un administrador debe aprobar tu cuenta antes de que puedas iniciar sesión.',
        data: { user },
      });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error en register:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'El email o username ya esta registrado' });
    }
    if (error.code === '42P01') {
      return res.status(500).json({
        success: false,
        error:
          'Falta una tabla en la base de datos (ej. user_roles). Ejecuta las migraciones en database/migrations/.',
      });
    }
    if (error.code === '23502') {
      return res.status(500).json({
        success: false,
        error:
          'Esquema desactualizado: suele indicar que users.role sigue como NOT NULL. Ejecuta database/migrations/004_user_roles.sql.',
      });
    }
    if (error.code === '42501') {
      return res.status(500).json({
        success: false,
        error:
          'Permiso denegado en la base de datos (tabla user_roles). Con usuario postgres ejecuta database/migrations/006_grant_user_roles_permissions.sql (ajusta el nombre del rol si no es fossil_admin).',
        code: 'INSUFFICIENT_PRIVILEGE',
      });
    }
    const showDetails = process.env.NODE_ENV !== 'production';
    return res.status(500).json({
      success: false,
      error: showDetails ? error.message || 'Error al registrar usuario' : 'Error al registrar usuario',
      code: showDetails ? error.code : undefined,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y contrasena son requeridos' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Credenciales invalidas' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Credenciales invalidas' });
    }

    if (user.registration_status === 'pending') {
      return res.status(403).json({
        success: false,
        error: 'Tu cuenta esta pendiente de aprobacion por un administrador.',
        code: 'REGISTRATION_PENDING',
      });
    }

    if (user.registration_status === 'rejected') {
      return res.status(403).json({
        success: false,
        error: 'Tu registro fue rechazado. Contacta al administrador si necesitas ayuda.',
        code: 'REGISTRATION_REJECTED',
        details: user.rejection_reason ? { rejection_reason: user.rejection_reason } : undefined,
      });
    }

    let roles = await getRolesForUser(user.id);
    roles = canonicalizeAuthRoles(roles);
    if (!roles || roles.length === 0) {
      return res.status(403).json({
        success: false,
        error:
          'Tu cuenta no tiene roles asignados. Un administrador debe asignarte al menos un rol en user_roles (o ejecuta las migraciones / seed si acabas de actualizar el esquema).',
        code: 'NO_ROLES',
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, roles, role: primaryRole(roles) },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const safeUser = await buildSafeUser(user);

    return res.json({ success: true, message: 'Login exitoso', data: { user: safeUser, token } });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ success: false, error: 'Error al iniciar sesion' });
  }
};

const getMe = async (req, res) => {
  try {
    const me = await query(`SELECT ${safeUserColumns} FROM users WHERE id = $1 AND deleted_at IS NULL`, [req.user.id]);
    if (me.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    const roles = canonicalizeAuthRoles(await getRolesForUser(req.user.id));
    return res.json({ success: true, data: mapUserWithRoles(me.rows[0], roles) });
  } catch (error) {
    console.error('Error en getMe:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener informacion del usuario' });
  }
};

const logout = async (req, res) => res.json({ success: true, message: 'Logout exitoso' });

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email es requerido' });
    }
    await query('SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
    return res.json({
      success: true,
      message: 'Si el correo existe, se proceso la solicitud de recuperacion',
    });
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    return res.status(500).json({ success: false, error: 'Error al procesar recuperacion de password' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'email y password son requeridos' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const updated = await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 AND deleted_at IS NULL RETURNING id',
      [passwordHash, email]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    return res.json({ success: true, message: 'Password reseteado' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    return res.status(500).json({ success: false, error: 'Error al resetear password' });
  }
};

module.exports = { register, login, getMe, logout, forgotPassword, resetPassword };
