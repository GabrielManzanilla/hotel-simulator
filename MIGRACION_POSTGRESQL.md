# Migración de SQLite a PostgreSQL

## Cambios Realizados

### 1. Dependencias
- ✅ Reemplazado `sqlite3` por `pg` (node-postgres) en `package.json`

### 2. Base de Datos (`src/database/database.js`)
- ✅ Refactorizado completamente para usar PostgreSQL Pool
- ✅ Conversión automática de placeholders `?` a `$1, $2, $3...`
- ✅ Manejo de conexiones con pool para mejor rendimiento

### 3. Esquema (`src/database/schema.js`)
- ✅ `TEXT` → `VARCHAR` o `TEXT`
- ✅ `REAL` → `DECIMAL` para mejor precisión
- ✅ `INTEGER AUTOINCREMENT` → `SERIAL`
- ✅ `is_active INTEGER` → `is_active BOOLEAN`
- ✅ `CURRENT_TIMESTAMP` → `CURRENT_TIMESTAMP` (compatible)
- ✅ `GROUP_CONCAT` → `STRING_AGG` (PostgreSQL)
- ✅ Añadido índice en `guest_email` para consultas de reservaciones

### 4. Seed (`src/database/seed.js`)
- ✅ Cambiado `is_active: 1` → `is_active: true` (booleanos)
- ✅ Placeholders `?` se convierten automáticamente

### 5. Servicios
- ✅ `PromotionsService.js`: Actualizado para usar `STRING_AGG` y booleanos

## Configuración Requerida

### Variables de Entorno

Crea un archivo `.env` con la siguiente configuración:

```bash
# Opción 1: Connection string completo
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/hotel_db

# Opción 2: Parámetros individuales
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=postgres
DB_PASSWORD=postgres

PORT=3000
NODE_ENV=production
```

### Instalación de PostgreSQL

#### En Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Crear Base de Datos:
```bash
sudo -u postgres psql
CREATE DATABASE hotel_db;
CREATE USER hotel_user WITH PASSWORD 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE hotel_db TO hotel_user;
\q
```

#### Configurar PostgreSQL para conexiones remotas (opcional):
Editar `/etc/postgresql/*/main/pg_hba.conf`:
```
host    hotel_db    hotel_user    0.0.0.0/0    md5
```

Editar `/etc/postgresql/*/main/postgresql.conf`:
```
listen_addresses = '*'
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. Iniciar servidor:
```bash
npm start
```

El servidor creará automáticamente las tablas y poblará los datos iniciales.

## Migración de Datos Existentes

Si tienes datos en SQLite que necesitas migrar:

1. Exportar datos de SQLite:
```bash
sqlite3 data/hotel.db .dump > dump.sql
```

2. Convertir el dump a formato PostgreSQL (ajustes manuales necesarios)

3. Importar a PostgreSQL:
```bash
psql -U hotel_user -d hotel_db < dump_converted.sql
```

## Ventajas de PostgreSQL

- ✅ **Mejor concurrencia**: Escrituras simultáneas sin bloqueos
- ✅ **Escalabilidad**: Soporta múltiples instancias de PM2 sin problemas
- ✅ **Producción**: Más adecuado para entornos de producción
- ✅ **Funciones avanzadas**: JSON, full-text search, etc.

## Notas

- Los servicios no requirieron cambios (usan la abstracción de Database)
- La conversión de placeholders es automática y transparente
- Compatibilidad mantenida con el código existente

