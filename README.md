# Sistema de Catalogacion de Fosiles

Guia de continuidad para el equipo.  
Este README explica como levantar el proyecto completo (DB + backend + frontend) desde cero, con pasos claros y en orden.

---

## 1) Requisitos

Instala esto antes de empezar:

- Node.js 18 o superior (recomendado: 20+)
- npm (viene con Node)
- PostgreSQL 14 o superior
- Git

Verifica versiones:

```bash
node -v
npm -v
psql --version
git --version
```

---

## 2) Estructura del repositorio

```text
fossil-catalog-system/
├── package.json  # Solo scripts que delegan a frontend/ y backend/
├── backend/      # API Express + PostgreSQL (npm install aqui)
├── frontend/     # React + Vite (npm install aqui)
├── database/     # Scripts SQL (schema + seed)
├── docs/         # Guías (pgAdmin, Postman, resumen backend)
└── README.md
```

Guías útiles:

- [docs/DEVTOOLS.md](docs/DEVTOOLS.md) — pgAdmin 4, Postman.
- [docs/DATABASE_USERS.md](docs/DATABASE_USERS.md) — roles, registro y `POST /api/users`.
- [docs/BACKEND_OVERVIEW.md](docs/BACKEND_OVERVIEW.md) — novedades del backend (roles, registro pendiente, health, correo).

---

## 3) Configuracion inicial (primera vez)

### 3.1 Clonar proyecto

```bash
git clone <URL_DEL_REPO>
cd fossil-catalog-system
```

### 3.2 Crear y poblar base de datos

1. Crea la base:

```bash
createdb fossil_catalog
```

2. Ejecuta scripts SQL:

```bash
psql -d fossil_catalog -f database/01-create-tables.sql
psql -d fossil_catalog -f database/02-seed-data.sql
```

Si tu entorno usa usuario/host diferente:

```bash
psql -U <usuario> -h localhost -d fossil_catalog -f database/01-create-tables.sql
psql -U <usuario> -h localhost -d fossil_catalog -f database/02-seed-data.sql
```

---

## 4) Backend (API)

### 4.1 Instalar dependencias

```bash
cd backend
npm install
```

### 4.2 Variables de entorno

Ya existe `backend/.env.example`.  
Copialo a `.env` y edita credenciales reales:

```bash
cp .env.example .env
```

Valores esperados:

```env
PORT=5001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fossil_catalog
DB_USER=TU_USUARIO_POSTGRES
DB_PASSWORD=TU_PASSWORD_POSTGRES

JWT_SECRET=TU_SECRETO
JWT_EXPIRE=7d

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5001
```

### 4.3 Levantar backend

```bash
npm run dev
```

Backend esperado en:

- `http://localhost:5001`
- healthcheck: `http://localhost:5001/api/health`

---

## 5) Frontend (React)

### 5.1 Instalar dependencias

Abre otra terminal:

```bash
cd frontend
npm install
```

### 5.2 Variables de entorno

`frontend/.env` y `frontend/.env.example` deben tener:

```env
VITE_API_URL=http://localhost:5001/api
```

### 5.3 Levantar frontend

```bash
npm run dev
```

Frontend esperado en:

- `http://localhost:5173`

---

## 6) Flujo recomendado de ejecucion diaria

**Importante:** en la **raíz** del repo **no** hay `package.json` de la app; los comandos npm van dentro de **`backend/`** o **`frontend/`**. Si ejecutas `npm run dev` solo en la raíz sin usar los scripts de abajo, veras error `ENOENT` / no such file `package.json`.

Cada vez que vuelvas al proyecto:

1. Inicia PostgreSQL.
2. En terminal 1 (API):

```bash
cd backend
npm run dev
```

(O desde la raíz: `npm run dev:backend`.)

3. En terminal 2 (interfaz):

```bash
cd frontend
npm run dev
```

(O desde la raíz: `npm run dev:frontend`.)

4. Abre `http://localhost:5173`.

---

## 7) Endpoints y coleccion Postman

Una sola coleccion: **`backend/postman/fossil-catalog-api.postman_collection.json`**. Variables `baseUrl` y `token` (JWT tras login como admin). Incluye ejemplos de registro, login seed, creacion de usuario admin y rutas de usuarios pendientes.

Importar en Postman: **File → Import**. Mas detalle: [docs/DEVTOOLS.md](docs/DEVTOOLS.md). Usuarios y roles: [docs/DATABASE_USERS.md](docs/DATABASE_USERS.md).

---

## 8) Problemas comunes (y solucion)

- **`npm run dev` / `npm start` en la raíz: ENOENT package.json**  
  Entra a `frontend/` o `backend/`, o usa desde la raíz: `npm run dev:frontend`, `npm run dev:backend`, `npm run start:backend`.

- **El navegador abre `http://localhost:5173/...` pero “no arranque nada” en tus terminales**  
  Suele ser un **Vite u otro proceso que quedo abierto** en segundo plano, otra pestaña de terminal, o Cursor con el servidor ya levantado. Comprueba con `lsof -i :5173` (macOS) quien usa el puerto; para detenerlo, mata ese proceso o cierra la terminal donde quedo `npm run dev`.

- **Error `EADDRINUSE` en backend**  
  El puerto ya esta ocupado. Cierra procesos previos o cambia `PORT` en `backend/.env`.

- **Error de conexion PostgreSQL**  
  Verifica `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` en `backend/.env`.

- **Frontend no consume backend**  
  Verifica `VITE_API_URL` en `frontend/.env`.

- **Cambios en DB no aparecen**  
  Si cambias schema, vuelve a correr scripts SQL o crea migracion manual.

- **`column "registration_status" of relation "users" does not exist`**  
  La BD es anterior al esquema nuevo. Ejecuta en orden `database/migrations/003` … `006` (ver [docs/DATABASE_USERS.md](docs/DATABASE_USERS.md)).

- **Registro publico: "Solo se permiten roles explorer y researcher"**  
  Es normal: no podes pedir `admin` en `/api/auth/register`. Crear admins con **POST /api/users** y token de admin (misma guia).

---

## 9) Notas para el equipo

- Evitar subir credenciales reales al repo.
- Mantener `*.example` actualizados cuando cambien variables.
- Si agregas nuevas rutas/backend features, documentarlas aqui.
- Si agregas nuevas dependencias, correr `npm install` en la carpeta correspondiente y commitear `package-lock.json`.