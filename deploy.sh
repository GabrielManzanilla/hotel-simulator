#!/bin/bash

# Script de deployment para Hotel Simulator Backend
# Ejecutar en el servidor Ubuntu

set -e  # Salir si hay algún error

echo "🚀 Iniciando deployment del Hotel Simulator Backend..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar/Instalar Node.js
echo -e "${YELLOW}1. Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "Instalando Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo -e "${GREEN}✅ Node.js ya está instalado: $(node --version)${NC}"
fi

# 2. Instalar nginx y PM2
echo -e "${YELLOW}2. Instalando nginx y PM2...${NC}"
sudo apt update
sudo apt install -y nginx
sudo npm install -g pm2

echo -e "${GREEN}✅ nginx y PM2 instalados${NC}"

# 3. Crear directorio para la aplicación
echo -e "${YELLOW}3. Creando directorio de la aplicación...${NC}"
sudo mkdir -p /var/www/hotel-simulator
sudo chown -R $USER:$USER /var/www/hotel-simulator
cd /var/www/hotel-simulator

echo -e "${GREEN}✅ Directorio creado: /var/www/hotel-simulator${NC}"

# 4. Clonar código desde GitHub
echo -e "${YELLOW}4. Clonando código desde GitHub...${NC}"
if [ -d ".git" ]; then
    echo "Actualizando código existente..."
    git pull origin main
else
    git clone https://github.com/GabrielManzanilla/hotel-simulator.git .
fi

echo -e "${GREEN}✅ Código actualizado${NC}"

# 5. Instalar dependencias
echo -e "${YELLOW}5. Instalando dependencias...${NC}"
npm install --production

echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# 6. Crear directorio de logs
echo -e "${YELLOW}6. Creando directorio de logs...${NC}"
mkdir -p logs

# 7. Iniciar/Reiniciar con PM2
echo -e "${YELLOW}7. Iniciando aplicación con PM2...${NC}"
if pm2 list | grep -q "hotel-simulator"; then
    echo "Reiniciando aplicación existente..."
    pm2 restart hotel-simulator
else
    pm2 start ecosystem.config.js
    pm2 save
    echo "Ejecuta el siguiente comando que PM2 te muestre para iniciar al boot:"
    pm2 startup
fi

echo -e "${GREEN}✅ Aplicación iniciada con PM2${NC}"

# 8. Configurar nginx
echo -e "${YELLOW}8. Configurando nginx...${NC}"

NGINX_CONFIG="/etc/nginx/sites-available/hotel-simulator"

sudo tee $NGINX_CONFIG > /dev/null <<EOF
server {
    listen 80;
    server_name it-prove-demo.alteriva.com;

    access_log /var/log/nginx/hotel-simulator-access.log;
    error_log /var/log/nginx/hotel-simulator-error.log;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/hotel-simulator /etc/nginx/sites-enabled/

# Verificar configuración
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ nginx configurado y recargado${NC}"
else
    echo "❌ Error en la configuración de nginx"
    exit 1
fi

# 9. Configurar firewall
echo -e "${YELLOW}9. Configurando firewall...${NC}"
sudo ufw allow 'Nginx HTTP' 2>/dev/null || echo "Firewall ya configurado o no disponible"

# 10. Verificar deployment
echo -e "${YELLOW}10. Verificando deployment...${NC}"
sleep 2

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Aplicación respondiendo correctamente${NC}"
else
    echo "⚠️  La aplicación podría no estar respondiendo aún"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment completado!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📡 Endpoints disponibles:"
echo "   Local: http://localhost:3000/health"
echo "   Público: http://it-prove-demo.alteriva.com/health"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: pm2 logs hotel-simulator"
echo "   Reiniciar: pm2 restart hotel-simulator"
echo "   Estado: pm2 status"
echo ""

