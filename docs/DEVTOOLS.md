# pgAdmin 4, Postman y colección de tu compañero

## pgAdmin 4: ver la base `fossil_catalog`

1. Abre **pgAdmin 4**.
2. Clic derecho en **Servers** → **Register** → **Server…**
3. Pestaña **General:** nombre cualquiera, por ejemplo `Fossil local`.
4. Pestaña **Connection:**
   - **Host:** `localhost` (o el valor de `DB_HOST` en `backend/.env`)
   - **Port:** `5432` (o `DB_PORT`)
   - **Maintenance database:** `postgres` o directamente `fossil_catalog` si ya existe
   - **Username:** el mismo que `DB_USER` en `backend/.env`
   - **Password:** el de `DB_PASSWORD` (marca “Save password” si quieres).
5. **Save**. En el árbol: **Servers → tu servidor → Databases → `fossil_catalog` → Schemas → public → Tables** para ver tablas (`users`, `fossils`, `user_roles`, etc.).

Si no puedes conectar, confirma que PostgreSQL está encendido y que usuario/clave coinciden con `backend/.env`.

---

## Postman: probar la API y crear fósiles

### 1) Importar una colección

1. Abre **Postman**.
2. **Import** (arriba a la izquierda) → arrastra el archivo JSON o **Choose Files**.
3. Colección del proyecto (única): **`backend/postman/fossil-catalog-api.postman_collection.json`**. Si tu compañero te pasó otro JSON aparte, podés importarlo como segunda colección o copiar las requests a la del repo.

### 2) Variables de la colección (recomendado)

En la colección importada, pestaña **Variables**:

| Variable  | Valor inicial                         |
|-----------|----------------------------------------|
| `baseUrl` | `http://localhost:5001`              |
| `token`   | (vacío; se rellena después del login) |

Las URLs de las requests deberían usar `{{baseUrl}}/api/...` y **Authorization → Bearer Token** `{{token}}` donde haga falta.

### 3) Flujo típico para “crear fósil”

1. Arranca el backend (`cd backend` → `npm start`) con `.env` correcto y migraciones aplicadas.
2. **LogIn** con un usuario que exista y esté **aprobado** (p. ej. seed `explorador1` + contraseña del seed, o el que uses en tu BD).
3. En la respuesta, copia el **`token`** (campo `data.token` en el JSON).
4. En Postman: edita la variable de colección **`token`** con ese valor (o pégalo en **Authorization → Bearer Token** de la request **crear fósil**).
5. **crear fósil** → `POST {{baseUrl}}/api/fossils` con el body JSON (nombre, categoría `FOS`, etc.). Ajusta `province_code` / `canton_code` a valores válidos en tu BD si hace falta.

**Get fossils** (`GET /api/fossils`) puede ser público según tu versión del backend; **crear** siempre requiere token válido.

### 4) Si importas el archivo original del compañero

- Arregla a mano la request **registro:** URL debe ser exactamente  
  `http://localhost:5001/api/auth/register`  
  (Body → raw → JSON sin cambiar la estructura del JSON).
- Los tokens que vienen pegados en otras requests **caducan**; siempre haz **LogIn** de nuevo y actualiza el Bearer.

---

## Archivo del compañero en tu carpeta Descargas

Ruta ejemplo: `/Users/dannysito/Downloads/Fosils system.postman_collection.json`

**Cómo enviarlo / usarlo:** no se “sube” al servidor; se **importa** en Postman (Import → archivo). Para compartirlo con el equipo, súbelo al repo (como la versión corregida en `backend/postman/`) o pásalo por Drive/Slack y cada quien lo importa igual.
