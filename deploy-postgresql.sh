#!/bin/bash

# Script para desplegar la aplicación con PostgreSQL
# Ejecutar en el servidor después de setup-postgresql.sh

set -e

echo "🚀 Desplegando aplicación con PostgreSQL..."

# Directorio de la aplicación
APP_DIR="/var/www/hotel-simulator"
cd $APP_DIR

# 1. Actualizar código
echo "📥 Actualizando código..."
git pull origin main

# 2. Instalar dependencias
echo "📦 Instalando dependencias npm..."
npm install

# 3. Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env <<EOF
# Configuración de Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=hotel_user
DB_PASSWORD=hotel_password_2024

# Puerto del servidor Express
PORT=3000

# Entorno
NODE_ENV=production
EOF
    echo "✅ Archivo .env creado"
else
    echo "ℹ️  Archivo .env ya existe"
fi

# 4. Reiniciar aplicación con PM2
echo "🔄 Reiniciando aplicación..."
pm2 restart hotel-simulator || pm2 start ecosystem.config.js

# 5. Verificar estado
echo "✅ Verificando estado..."
sleep 3
pm2 list
pm2 logs hotel-simulator --lines 20 --nostream

echo ""
echo "✅ Despliegue completado!"
echo "🌐 Verifica el endpoint: http://localhost:3000/health"

