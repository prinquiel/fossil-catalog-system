-- ============================================
-- Reinicio de datos (sin semillas insertadas)
-- ============================================
-- No inserta ningún registro: deja tablas operativas vacías.
-- Geología, taxonomía y usuarios deben cargarse con datos reales (UI/API o SQL propio).

TRUNCATE TABLE contact_messages CASCADE;
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE scientific_studies CASCADE;
TRUNCATE TABLE media CASCADE;
TRUNCATE TABLE fossil_taxonomic_classification CASCADE;
TRUNCATE TABLE fossil_geological_classification CASCADE;
TRUNCATE TABLE locations CASCADE;
TRUNCATE TABLE fossils CASCADE;
TRUNCATE TABLE taxonomic_species CASCADE;
TRUNCATE TABLE taxonomic_genera CASCADE;
TRUNCATE TABLE taxonomic_families CASCADE;
TRUNCATE TABLE taxonomic_orders CASCADE;
TRUNCATE TABLE taxonomic_classes CASCADE;
TRUNCATE TABLE taxonomic_phylums CASCADE;
TRUNCATE TABLE taxonomic_kingdoms CASCADE;
TRUNCATE TABLE geological_periods CASCADE;
TRUNCATE TABLE geological_eras CASCADE;
TRUNCATE TABLE users CASCADE;

ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE fossils_id_seq RESTART WITH 1;
ALTER SEQUENCE geological_eras_id_seq RESTART WITH 1;
ALTER SEQUENCE geological_periods_id_seq RESTART WITH 1;
ALTER SEQUENCE taxonomic_kingdoms_id_seq RESTART WITH 1;

SELECT 'Tablas vaciadas; ningún dato tipo seed insertado' AS mensaje;
