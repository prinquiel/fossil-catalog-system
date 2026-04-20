-- Campos adicionales para estudios científicos (contexto, enlaces, imagen de composición, etc.)

ALTER TABLE scientific_studies ADD COLUMN IF NOT EXISTS context_objectives TEXT;
ALTER TABLE scientific_studies ADD COLUMN IF NOT EXISTS references_links TEXT;
ALTER TABLE scientific_studies ADD COLUMN IF NOT EXISTS institution_contact TEXT;
ALTER TABLE scientific_studies ADD COLUMN IF NOT EXISTS study_site_notes TEXT;
ALTER TABLE scientific_studies ADD COLUMN IF NOT EXISTS visual_evidence_notes TEXT;
ALTER TABLE scientific_studies ADD COLUMN IF NOT EXISTS composition_image_path VARCHAR(500);

COMMENT ON COLUMN scientific_studies.context_objectives IS 'Contexto y objetivo del estudio';
COMMENT ON COLUMN scientific_studies.references_links IS 'URLs o referencias por línea';
COMMENT ON COLUMN scientific_studies.institution_contact IS 'Documentación y contacto institucional';
COMMENT ON COLUMN scientific_studies.study_site_notes IS 'Notas de ubicación geográfica del estudio / hallazgo';
COMMENT ON COLUMN scientific_studies.visual_evidence_notes IS 'Evidencia visual: antes, después, análisis (notas)';
COMMENT ON COLUMN scientific_studies.composition_image_path IS 'Ruta relativa bajo uploads/ de imagen de composición';
