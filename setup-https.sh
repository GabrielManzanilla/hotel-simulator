#!/bin/bash

# Script para configurar HTTPS con Let's Encrypt
# Ejecutar en el servidor: bash setup-https.sh

set -e

DOMAIN="it-prove-demo.alteriva.com"
EMAIL="admin@alteriva.com"

echo "🔒 Configurando HTTPS para $DOMAIN"
echo ""

# 1. Verificar que nginx está corriendo
echo "1️⃣ Verificando nginx..."
sudo systemctl status nginx --no-pager | head -3
echo ""

# 2. Verificar que el dominio resuelve correctamente
echo "2️⃣ Verificando DNS..."
IP=$(dig +short $DOMAIN | tail -1)
echo "   Dominio $DOMAIN resuelve a: $IP"
echo "   IP del servidor: $(curl -s ifconfig.me)"
echo ""

# 3. Obtener certificado SSL
echo "3️⃣ Obteniendo certificado SSL de Let's Encrypt..."
if sudo certbot certonly --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL; then
    echo "✅ Certificado obtenido exitosamente"
else
    echo "⚠️  Error al obtener certificado. Verifica que:"
    echo "   - El dominio apunta a este servidor en DNS"
    echo "   - El puerto 80 está abierto en el firewall"
    echo "   - nginx está corriendo"
    exit 1
fi
echo ""

# 4. Actualizar configuración de nginx
echo "4️⃣ Actualizando configuración de nginx..."
sudo mv /tmp/nginx-hotel-simulator-https.conf /etc/nginx/sites-available/hotel-simulator 2>/dev/null || echo "   (Archivo ya actualizado o no existe)"
echo ""

# 5. Verificar configuración
echo "5️⃣ Verificando configuración de nginx..."
sudo nginx -t
echo ""

# 6. Recargar nginx
echo "6️⃣ Recargando nginx..."
sudo systemctl reload nginx
echo ""

# 7. Verificar certificados
echo "7️⃣ Certificados instalados:"
sudo certbot certificates
echo ""

# 8. Configurar renovación automática
echo "8️⃣ Verificando renovación automática..."
sudo systemctl status certbot.timer --no-pager | head -3
echo ""

echo "✅ HTTPS configurado correctamente!"
echo ""
echo "🌐 URLs disponibles:"
echo "   HTTP:  http://$DOMAIN (redirige a HTTPS)"
echo "   HTTPS: https://$DOMAIN"
echo ""
echo "📋 Para probar:"
echo "   curl https://$DOMAIN/health"
echo ""

