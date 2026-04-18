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
├── backend/      # API Express + PostgreSQL
├── frontend/     # React + Vite
├── database/     # Scripts SQL (schema + seed)
└── README.md
```

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

Cada vez que vuelvas al proyecto:

1. Inicia PostgreSQL.
2. En terminal 1:

```bash
cd backend
npm run dev
```

3. En terminal 2:

```bash
cd frontend
npm run dev
```

4. Abre `http://localhost:5173`.

---

## 7) Endpoints y coleccion Postman

Existe una coleccion Postman en:

- `backend/postman/fossil-catalog-api.postman_collection.json`

Importala en Postman para probar rutas rapidamente.

---

## 8) Problemas comunes (y solucion)

- **Error `EADDRINUSE` en backend**  
  El puerto ya esta ocupado. Cierra procesos previos o cambia `PORT` en `backend/.env`.

- **Error de conexion PostgreSQL**  
  Verifica `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` en `backend/.env`.

- **Frontend no consume backend**  
  Verifica `VITE_API_URL` en `frontend/.env`.

- **Cambios en DB no aparecen**  
  Si cambias schema, vuelve a correr scripts SQL o crea migracion manual.

---

## 9) Notas para el equipo

- Evitar subir credenciales reales al repo.
- Mantener `*.example` actualizados cuando cambien variables.
- Si agregas nuevas rutas/backend features, documentarlas aqui.
- Si agregas nuevas dependencias, correr `npm install` en la carpeta correspondiente y commitear `package-lock.json`.