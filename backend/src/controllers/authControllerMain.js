const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const safeUserFields = `
  id, username, email, role, first_name, last_name, country, profession, phone, workplace, created_at, updated_at
`;

const register = async (req, res) => {
  try {
    const { username, email, password, role, first_name, last_name, country, profession, phone, workplace } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'username, email y password son requeridos' });
    }

    const validRoles = ['explorer', 'researcher', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: 'Rol invalido. Debe ser: explorer, researcher o admin' });
    }

    const exists = await query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'El email o username ya esta registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await query(
      `INSERT INTO users (username, email, password_hash, role, first_name, last_name, country, profession, phone, workplace)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING ${safeUserFields}`,
      [username, email, passwordHash, role || 'explorer', first_name, last_name, country, profession, phone, workplace]
    );

    const user = created.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    return res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', data: { user, token } });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ success: false, error: 'Error al registrar usuario' });
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

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      country: user.country,
      profession: user.profession,
      phone: user.phone,
      workplace: user.workplace,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return res.json({ success: true, message: 'Login exitoso', data: { user: safeUser, token } });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ success: false, error: 'Error al iniciar sesion' });
  }
};

const getMe = async (req, res) => {
  try {
    const me = await query(`SELECT ${safeUserFields} FROM users WHERE id = $1 AND deleted_at IS NULL`, [req.user.id]);
    if (me.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    return res.json({ success: true, data: me.rows[0] });
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
