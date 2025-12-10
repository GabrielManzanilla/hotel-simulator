#!/bin/bash

# Script completo para configurar PostgreSQL y desplegar
# Ejecutar en el servidor: bash ejecutar-configuracion.sh

set -e

echo "=========================================="
echo "🚀 Configuración de PostgreSQL y Despliegue"
echo "=========================================="
echo ""

# 1. Instalar PostgreSQL
echo "📦 Paso 1/6: Instalando PostgreSQL..."
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# 2. Iniciar PostgreSQL
echo "🚀 Paso 2/6: Iniciando PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 3. Crear base de datos y usuario
echo "🗄️  Paso 3/6: Creando base de datos y usuario..."
sudo -u postgres psql <<EOF
-- Crear base de datos si no existe
SELECT 'CREATE DATABASE hotel_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hotel_db')\gexec

-- Crear usuario si no existe
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'hotel_user') THEN
      CREATE USER hotel_user WITH PASSWORD 'hotel_password_2024';
   END IF;
END
\$\$;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE hotel_db TO hotel_user;
\c hotel_db
GRANT ALL ON SCHEMA public TO hotel_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hotel_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hotel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hotel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hotel_user;
\q
EOF

echo "✅ Base de datos y usuario creados"
echo ""

# 4. Actualizar código
echo "📥 Paso 4/6: Actualizando código..."
cd /var/www/hotel-simulator
git pull origin main

# 5. Instalar dependencias
echo "📦 Paso 5/6: Instalando dependencias npm..."
npm install

# 6. Configurar .env
echo "📝 Configurando variables de entorno..."
if [ ! -f .env ]; then
    cat > .env <<EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=hotel_user
DB_PASSWORD=hotel_password_2024
PORT=3000
NODE_ENV=production
EOF
    echo "✅ Archivo .env creado"
else
    echo "ℹ️  Archivo .env ya existe, verificando configuración..."
    if ! grep -q "DB_HOST" .env; then
        cat >> .env <<EOF

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=hotel_user
DB_PASSWORD=hotel_password_2024
EOF
        echo "✅ Variables de PostgreSQL añadidas a .env"
    fi
fi

# 7. Reiniciar aplicación
echo "🔄 Paso 6/6: Reiniciando aplicación..."
pm2 restart hotel-simulator || pm2 start ecosystem.config.js

# 8. Verificar
echo ""
echo "✅ Verificando estado..."
sleep 3
pm2 list
echo ""
echo "📋 Últimas líneas del log:"
pm2 logs hotel-simulator --lines 20 --nostream | tail -20

echo ""
echo "=========================================="
echo "✅ Configuración completada!"
echo "=========================================="
echo ""
echo "🌐 Verifica el endpoint:"
echo "   curl http://localhost:3000/health"
echo ""
echo "⚠️  IMPORTANTE: Cambia la contraseña de PostgreSQL en producción!"
echo "   sudo -u postgres psql -c \"ALTER USER hotel_user WITH PASSWORD 'tu_contraseña_segura';\""
echo ""

