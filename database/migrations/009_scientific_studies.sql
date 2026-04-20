-- Tabla de estudios científicos (si la base se creó sin database/01-create-tables.sql completo)

CREATE TABLE IF NOT EXISTS scientific_studies (
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

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_scientific_studies_updated_at ON scientific_studies;
CREATE TRIGGER update_scientific_studies_updated_at
    BEFORE UPDATE ON scientific_studies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Permisos para el rol de la app (mismo criterio que 006_grant_user_roles_permissions.sql)
GRANT USAGE ON SCHEMA public TO fossil_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.scientific_studies TO fossil_admin;
GRANT USAGE, SELECT ON SEQUENCE public.scientific_studies_id_seq TO fossil_admin;
