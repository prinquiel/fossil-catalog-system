const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'No autorizado - Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let roles = decoded.roles;
    if (!Array.isArray(roles) && decoded.role) {
      roles = [decoded.role];
    }
    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(403).json({
        success: false,
        error:
          'El token no incluye roles. Cierra sesion y vuelve a iniciarla; si el problema continua, asigna roles en user_roles para tu usuario.',
        code: 'TOKEN_NO_ROLES',
      });
    }

    req.user = { id: decoded.id, email: decoded.email, roles };
    return next();
  } catch (error) {
    console.error('Error en middleware protect:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'No autorizado - Token expirado', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'No autorizado - Token invalido (firma o formato incorrecto; revisa JWT_SECRET y el header Authorization: Bearer ...)',
        code: 'TOKEN_INVALID',
      });
    }
    return res.status(401).json({ success: false, error: 'No autorizado - Token invalido' });
  }
};

/** El usuario debe tener al menos uno de los roles indicados */
const authorize = (...allowedRoles) => (req, res, next) => {
  const has = allowedRoles.some((r) => req.user.roles.includes(r));
  if (!has) {
    return res.status(403).json({ success: false, error: 'Rol no autorizado para esta accion' });
  }
  return next();
};

module.exports = { protect, authorize };
