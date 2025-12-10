#!/bin/bash

# Script rápido para corregir la configuración de PostgreSQL

cd /var/www/hotel-simulator

echo "🔧 Corrigiendo configuración..."

# 1. Asegurar que .env tiene las variables correctas
cat > .env <<EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=hotel_user
DB_PASSWORD=hotel_password_2024
PORT=3000
NODE_ENV=production
EOF

# 2. Actualizar código
git pull origin main

# 3. Instalar dependencias
npm install

# 4. Reiniciar con PM2 usando las variables de entorno
pm2 delete hotel-simulator 2>/dev/null || true
pm2 start ecosystem.config.js --update-env

# 5. Esperar y mostrar logs
sleep 5
echo ""
echo "📋 Logs recientes:"
pm2 logs hotel-simulator --lines 20 --nostream | tail -20

echo ""
echo "✅ Verifica: curl http://localhost:3000/health"

