# Usuarios en la base de datos (roles y creación)

## Error: `column "registration_status" of relation "users" does not exist`

Tu base de datos fue creada con un **esquema viejo** (antes de aprobación de registros y `user_roles`). El backend nuevo **sí** usa esa columna.

**Solución (conservar datos):** desde la terminal, contra la misma base que usa el `.env` del backend:

```bash
psql -h localhost -U TU_USUARIO -d fossil_catalog -f database/migrations/003_user_registration_approval.sql
psql -h localhost -U TU_USUARIO -d fossil_catalog -f database/migrations/004_user_roles.sql
psql -h localhost -U TU_USUARIO -d fossil_catalog -f database/migrations/005_backfill_user_roles.sql
psql -h localhost -U TU_USUARIO -d fossil_catalog -f database/migrations/006_grant_user_roles_permissions.sql
```

(Ajustá host, usuario y nombre de base.) Después reiniciá el backend y probá de nuevo el registro.

**Alternativa (borra datos):** recrear todo con `database/01-create-tables.sql` + `02-seed-data.sql` (solo en desarrollo).

Comprobación: **`GET http://localhost:5001/api/health`** → en `schema` debería verse `has_registration_status` y `register_ready` coherentes.

## Esquema esperado

- Tabla **`users`**: sin columna `role`; incluye **`registration_status`** (`pending` | `approved` | `rejected`).
- Tabla **`user_roles`**: una o más filas por usuario (`explorer`, `researcher`, `admin`).

Si venías de un esquema viejo, ejecutá en orden los scripts en **`database/migrations/`** (003–006). Si no tenés usuarios con roles, cargá **`database/02-seed-data.sql`** (o asigná roles a mano).

## Registro público (`POST /api/auth/register`)

- Crea usuario en **`pending`** y filas en **`user_roles`** según `roles: ['explorer']` o `role: 'explorer'` (**solo** `explorer` o `researcher`; **nunca** `admin` por esta ruta).
- Requiere **`first_name`**, **`last_name`**, **`username`**, **`email`**, **`password`**.

**Por qué falla `"Solo se permiten roles explorer y researcher en el registro"`** con `"role": "admin"`: es **intencional**. Un visitante no puede auto-registrarse como administrador.

### Ejemplo válido (Postman o front)

```json
{
  "username": "nuevo_explorador",
  "email": "nuevo@example.com",
  "password": "Test123456!",
  "first_name": "Nombre",
  "last_name": "Apellido",
  "role": "explorer",
  "country": "Costa Rica"
}
```

(o `"roles": ["explorer"]` o `"roles": ["explorer", "researcher"]`).

## Login

- Solo usuarios **`registration_status = approved`** con al menos un rol en **`user_roles`** pueden obtener JWT.
- El token debe incluir **`roles`** (array); si no, el middleware responde `TOKEN_NO_ROLES`.

### "Credenciales invalidas" con `admin@unadeca.net` y `Admin123!`

Si ya cargaste un seed **anterior**, el `password_hash` en la BD podía **no** corresponder a `Admin123!` (bug del hash en el repo). Ejecutá **`database/migrations/007_fix_seed_password_bcrypt.sql`** contra tu base (o volvé a cargar `02-seed-data.sql` desde la versión corregida).

## Crear usuario / admin por API (`POST /api/users`) — no es el “sign up”

1. Tenés que tener **al menos un admin** en la BD con la que puedas hacer login (por ejemplo el seed `admin@unadeca.net` / `Admin123!` si corriste `02-seed-data.sql` tras las migraciones).
2. En Postman: **POST** `{{baseUrl}}/api/auth/login` con ese admin → copiá **`data.token`** a la variable de colección **`token`** (la colección usa Bearer `{{token}}`).
3. **POST** `{{baseUrl}}/api/users` con cabecera `Content-Type: application/json` y cuerpo por ejemplo:

```json
{
  "username": "superadmin",
  "email": "super@admin.com",
  "password": "Superadmin1!",
  "first_name": "Super",
  "last_name": "Admin",
  "roles": ["admin"],
  "country": "Costa Rica"
}
```

Usá **`roles`: `["admin"]`** (recomendado) o **`"role": "admin"`**. Ahí **sí** se puede crear otro admin; no uses **`/api/auth/register`** para eso.

- Requiere **Bearer** de un usuario con rol **`admin`**.
- Opcionales: `first_name`, `last_name`, `country`, etc.
- El servidor inserta el usuario ya **`approved`** y asigna roles en **`user_roles`**.

## Postman

Usá **`backend/postman/fossil-catalog-api.postman_collection.json`**: **Login (admin seed)** → variable **`token`** → **POST /api/users (crear admin)**.
