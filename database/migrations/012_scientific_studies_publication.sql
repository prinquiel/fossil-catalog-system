-- Estado editorial de estudios científicos (visibilidad en catálogo público)
ALTER TABLE scientific_studies ADD COLUMN IF NOT EXISTS publication_status VARCHAR(20)
  NOT NULL DEFAULT 'pending' CHECK (publication_status IN ('pending', 'published', 'rejected'));

ALTER TABLE scientific_studies ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL;
ALTER TABLE scientific_studies ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE scientific_studies ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

-- Registros anteriores a esta migración: tratarlos como ya publicados (comportamiento previo)
UPDATE scientific_studies SET publication_status = 'published' WHERE publication_status = 'pending';

COMMENT ON COLUMN scientific_studies.publication_status IS 'pending=en revisión admin; published=visible catálogo público; rejected=devuelto al investigador';
