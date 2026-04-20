-- Si ya ejecutaste 009 antes de que incluyera GRANTs, el rol de la app no puede leer/escribir scientific_studies.
-- Ejecutar como superusuario (p. ej. postgres). Si DB_USER no es fossil_admin, cambia el nombre.

GRANT USAGE ON SCHEMA public TO fossil_admin;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.scientific_studies TO fossil_admin;
GRANT USAGE, SELECT ON SEQUENCE public.scientific_studies_id_seq TO fossil_admin;
