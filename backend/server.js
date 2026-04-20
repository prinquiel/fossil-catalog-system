require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection, pool } = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutesMain');
const fossilRoutes = require('./src/routes/fossilRoutesReal');
const mediaRoutes = require('./src/routes/mediaRoutes');
const taxonomyRoutes = require('./src/routes/taxonomyRoutes');
const geologyRoutes = require('./src/routes/geologyRoutes');
const userRoutes = require('./src/routes/userRoutes');
const studyRoutes = require('./src/routes/studyRoutesMain');
const contactRoutes = require('./src/routes/contactRoutesMain');
const auditRoutes = require('./src/routes/auditRoutesMain');
const searchRoutes = require('./src/routes/searchRoutesMain');
const statsRoutes = require('./src/routes/statsRoutesMain');

const app = express();
const PORT = process.env.PORT || 5001;

// ============================================
// MIDDLEWARES
// ============================================

// Seguridad
app.use(helmet());

// CORS: Vite (:5173+), CRA (:3000); CLIENT_URL puede listar varios orígenes separados por coma
const corsDefaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];
const corsFromEnv = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const corsAllowedOrigins = [...new Set([...corsDefaultOrigins, ...corsFromEnv])];

const isLocalhostOrigin = (origin) => {
  try {
    const u = new URL(origin);
    const okHost = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
    const okProto = u.protocol === 'http:' || u.protocol === 'https:';
    return okHost && okProto;
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (corsAllowedOrigins.includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== 'production' && isLocalhostOrigin(origin)) {
        return callback(null, true);
      }
      console.warn(`CORS denegado para origen: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Sistema de Catalogación de Fósiles',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      fossils: '/api/fossils/*',
    },
  });
});

app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  let schema = null;
  if (dbConnected) {
    try {
      const r = await pool.query(`
        SELECT
          current_database() AS connected_database,
          current_user AS connected_user,
          EXISTS (
            SELECT 1
            FROM pg_catalog.pg_class c
            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
              AND c.relname = 'user_roles'
              AND c.relkind IN ('r', 'p')
          ) AS has_user_roles,
          (
            SELECT string_agg(n.nspname, ', ' ORDER BY n.nspname)
            FROM pg_catalog.pg_class c
            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = 'user_roles'
              AND c.relkind IN ('r', 'p')
          ) AS user_roles_schemas,
          EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
          ) AS has_users_role_column,
          EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'registration_status'
          ) AS has_registration_status
      `);
      schema = r.rows[0];
      schema.register_ready =
        schema.has_user_roles &&
        !schema.has_users_role_column &&
        schema.has_registration_status;
      if (!schema.register_ready) {
        if (!schema.has_user_roles && schema.user_roles_schemas) {
          schema.hint =
            `La tabla user_roles existe en el esquema: ${schema.user_roles_schemas}. El backend usa public.user_roles. Mueve la tabla al esquema public o recreala con la migracion 004 en public.`;
        } else if (!schema.has_user_roles) {
          schema.hint =
            'Falta la tabla public.user_roles. En PostgreSQL ejecuta: database/migrations/004_user_roles.sql';
        } else if (schema.has_users_role_column) {
          schema.hint =
            'Queda la columna antigua users.role. Ejecuta database/migrations/004_user_roles.sql hasta el final.';
        } else if (!schema.has_registration_status) {
          schema.hint = 'Ejecuta database/migrations/003_user_registration_approval.sql';
        }
      }
    } catch (e) {
      schema = { error: e.message };
    }
  }
  res.json({
    success: true,
    status: 'OK',
    database: dbConnected ? 'Connected' : 'Disconnected',
    schema,
    timestamp: new Date().toISOString(),
  });
});

// Integracion de rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/fossils', fossilRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/taxonomy', taxonomyRoutes);
app.use('/api/geology', geologyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/studies', studyRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stats', statsRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor',
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async () => {
  try {
    // Verificar conexión a BD
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('========================================');
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log('========================================');
      console.log(`Entorno: ${process.env.NODE_ENV}`);
      console.log(`Base de datos: ${process.env.DB_NAME}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();