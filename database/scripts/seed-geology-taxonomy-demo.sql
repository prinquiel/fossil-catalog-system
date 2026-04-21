-- ============================================
-- Semilla demo: geología + taxonomía (jerarquía correcta)
-- ============================================
-- Prerrequisito: haber ejecutado la migración
--   database/migrations/013_clear_geology_taxonomy_catalog.sql
-- (o tablas vacías de catálogo sin datos previos).
--
-- Ejecutar desde terminal:
--   psql -h HOST -p PORT -U USUARIO -d NOMBRE_BD -f database/scripts/seed-geology-taxonomy-demo.sql
--
-- Contenido:
--   - 4 eras + 10 períodos (diversidad moderada)
--   - Taxonomía con grupos amplios para fósiles/paleontológico
--   - "Especie" usa etiquetas abiertas (sp., indet.) para abarcar grupos grandes
--   - Recomendación de captura:
--       * FOS / PAL -> usar taxonomía biológica
--       * ROC / MIN -> dejar taxonomía vacía (no aplica)

BEGIN;

-- ---------------------------------------------------------------------------
-- Tiempo geológico
-- ---------------------------------------------------------------------------
INSERT INTO geological_eras (name, start_millions_years, end_millions_years, description) VALUES
  ('Precámbrico', 4600, 541, 'Intervalo temprano de la Tierra; microfósiles y estromatolitos'),
  ('Paleozoico', 541, 252, 'Diversificación marina e inicios de vertebrados terrestres'),
  ('Mesozoico', 252, 66, 'Radiación de reptiles y dinosaurios; floración de gimnospermas'),
  ('Cenozoico', 66, 0, 'Radiación de mamíferos y plantas modernas');

INSERT INTO geological_periods (era_id, name, start_millions_years, end_millions_years, description) VALUES
  (1, 'Ediacárico', 635, 541, 'Biota ediacárica de cuerpo blando'),
  (2, 'Cámbrico', 541, 485, 'Explosión cámbrica'),
  (2, 'Ordovícico', 485, 444, 'Diversificación de invertebrados marinos'),
  (2, 'Devónico', 419, 359, 'Peces y primeras plantas vasculares terrestres'),
  (2, 'Pérmico', 299, 252, 'Sinápsidos y extinción masiva del final del Paleozoico'),
  (3, 'Triásico', 252, 201, 'Recuperación post-extinción y primeros dinosaurios'),
  (3, 'Jurásico', 201, 145, 'Grandes saurópodos y reptiles marinos'),
  (3, 'Cretácico', 145, 66, 'Angiospermas tempranas y fin de dinosaurios no avianos'),
  (4, 'Paleógeno', 66, 23, 'Radiación de mamíferos y aves modernas'),
  (4, 'Neógeno', 23, 2.6, 'Pastizales extensos y mamíferos grandes');

-- ---------------------------------------------------------------------------
-- Taxonomía orientada a fósiles extintos (grupos amplios)
-- ---------------------------------------------------------------------------
INSERT INTO taxonomic_kingdoms (name, description) VALUES
  ('Animalia', 'Animales multicelulares'),
  ('Plantae', 'Plantas y algas verdes'),
  ('Protista', 'Agrupación práctica para microfósiles');

INSERT INTO taxonomic_phylums (kingdom_id, name, description) VALUES
  (1, 'Chordata', 'Cordados: vertebrados fósiles'),
  (1, 'Mollusca', 'Moluscos fósiles, incluidos amonoideos'),
  (1, 'Arthropoda', 'Artrópodos fósiles'),
  (2, 'Tracheophyta', 'Plantas vasculares fósiles'),
  (3, 'Foraminifera', 'Microfósiles foraminíferos');

INSERT INTO taxonomic_classes (phylum_id, name, description) VALUES
  (1, 'Reptilia', 'Reptiles fósiles terrestres, marinos y voladores'),
  (1, 'Mammalia', 'Mamíferos fósiles'),
  (1, 'Aves', 'Aves fósiles (incluye linajes extintos)'),
  (2, 'Cephalopoda', 'Cefalópodos, útiles para amonites'),
  (2, 'Bivalvia', 'Bivalvos fósiles'),
  (3, 'Trilobita', 'Trilobites extintos'),
  (4, 'Magnoliopsida', 'Macrofósiles vegetales de angiospermas'),
  (5, 'Globothalamea', 'Foraminíferos bentónicos frecuentes');

INSERT INTO taxonomic_orders (class_id, name, description) VALUES
  (1, 'Theropoda', 'Dinosaurios bípedos'),
  (1, 'Sauropoda', 'Dinosaurios cuadrúpedos de cuello largo'),
  (1, 'Ornithischia', 'Dinosaurios herbívoros bípedos/cuadrúpedos'),
  (1, 'Pterosauria', 'Reptiles voladores'),
  (1, 'Ichthyosauria', 'Reptiles marinos con forma hidrodinámica'),
  (1, 'Plesiosauria', 'Reptiles marinos de cuello largo/corto'),
  (2, 'Proboscidea', 'Mamíferos fósiles tipo elefante/mamut'),
  (2, 'Cingulata', 'Mamíferos acorazados (incluye gliptodontes)'),
  (2, 'Carnivora', 'Mamíferos carnívoros (incluye linajes fósiles)'),
  (3, 'Enantiornithes', 'Aves mesozoicas extintas'),
  (4, 'Ammonoidea', 'Amonoideos'),
  (5, 'Pectinida', 'Bivalvos fósiles'),
  (6, 'Redlichiida', 'Trilobites paleozoicos'),
  (7, 'Fagales', 'Macrorestos de hojas/frutos de fagales'),
  (8, 'Rotaliida', 'Foraminíferos bentónicos');

INSERT INTO taxonomic_families (order_id, name, description) VALUES
  (1, 'Tyrannosauridae', 'Terópodos grandes bípedos'),
  (1, 'Dromaeosauridae', 'Terópodos pequeños/medianos bípedos'),
  (2, 'Diplodocidae', 'Saurópodos cuadrúpedos'),
  (2, 'Titanosauridae', 'Saurópodos cuadrúpedos tardíos'),
  (3, 'Hadrosauridae', 'Ornitísquios herbívoros'),
  (4, 'Pteranodontidae', 'Pterosaurios de gran envergadura'),
  (5, 'Ophthalmosauridae', 'Ictiosaurios marinos'),
  (6, 'Elasmosauridae', 'Plesiosaurios de cuello largo'),
  (7, 'Elephantidae', 'Linaje de mamuts y elefantes fósiles'),
  (8, 'Glyptodontidae', 'Gliptodontes extintos'),
  (9, 'Felidae', 'Felinos fósiles y recientes'),
  (10, 'Avisauridae', 'Enantiornitas del Cretácico'),
  (11, 'Desmoceratidae', 'Amonites frecuentes en Cretácico'),
  (12, 'Pectinidae', 'Bivalvos pectínidos'),
  (13, 'Redlichiidae', 'Trilobites redlíquidos'),
  (14, 'Fagaceae', 'Restos vegetales de fagáceas'),
  (15, 'Rotaliidae', 'Foraminíferos rotálidos');

INSERT INTO taxonomic_genera (family_id, name, description) VALUES
  (1, 'Tyrannosaurus', 'Terópodo bípedo'),
  (2, 'Velociraptor', 'Terópodo bípedo'),
  (3, 'Diplodocus', 'Saurópodo cuadrúpedo'),
  (4, 'Saltasaurus', 'Saurópodo cuadrúpedo'),
  (5, 'Edmontosaurus', 'Ornitísquio herbívoro'),
  (6, 'Pteranodon', 'Reptil volador'),
  (7, 'Ophthalmosaurus', 'Reptil marino ictiosaurio'),
  (8, 'Elasmosaurus', 'Reptil marino plesiosaurio'),
  (9, 'Mammuthus', 'Mamut'),
  (10, 'Glyptodon', 'Mamífero acorazado fósil'),
  (11, 'Smilodon', 'Felino dientes de sable'),
  (12, 'Avisaurus', 'Ave fósil enantiornita'),
  (13, 'Desmoceras', 'Amonite'),
  (14, 'Pecten', 'Bivalvo'),
  (15, 'Redlichia', 'Trilobite'),
  (16, 'Quercus', 'Robles y encinos'),
  (17, 'Ammonia', 'Foraminífero');

INSERT INTO taxonomic_species (genus_id, name, common_name, description) VALUES
  (1, 'sp.', 'Dinosaurio bípedo terópodo indeterminado', 'Grupo amplio para restos parciales'),
  (2, 'sp.', 'Dinosaurio bípedo dromeosáurido indeterminado', 'Grupo amplio para restos parciales'),
  (3, 'sp.', 'Dinosaurio cuadrúpedo saurópodo indeterminado', 'Grupo amplio para vértebras/huesos largos'),
  (4, 'sp.', 'Dinosaurio cuadrúpedo titanosaurio indeterminado', 'Grupo amplio para restos fragmentarios'),
  (5, 'sp.', 'Dinosaurio herbívoro ornitísquio indeterminado', 'Grupo amplio para restos postcraneales'),
  (6, 'sp.', 'Reptil volador pterosaurio indeterminado', 'Grupo amplio para material fragmentario'),
  (7, 'sp.', 'Reptil marino ictiosaurio indeterminado', 'Grupo amplio para fósiles marinos'),
  (8, 'sp.', 'Reptil marino plesiosaurio indeterminado', 'Grupo amplio para fósiles marinos'),
  (9, 'sp.', 'Mamífero proboscídeo fósil indeterminado', 'Grupo amplio para material cenozoico'),
  (10, 'sp.', 'Mamífero acorazado fósil indeterminado', 'Grupo amplio para placas/osteodermos'),
  (11, 'sp.', 'Mamífero carnívoro fósil indeterminado', 'Grupo amplio para cráneos/dientes'),
  (12, 'sp.', 'Ave fósil mesozoica indeterminada', 'Grupo amplio para aves extintas'),
  (13, 'sp.', 'Amonite indeterminado', 'Grupo amplio para cefalópodos fósiles'),
  (14, 'sp.', 'Bivalvo fósil indeterminado', 'Grupo amplio para moluscos bivalvos'),
  (15, 'sp.', 'Trilobite indeterminado', 'Grupo amplio para artrópodos fósiles'),
  (16, 'sp.', 'Macrofósil vegetal indeterminado', 'Grupo amplio para hojas/frutos fósiles'),
  (17, 'sp.', 'Foraminífero indeterminado', 'Grupo amplio para microfósiles');

COMMIT;

SELECT 'Semilla geología + taxonomía aplicada.' AS mensaje;
