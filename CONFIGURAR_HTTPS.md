# 🔒 Guía para Configurar HTTPS

## Requisitos Previos

1. **Verificar DNS**: El dominio `it-prove-demo.alteriva.com` debe apuntar a la IP del servidor: `3.227.109.58`
   - Verifica en tu proveedor de DNS que hay un registro A apuntando a esta IP
   - Puedes verificar con: `dig it-prove-demo.alteriva.com` o `nslookup it-prove-demo.alteriva.com`

2. **Puerto 80 abierto**: El puerto 80 debe estar abierto en el firewall para la validación de Let's Encrypt

## Pasos para Configurar HTTPS

### Opción 1: Usando Certbot Automático (Recomendado)

Ejecuta estos comandos en tu terminal SSH:

```bash
# 1. Obtener certificado SSL (Certbot modificará nginx automáticamente)
sudo certbot --nginx -d it-prove-demo.alteriva.com

# Te pedirá:
# - Email: ingresa tu email (ej: admin@alteriva.com)
# - Términos: Acepta (A)
# - Redirección: Elige redirigir HTTP a HTTPS (2)

# 2. Verificar que el certificado se obtuvo
sudo certbot certificates

# 3. Verificar configuración de nginx
sudo nginx -t

# 4. Recargar nginx
sudo systemctl reload nginx

# 5. Probar HTTPS
curl https://it-prove-demo.alteriva.com/health
```

### Opción 2: Configuración Manual

Si prefieres configurar manualmente:

```bash
# 1. Obtener solo el certificado (sin modificar nginx)
sudo certbot certonly --nginx -d it-prove-demo.alteriva.com

# 2. Actualizar configuración de nginx
sudo nano /etc/nginx/sites-available/hotel-simulator
```

Pega esta configuración:

```nginx
# Redirección HTTP a HTTPS
server {
    listen 80;
    server_name it-prove-demo.alteriva.com;
    return 301 https://$server_name$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    server_name it-prove-demo.alteriva.com;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/it-prove-demo.alteriva.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/it-prove-demo.alteriva.com/privkey.pem;
    
    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    access_log /var/log/nginx/hotel-simulator-access.log;
    error_log /var/log/nginx/hotel-simulator-error.log;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 3. Verificar y recargar
sudo nginx -t
sudo systemctl reload nginx
```

## Verificación

```bash
# Ver certificados instalados
sudo certbot certificates

# Probar HTTP (debe redirigir a HTTPS)
curl -I http://it-prove-demo.alteriva.com/health

# Probar HTTPS
curl https://it-prove-demo.alteriva.com/health

# Verificar renovación automática
sudo systemctl status certbot.timer
```

## Renovación Automática

Let's Encrypt renueva automáticamente los certificados. El timer ya está configurado.

Para verificar:
```bash
sudo systemctl status certbot.timer
sudo systemctl list-timers | grep certbot
```

## Solución de Problemas

### Error: "Failed to obtain certificate"

**Causa**: El dominio no apunta al servidor o el puerto 80 está bloqueado.

**Solución**:
1. Verifica DNS: `dig it-prove-demo.alteriva.com`
2. Verifica firewall: `sudo ufw status`
3. Abre puerto 80: `sudo ufw allow 80/tcp`

### Error: "Connection refused"

**Causa**: nginx no está corriendo.

**Solución**:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Certificado expirado

Renovar manualmente:
```bash
sudo certbot renew
sudo systemctl reload nginx
```

## Endpoints Finales

Una vez configurado HTTPS:

- **HTTP**: `http://it-prove-demo.alteriva.com` → Redirige a HTTPS
- **HTTPS**: `https://it-prove-demo.alteriva.com/health`
- **Webhook**: `https://it-prove-demo.alteriva.com/webhook`

