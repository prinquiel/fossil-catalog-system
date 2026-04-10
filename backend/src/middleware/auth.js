const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado - Token no proporcionado',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    console.error('Error en middleware protect:', error);
    return res.status(401).json({
      success: false,
      error: 'No autorizado - Token inválido',
    });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: `Rol ${req.user.role} no autorizado para esta acción`,
    });
  }
  return next();
};

module.exports = {
  protect,
  authorize,
};
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado - Token no proporcionado',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    console.error('Error en middleware protect:', error);
    return res.status(401).json({
      success: false,
      error: 'No autorizado - Token inválido',
    });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: `Rol ${req.user.role} no autorizado para esta acción`,
    });
  }
  return next();
};

module.exports = {
  protect,
  authorize,
};
const jwt = require('jsonwebtoken');

// ============================================
// VERIFICAR TOKEN JWT
// ============================================
const protect = async (req, res, next) => {
  try {
    let token;

    // Obtener token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verificar que el token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado - Token no proporcionado',
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('Error en middleware protect:', error);
    return res.status(401).json({
      success: false,
      error: 'No autorizado - Token inválido',
    });
  }
};

// ============================================
// VERIFICAR ROLES
// ============================================
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Rol ${req.user.role} no autorizado para esta acción`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};