require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./src/config/database');
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
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARES
// ============================================

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

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
  res.json({
    success: true,
    status: 'OK',
    database: dbConnected ? 'Connected' : 'Disconnected',
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
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ========================================');
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log('🚀 ========================================');
      console.log(`📝 Entorno: ${process.env.NODE_ENV}`);
      console.log(`💾 Base de datos: ${process.env.DB_NAME}`);
      console.log('🚀 ========================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();