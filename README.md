# 🦴 Sistema de Catalogación de Fósiles

## 📋 Descripción

Sistema web para catalogación y gestión de fósiles desarrollado como proyecto final del curso de Bases de Datos.

## 👥 Equipo

- **Persona 1** - Base de Datos y Backend
- **Persona 2** - Frontend
- **Persona 3** - Documentación y Diagramas

## 🛠️ Tecnologías

- **Backend:** Node.js + Express
- **Base de Datos:** PostgreSQL 14
- **Frontend:** React + Vite
- **Estilos:** Tailwind CSS

## 📦 Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- Git

## 🚀 Instalación (Desarrollo Local)

### 1. Clonar repositorio

```bash
git clone https://github.com/TU-USUARIO/fossil-catalog-system.git
cd fossil-catalog-system
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos
createdb fossil_catalog

# Ejecutar scripts
psql -d fossil_catalog -f database/01-create-tables.sql
psql -d fossil_catalog -f database/02-seed-data.sql
```

### 3. Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

### 4. Configurar Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 📂 Estructura del Proyecto

fossil-catalog-system/
├── backend/              # API Node.js + Express
├── frontend/            # Aplicación React
├── database/            # Scripts SQL
├── docs/                # Documentación
└── README.md