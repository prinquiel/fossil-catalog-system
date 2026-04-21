-- ============================================
-- 013: Vaciar catálogo geológico y taxonómico
-- ============================================
-- Elimina eras, períodos y todo el árbol taxonómico, más las
-- clasificaciones vinculadas a fósiles. No borra usuarios, fósiles base,
-- media ni estudios.
--
-- Tras aplicar, ejecutar (una vez) el script de semilla:
--   database/scripts/seed-geology-taxonomy-demo.sql

BEGIN;

TRUNCATE TABLE
  fossil_taxonomic_classification,
  fossil_geological_classification,
  taxonomic_species,
  taxonomic_genera,
  taxonomic_families,
  taxonomic_orders,
  taxonomic_classes,
  taxonomic_phylums,
  taxonomic_kingdoms,
  geological_periods,
  geological_eras
RESTART IDENTITY CASCADE;

COMMIT;
