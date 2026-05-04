-- Permisos sobre user_roles
-- Ejecutar conectado como superusuario (p. ej. postgres), no como fossil_admin.
-- Si su rol de aplicación tiene otro nombre, sustituye fossil_admin en ambas líneas.

GRANT USAGE ON SCHEMA public TO fossil_admin;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_roles TO fossil_admin;
