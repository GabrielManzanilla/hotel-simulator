#!/bin/bash

# Script completo para corregir la configuración de PostgreSQL
# Ejecutar en el servidor Linux

set -e

echo "=========================================="
echo "🔧 Corrigiendo configuración de PostgreSQL"
echo "=========================================="
echo ""

cd /var/www/hotel-simulator

# 1. Crear/actualizar archivo .env
echo "📝 Paso 1/5: Configurando archivo .env..."
cat > .env <<EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=hotel_user
DB_PASSWORD=hotel_password_2024
PORT=3000
NODE_ENV=production
EOF
echo "✅ Archivo .env creado/actualizado"
echo ""

# 2. Verificar que el usuario hotel_user existe
echo "👤 Paso 2/5: Verificando usuario PostgreSQL..."
sudo -u postgres psql <<'PSQL_EOF'
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'hotel_user') THEN
      CREATE USER hotel_user WITH PASSWORD 'hotel_password_2024';
      RAISE NOTICE 'Usuario hotel_user creado';
   ELSE
      RAISE NOTICE 'Usuario hotel_user ya existe';
   END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE hotel_db TO hotel_user;
\c hotel_db
GRANT ALL ON SCHEMA public TO hotel_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hotel_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hotel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hotel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hotel_user;
\q
PSQL_EOF
echo "✅ Usuario PostgreSQL verificado"
echo ""

# 3. Actualizar código
echo "📥 Paso 3/5: Actualizando código desde Git..."
git pull origin main
echo "✅ Código actualizado"
echo ""

# 4. Instalar dependencias
echo "📦 Paso 4/5: Instalando dependencias npm..."
npm install
echo "✅ Dependencias instaladas"
echo ""

# 5. Reiniciar aplicación con PM2
echo "🔄 Paso 5/5: Reiniciando aplicación..."
pm2 delete hotel-simulator 2>/dev/null || true
pm2 start ecosystem.config.js --update-env
echo "✅ Aplicación reiniciada"
echo ""

# 6. Esperar y mostrar logs
echo "⏳ Esperando 5 segundos para que la aplicación inicie..."
sleep 5
echo ""
echo "=========================================="
echo "📋 Logs recientes de la aplicación:"
echo "=========================================="
pm2 logs hotel-simulator --lines 30 --nostream | tail -30
echo ""

# 7. Verificar estado
echo "=========================================="
echo "📊 Estado de PM2:"
echo "=========================================="
pm2 list
echo ""

# 8. Probar conexión
echo "=========================================="
echo "🧪 Probando endpoint /health:"
echo "=========================================="
curl -s http://localhost:3000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/health
echo ""
echo ""

echo "=========================================="
echo "✅ Configuración completada!"
echo "=========================================="
echo ""
echo "🌐 Verifica desde tu máquina:"
echo "   curl http://it-prove-demo.alteriva.com/health"
echo ""

