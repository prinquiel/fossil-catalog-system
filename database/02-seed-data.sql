-- ============================================
-- DATOS INICIALES (SEED DATA)
-- ============================================

-- Limpiar datos existentes (solo para desarrollo)
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

-- Reiniciar secuencias
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE fossils_id_seq RESTART WITH 1;
ALTER SEQUENCE geological_eras_id_seq RESTART WITH 1;
ALTER SEQUENCE geological_periods_id_seq RESTART WITH 1;
ALTER SEQUENCE taxonomic_kingdoms_id_seq RESTART WITH 1;

-- ============================================
-- USUARIOS
-- ============================================
-- Password para todos: Admin123! (hash con bcrypt)
INSERT INTO users (username, email, password_hash, registration_status, first_name, last_name, country, profession, workplace) VALUES
('admin', 'admin@unadeca.net', '$2a$10$rQ8KvVPzJ.KqVx6kH9vEzOX8pGqX7nwYNWzJ3VH0cK3WXBmkEu7Ga', 'approved', 'Admin', 'Sistema', 'Costa Rica', 'Administrador de Sistema', 'Centro de Investigación Paleontológica'),
('investigador1', 'carlos.mendez@unadeca.net', '$2a$10$rQ8KvVPzJ.KqVx6kH9vEzOX8pGqX7nwYNWzJ3VH0cK3WXBmkEu7Ga', 'approved', 'Dr. Carlos', 'Méndez', 'Costa Rica', 'Paleontólogo', 'Universidad de Costa Rica'),
('investigador2', 'maria.rodriguez@unadeca.net', '$2a$10$rQ8KvVPzJ.KqVx6kH9vEzOX8pGqX7nwYNWzJ3VH0cK3WXBmkEu7Ga', 'approved', 'Dra. María', 'Rodríguez', 'Costa Rica', 'Geóloga', 'Universidad Nacional'),
('explorador1', 'jose.gonzalez@unadeca.net', '$2a$10$rQ8KvVPzJ.KqVx6kH9vEzOX8pGqX7nwYNWzJ3VH0cK3WXBmkEu7Ga', 'approved', 'José', 'González', 'Costa Rica', 'Geólogo de Campo', 'Independiente'),
('explorador2', 'ana.jimenez@unadeca.net', '$2a$10$rQ8KvVPzJ.KqVx6kH9vEzOX8pGqX7nwYNWzJ3VH0cK3WXBmkEu7Ga', 'approved', 'Ana', 'Jiménez', 'Costa Rica', 'Estudiante de Geología', 'Universidad de Costa Rica');

INSERT INTO user_roles (user_id, role) VALUES
(1, 'admin'),
(2, 'researcher'),
(2, 'explorer'),
(3, 'researcher'),
(4, 'explorer'),
(5, 'explorer');

-- ============================================
-- ERAS GEOLÓGICAS
-- ============================================
INSERT INTO geological_eras (name, start_millions_years, end_millions_years, description) VALUES
('Cenozoico', 66, 0, 'Era de los mamíferos, desde la extinción de los dinosaurios hasta la actualidad'),
('Mesozoico', 252, 66, 'Era de los reptiles y dinosaurios'),
('Paleozoico', 541, 252, 'Era de los primeros vertebrados y plantas terrestres'),
('Precámbrico', 4600, 541, 'Desde la formación de la Tierra hasta la explosión cámbrica');

-- ============================================
-- PERÍODOS GEOLÓGICOS
-- ============================================
-- Cenozoico
INSERT INTO geological_periods (era_id, name, start_millions_years, end_millions_years, description) VALUES
(1, 'Cuaternario', 2.6, 0, 'Período actual, incluye Pleistoceno y Holoceno'),
(1, 'Neógeno', 23, 2.6, 'Aparición y diversificación de homínidos'),
(1, 'Paleógeno', 66, 23, 'Recuperación tras la extinción del Cretácico');

-- Mesozoico
INSERT INTO geological_periods (era_id, name, start_millions_years, end_millions_years, description) VALUES
(2, 'Cretácico', 145, 66, 'Última época de los dinosaurios, gran extinción masiva'),
(2, 'Jurásico', 201, 145, 'Apogeo de los dinosaurios gigantes'),
(2, 'Triásico', 252, 201, 'Aparición de los primeros dinosaurios y mamíferos');

-- Paleozoico
INSERT INTO geological_periods (era_id, name, start_millions_years, end_millions_years, description) VALUES
(3, 'Pérmico', 299, 252, 'Gran extinción masiva al final del período'),
(3, 'Carbonífero', 359, 299, 'Grandes bosques de helechos y formación de carbón'),
(3, 'Devónico', 419, 359, 'Era de los peces, primeros anfibios'),
(3, 'Silúrico', 444, 419, 'Primeras plantas terrestres'),
(3, 'Ordovícico', 485, 444, 'Diversificación de invertebrados marinos'),
(3, 'Cámbrico', 541, 485, 'Explosión cámbrica de vida multicelular');

-- ============================================
-- REINOS TAXONÓMICOS
-- ============================================
INSERT INTO taxonomic_kingdoms (name, description) VALUES
('Animalia', 'Reino animal - organismos multicelulares heterótrofos móviles'),
('Plantae', 'Reino vegetal - organismos autótrofos fotosintéticos'),
('Fungi', 'Reino de los hongos - organismos heterótrofos descomponedores'),
('Protista', 'Organismos eucariotas mayormente unicelulares'),
('Monera', 'Organismos procariotas (bacterias y arqueas)');

-- ============================================
-- CLASIFICACIÓN COMPLETA PARA TYRANNOSAURUS REX
-- ============================================
-- Filo
INSERT INTO taxonomic_phylums (kingdom_id, name, description) VALUES
(1, 'Chordata', 'Animales con notocorda y sistema nervioso dorsal');

-- Clase  
INSERT INTO taxonomic_classes (phylum_id, name, description) VALUES
(1, 'Reptilia', 'Reptiles - vertebrados de sangre fría con escamas');

-- Orden
INSERT INTO taxonomic_orders (class_id, name, description) VALUES
(1, 'Saurischia', 'Dinosaurios con cadera de lagarto');

-- Familia
INSERT INTO taxonomic_families (order_id, name, description) VALUES
(1, 'Tyrannosauridae', 'Tiranosáuridos - grandes terópodos carnívoros');

-- Género
INSERT INTO taxonomic_genera (family_id, name, description) VALUES
(1, 'Tyrannosaurus', 'Género de grandes dinosaurios carnívoros del Cretácico');

-- Especie
INSERT INTO taxonomic_species (genus_id, name, common_name, description) VALUES
(1, 'rex', 'Tiranosaurio Rex', 'El rey de los dinosaurios carnívoros');

-- ============================================
-- CLASIFICACIÓN PARA PLANTAS (HELECHO FÓSIL)
-- ============================================
INSERT INTO taxonomic_phylums (kingdom_id, name, description) VALUES
(2, 'Pteridophyta', 'Helechos y plantas afines');

INSERT INTO taxonomic_classes (phylum_id, name, description) VALUES
(2, 'Polypodiopsida', 'Clase de helechos verdaderos');

INSERT INTO taxonomic_orders (class_id, name, description) VALUES
(2, 'Polypodiales', 'Orden principal de helechos');

INSERT INTO taxonomic_families (order_id, name, description) VALUES
(2, 'Polypodiaceae', 'Familia de helechos comunes');

INSERT INTO taxonomic_genera (family_id, name, description) VALUES
(2, 'Polypodium', 'Género de helechos epífitos');

INSERT INTO taxonomic_species (genus_id, name, common_name, description) VALUES
(2, 'vulgare', 'Helecho Común', 'Helecho común europeo');

-- ============================================
-- MÁS CLASIFICACIONES TAXONÓMICAS (para tener 15+)
-- ============================================

-- Trilobites
INSERT INTO taxonomic_phylums (kingdom_id, name) VALUES (1, 'Arthropoda');
INSERT INTO taxonomic_classes (phylum_id, name) VALUES (3, 'Trilobita');
INSERT INTO taxonomic_orders (class_id, name) VALUES (3, 'Ptychopariida');
INSERT INTO taxonomic_families (order_id, name) VALUES (3, 'Ptychopariidae');
INSERT INTO taxonomic_genera (family_id, name) VALUES (3, 'Elrathia');
INSERT INTO taxonomic_species (genus_id, name, common_name) VALUES (3, 'kingii', 'Trilobite de King');

-- Amonites
INSERT INTO taxonomic_phylums (kingdom_id, name) VALUES (1, 'Mollusca');
INSERT INTO taxonomic_classes (phylum_id, name) VALUES (4, 'Cephalopoda');
INSERT INTO taxonomic_orders (class_id, name) VALUES (4, 'Ammonoidea');
INSERT INTO taxonomic_families (order_id, name) VALUES (4, 'Hildoceratidae');
INSERT INTO taxonomic_genera (family_id, name) VALUES (4, 'Hildoceras');
INSERT INTO taxonomic_species (genus_id, name, common_name) VALUES (4, 'bifrons', 'Amonita de dos frentes');

-- Más filos para cumplir con 15+
INSERT INTO taxonomic_phylums (kingdom_id, name) VALUES 
(1, 'Echinodermata'),
(2, 'Bryophyta'),
(2, 'Marchantiophyta'),
(3, 'Basidiomycota'),
(3, 'Ascomycota');

-- ============================================
-- NOTA SOBRE PASSWORDS
-- ============================================
-- Todos los usuarios tienen la misma contraseña de prueba: Admin123!
-- El hash $2a$10$rQ8KvVPzJ.KqVx6kH9vEzOX8pGqX7nwYNWzJ3VH0cK3WXBmkEu7Ga
-- corresponde a "Admin123!" usando bcrypt con 10 rounds

SELECT 'Datos iniciales insertados correctamente' AS mensaje;