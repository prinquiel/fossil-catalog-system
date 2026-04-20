# Qué hay de nuevo en el backend (rama main reciente)

Resumen corto para alinear el frontend y las pruebas.

## Autenticación y usuarios

- **Registro con aprobación:** nuevos usuarios quedan en `registration_status = pending` hasta que un admin apruebe.
- **Roles múltiples:** tabla `user_roles` y utilidades en `backend/src/utils/roles.js` (el registro envía `roles: ['explorer']`, `['researcher']` o ambos).
- **Login:** devuelve usuario con `roles` array; códigos de error como `REGISTRATION_PENDING` / `REGISTRATION_REJECTED` cuando aplica.
- **Correo:** `backend/src/services/emailService.js` y `docker-compose.mailpit.yml` para probar emails en local (Mailpit).

## Base de datos

- Migraciones en `database/migrations/` (`003` aprobación de registro, `004`–`006` roles y permisos).
- Cambios en `01-create-tables.sql` / `02-seed-data.sql` alineados con roles y registro.

## API y operación

- **`GET /api/health`:** además de la BD, puede incluir `schema` con comprobaciones (`user_roles`, `registration_status`, etc.) y `hint` si falta migrar.
- **Usuarios (admin):** más lógica en `userController.js` / rutas bajo `/api/users` para gestión (según permisos).

## Fósiles y resto

- **Fósiles, media, taxonomía, geología:** mismas ideas de antes; crear fósil sigue siendo `POST /api/fossils` con JWT de usuario con permiso (p. ej. explorer aprobado).

## Corrección reciente (`POST /api/users`)

- El `INSERT` de creación de usuario por admin tenía los placeholders de SQL mal alineados con los valores (mezclaba `registration_status` con el id del admin). Eso impedía crear usuarios/admins por Postman. Debe estar corregido en `userController.js`; si la BD falla, revisá mensaje de error y migraciones.
