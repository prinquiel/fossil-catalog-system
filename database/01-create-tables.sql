-- ============================================
-- SISTEMA DE CATALOGACIÓN DE FÓSILES
-- Script de Creación de Tablas
-- Autor: [Tu nombre]
-- Fecha: [Fecha actual]
-- ============================================

-- Eliminar tablas si existen (para desarrollo)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS scientific_studies CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS fossil_taxonomic_classification CASCADE;
DROP TABLE IF EXISTS taxonomic_species CASCADE;
DROP TABLE IF EXISTS taxonomic_genera CASCADE;
DROP TABLE IF EXISTS taxonomic_families CASCADE;
DROP TABLE IF EXISTS taxonomic_orders CASCADE;
DROP TABLE IF EXISTS taxonomic_classes CASCADE;
DROP TABLE IF EXISTS taxonomic_phylums CASCADE;
DROP TABLE IF EXISTS taxonomic_kingdoms CASCADE;
DROP TABLE IF EXISTS fossil_geological_classification CASCADE;
DROP TABLE IF EXISTS geological_periods CASCADE;
DROP TABLE IF EXISTS geological_eras CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS fossils CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TABLA: users
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    registration_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected')),
    approved_at TIMESTAMP NULL,
    approved_by INTEGER REFERENCES users(id),
    rejection_reason TEXT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    country VARCHAR(100),
    profession VARCHAR(100),
    phone VARCHAR(20),
    workplace VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

COMMENT ON TABLE users IS 'Usuarios del sistema; roles en tabla user_roles (varios por usuario)';
COMMENT ON COLUMN users.registration_status IS 'pending=hasta aprobación admin; approved=puede iniciar sesión; rejected=registro denegado';

-- ============================================
-- TABLA: user_roles (varios roles por usuario)
-- ============================================
CREATE TABLE user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('explorer', 'researcher', 'admin')),
    PRIMARY KEY (user_id, role)
);

CREATE INDEX idx_user_roles_role ON user_roles(role);

COMMENT ON TABLE user_roles IS 'Asignación de uno o más roles por usuario';

-- ============================================
-- TABLA: fossils
-- ============================================
CREATE TABLE fossils (
    id SERIAL PRIMARY KEY,
    unique_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('FOS', 'MIN', 'ROC', 'PAL')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
    discoverer_name VARCHAR(200),
    discovery_date DATE,
    original_state_description TEXT,
    geological_context TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

COMMENT ON TABLE fossils IS 'Catálogo principal de fósiles';
COMMENT ON COLUMN fossils.unique_code IS 'Formato: CRI-ALA-SRM-FOS-00001';
COMMENT ON COLUMN fossils.category IS 'FOS=Fósil general, MIN=Mineral, ROC=Roca, PAL=Paleontológico';
COMMENT ON COLUMN fossils.status IS 'pending=En revisión, published=Visible al público, rejected=Rechazado';

-- ============================================
-- TABLA: locations
-- ============================================
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    fossil_id INTEGER UNIQUE NOT NULL REFERENCES fossils(id) ON DELETE CASCADE,
    country_code VARCHAR(3) DEFAULT 'CRI',
    province_code VARCHAR(5) NOT NULL,
    canton_code VARCHAR(5) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE locations IS 'Ubicación geográfica de cada fósil';
COMMENT ON COLUMN locations.province_code IS 'SJO, ALA, GUA, CAR, HER, PUN, LIM';

-- ============================================
-- TABLAS: Clasificación Geológica
-- ============================================
CREATE TABLE geological_eras (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    start_millions_years DECIMAL(10,2),
    end_millions_years DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE geological_periods (
    id SERIAL PRIMARY KEY,
    era_id INTEGER NOT NULL REFERENCES geological_eras(id),
    name VARCHAR(100) UNIQUE NOT NULL,
    start_millions_years DECIMAL(10,2),
    end_millions_years DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fossil_geological_classification (
    fossil_id INTEGER PRIMARY KEY REFERENCES fossils(id) ON DELETE CASCADE,
    era_id INTEGER REFERENCES geological_eras(id),
    period_id INTEGER REFERENCES geological_periods(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLAS: Clasificación Taxonómica (7 niveles)
-- ============================================
CREATE TABLE taxonomic_kingdoms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE taxonomic_phylums (
    id SERIAL PRIMARY KEY,
    kingdom_id INTEGER NOT NULL REFERENCES taxonomic_kingdoms(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    UNIQUE(kingdom_id, name)
);

CREATE TABLE taxonomic_classes (
    id SERIAL PRIMARY KEY,
    phylum_id INTEGER NOT NULL REFERENCES taxonomic_phylums(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    UNIQUE(phylum_id, name)
);

CREATE TABLE taxonomic_orders (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES taxonomic_classes(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    UNIQUE(class_id, name)
);

CREATE TABLE taxonomic_families (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES taxonomic_orders(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    UNIQUE(order_id, name)
);

CREATE TABLE taxonomic_genera (
    id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES taxonomic_families(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    UNIQUE(family_id, name)
);

CREATE TABLE taxonomic_species (
    id SERIAL PRIMARY KEY,
    genus_id INTEGER NOT NULL REFERENCES taxonomic_genera(id),
    name VARCHAR(100) NOT NULL,
    common_name VARCHAR(200),
    description TEXT,
    UNIQUE(genus_id, name)
);

CREATE TABLE fossil_taxonomic_classification (
    fossil_id INTEGER PRIMARY KEY REFERENCES fossils(id) ON DELETE CASCADE,
    kingdom_id INTEGER REFERENCES taxonomic_kingdoms(id),
    phylum_id INTEGER REFERENCES taxonomic_phylums(id),
    class_id INTEGER REFERENCES taxonomic_classes(id),
    order_id INTEGER REFERENCES taxonomic_orders(id),
    family_id INTEGER REFERENCES taxonomic_families(id),
    genus_id INTEGER REFERENCES taxonomic_genera(id),
    species_id INTEGER REFERENCES taxonomic_species(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: media
-- ============================================
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    fossil_id INTEGER NOT NULL REFERENCES fossils(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('image', 'video')),
    media_category VARCHAR(50) CHECK (media_category IN ('before', 'after', 'analysis', 'general', 'detail')),
    angle VARCHAR(50) CHECK (angle IN ('front', 'side', 'top', 'bottom', 'detail', 'other')),
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN media.media_category IS 'before=Antes extracción, after=Después limpieza, analysis=Análisis científico';

-- ============================================
-- TABLA: scientific_studies
-- ============================================
CREATE TABLE scientific_studies (
    id SERIAL PRIMARY KEY,
    fossil_id INTEGER NOT NULL REFERENCES fossils(id) ON DELETE CASCADE,
    researcher_id INTEGER REFERENCES users(id),
    title VARCHAR(300),
    introduction TEXT,
    analysis_type VARCHAR(200),
    results TEXT,
    composition TEXT,
    conditions TEXT,
    references_text TEXT,
    study_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: audit_logs
-- ============================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_logs IS 'Registro de auditoría de todas las acciones importantes';

-- ============================================
-- TABLA: contact_messages
-- ============================================
CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices en fossils
CREATE INDEX idx_fossils_status ON fossils(status);
CREATE INDEX idx_fossils_category ON fossils(category);
CREATE INDEX idx_fossils_unique_code ON fossils(unique_code);
CREATE INDEX idx_fossils_created_by ON fossils(created_by);
CREATE INDEX idx_fossils_name ON fossils(name);
CREATE INDEX idx_fossils_deleted_at ON fossils(deleted_at) WHERE deleted_at IS NULL;

-- Índices en locations (compatibles sin PostGIS)
CREATE INDEX idx_locations_fossil_id ON locations(fossil_id);
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_locations_province ON locations(province_code);
CREATE INDEX idx_locations_canton ON locations(canton_code);

-- Índices en media
CREATE INDEX idx_media_fossil_id ON media(fossil_id);
CREATE INDEX idx_media_type ON media(file_type);
CREATE INDEX idx_media_category ON media(media_category);

-- Índices en users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_registration_status ON users(registration_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Índices en audit_logs
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Índices en taxonomía (para búsquedas)
CREATE INDEX idx_tax_phylums_kingdom ON taxonomic_phylums(kingdom_id);
CREATE INDEX idx_tax_classes_phylum ON taxonomic_classes(phylum_id);
CREATE INDEX idx_tax_orders_class ON taxonomic_orders(class_id);
CREATE INDEX idx_tax_families_order ON taxonomic_families(order_id);
CREATE INDEX idx_tax_genera_family ON taxonomic_genera(family_id);
CREATE INDEX idx_tax_species_genus ON taxonomic_species(genus_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para fossils
CREATE TRIGGER update_fossils_updated_at 
    BEFORE UPDATE ON fossils
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para scientific_studies
CREATE TRIGGER update_scientific_studies_updated_at 
    BEFORE UPDATE ON scientific_studies
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Mostrar todas las tablas creadas
\dt

-- Contar tablas
SELECT COUNT(*) as total_tablas 
FROM information_schema.tables 
WHERE table_schema = 'public';