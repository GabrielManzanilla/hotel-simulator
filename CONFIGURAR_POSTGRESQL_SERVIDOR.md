# Configurar PostgreSQL en el Servidor

## Opción 1: Usando los Scripts Automatizados (Recomendado)

### Paso 1: Subir los scripts al servidor

Desde tu máquina local, ejecuta:

```bash
# Asegúrate de tener la ruta correcta a tu archivo .pem
scp -i ruta/a/tu/archivo.pem setup-postgresql.sh deploy-postgresql.sh ubuntu@it-prove-demo.alteriva.com:/tmp/
```

### Paso 2: Ejecutar en el servidor

Conéctate por SSH:

```bash
ssh -i ruta/a/tu/archivo.pem ubuntu@it-prove-demo.alteriva.com
```

Luego ejecuta:

```bash
# Hacer ejecutables los scripts
chmod +x /tmp/setup-postgresql.sh /tmp/deploy-postgresql.sh

# Ejecutar configuración de PostgreSQL
sudo bash /tmp/setup-postgresql.sh

# Ejecutar despliegue
bash /tmp/deploy-postgresql.sh
```

## Opción 2: Comandos Manuales

### 1. Instalar PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Crear Base de Datos y Usuario

```bash
sudo -u postgres psql <<EOF
CREATE DATABASE hotel_db;
CREATE USER hotel_user WITH PASSWORD 'hotel_password_2024';
GRANT ALL PRIVILEGES ON DATABASE hotel_db TO hotel_user;
\c hotel_db
GRANT ALL ON SCHEMA public TO hotel_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hotel_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hotel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hotel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hotel_user;
\q
EOF
```

### 3. Actualizar Código en el Servidor

```bash
cd /var/www/hotel-simulator
git pull origin main
npm install
```

### 4. Configurar Variables de Entorno

```bash
cd /var/www/hotel-simulator
cat > .env <<EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=hotel_user
DB_PASSWORD=hotel_password_2024
PORT=3000
NODE_ENV=production
EOF
```

### 5. Reiniciar Aplicación

```bash
pm2 restart hotel-simulator
pm2 logs hotel-simulator --lines 50
```

## Verificar Instalación

### Verificar PostgreSQL

```bash
sudo -u postgres psql -c "\l" | grep hotel_db
```

### Verificar Conexión desde la Aplicación

```bash
curl http://localhost:3000/health
```

O desde tu máquina local:

```bash
curl http://it-prove-demo.alteriva.com/health
```

## Cambiar Contraseña (Recomendado para Producción)

```bash
sudo -u postgres psql <<EOF
ALTER USER hotel_user WITH PASSWORD 'tu_contraseña_segura_aqui';
\q
EOF
```

Luego actualiza el archivo `.env` en `/var/www/hotel-simulator/.env`

## Solución de Problemas

### Error: "password authentication failed"

Verifica que la contraseña en `.env` coincida con la del usuario PostgreSQL.

### Error: "database does not exist"

Ejecuta el script de creación de base de datos nuevamente.

### Error: "permission denied"

Asegúrate de que el usuario `hotel_user` tenga los permisos correctos:

```bash
sudo -u postgres psql -d hotel_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hotel_user;"
```

### Ver logs de la aplicación

```bash
pm2 logs hotel-simulator
```

### Ver logs de PostgreSQL

```bash
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

