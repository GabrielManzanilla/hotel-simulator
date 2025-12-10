#!/bin/bash

# Script para corregir la configuración de PostgreSQL

set -e

echo "🔧 Corrigiendo configuración de PostgreSQL..."

cd /var/www/hotel-simulator

# 1. Verificar que el archivo .env existe y tiene las variables correctas
echo "📝 Verificando archivo .env..."
if [ ! -f .env ]; then
    echo "❌ Archivo .env no existe, creándolo..."
    cat > .env <<EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=hotel_user
DB_PASSWORD=hotel_password_2024
PORT=3000
NODE_ENV=production
EOF
else
    echo "✅ Archivo .env existe"
    # Asegurarse de que tiene las variables correctas
    if ! grep -q "DB_USER=hotel_user" .env; then
        echo "⚠️  Actualizando variables en .env..."
        # Eliminar líneas antiguas de DB_*
        sed -i '/^DB_/d' .env
        # Añadir las correctas
        cat >> .env <<EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=hotel_user
DB_PASSWORD=hotel_password_2024
EOF
    fi
fi

# 2. Verificar que el usuario hotel_user existe en PostgreSQL
echo "👤 Verificando usuario hotel_user en PostgreSQL..."
sudo -u postgres psql <<EOF
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'hotel_user') THEN
      CREATE USER hotel_user WITH PASSWORD 'hotel_password_2024';
      RAISE NOTICE 'Usuario hotel_user creado';
   ELSE
      RAISE NOTICE 'Usuario hotel_user ya existe';
   END IF;
END
\$\$;

-- Asegurar permisos
GRANT ALL PRIVILEGES ON DATABASE hotel_db TO hotel_user;
\c hotel_db
GRANT ALL ON SCHEMA public TO hotel_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hotel_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hotel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hotel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hotel_user;
\q
EOF

# 3. Actualizar ecosystem.config.js para cargar variables de entorno
echo "⚙️  Actualizando ecosystem.config.js..."
cat > ecosystem.config.js <<'EOF'
require('dotenv').config();

module.exports = {
  apps: [{
    name: 'hotel-simulator',
    script: './src/server.js',
    instances: 1,
    exec_mode: 'fork',
    env_file: '.env',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000,
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: process.env.DB_PORT || 5432,
      DB_NAME: process.env.DB_NAME || 'hotel_db',
      DB_USER: process.env.DB_USER || 'hotel_user',
      DB_PASSWORD: process.env.DB_PASSWORD || 'hotel_password_2024',
      DATABASE_URL: process.env.DATABASE_URL
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

# 4. Instalar dotenv si no está instalado
echo "📦 Verificando dotenv..."
if ! npm list dotenv > /dev/null 2>&1; then
    echo "📦 Instalando dotenv..."
    npm install dotenv
fi

# 5. Reiniciar aplicación
echo "🔄 Reiniciando aplicación..."
pm2 delete hotel-simulator 2>/dev/null || true
pm2 start ecosystem.config.js

# 6. Verificar logs
echo ""
echo "📋 Esperando 5 segundos y verificando logs..."
sleep 5
pm2 logs hotel-simulator --lines 30 --nostream | tail -30

echo ""
echo "✅ Configuración corregida!"
echo "🌐 Verifica: curl http://localhost:3000/health"

