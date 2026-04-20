-- Permite guardar ubicación solo con GPS (WGS84) sin códigos de provincia/cantón de Costa Rica.
-- Ejecutar contra la misma base que usa el backend (usuario con permisos DDL).

ALTER TABLE locations ALTER COLUMN province_code DROP NOT NULL;
ALTER TABLE locations ALTER COLUMN canton_code DROP NOT NULL;
ALTER TABLE locations ALTER COLUMN country_code DROP DEFAULT;
ALTER TABLE locations ALTER COLUMN country_code DROP NOT NULL;

COMMENT ON COLUMN locations.province_code IS 'Código subdivisión (ej. Costa Rica) o NULL si solo hay GPS';
COMMENT ON COLUMN locations.canton_code IS 'Código cantón o NULL si solo hay GPS';
COMMENT ON COLUMN locations.country_code IS 'ISO 3166-1 alpha-3 o NULL si no aplica';
