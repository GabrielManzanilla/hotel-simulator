#!/bin/bash

# Script para configurar PostgreSQL en el servidor
# Ejecutar en el servidor: bash setup-postgresql.sh

set -e

echo "🔧 Configurando PostgreSQL..."

# 1. Instalar PostgreSQL
echo "📦 Instalando PostgreSQL..."
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# 2. Iniciar y habilitar PostgreSQL
echo "🚀 Iniciando PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 3. Crear base de datos y usuario
echo "🗄️  Creando base de datos y usuario..."
sudo -u postgres psql <<EOF
-- Crear base de datos
CREATE DATABASE hotel_db;

-- Crear usuario
CREATE USER hotel_user WITH PASSWORD 'hotel_password_2024';

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE hotel_db TO hotel_user;

-- Conectar a la base de datos y dar permisos en el esquema
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
echo "📝 Configuración:"
echo "   Base de datos: hotel_db"
echo "   Usuario: hotel_user"
echo "   Contraseña: hotel_password_2024"
echo ""
echo "⚠️  IMPORTANTE: Cambia la contraseña en producción!"
echo ""
echo "✅ PostgreSQL configurado correctamente"

