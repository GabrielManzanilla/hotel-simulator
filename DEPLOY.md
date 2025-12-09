# 🚀 Guía de Deployment

## Deployment Rápido

### Opción 1: Usar el script automático (Recomendado)

1. **Conectarte al servidor por SSH:**
```bash
ssh -i ruta/a/tu-archivo.pem ubuntu@it-prove-demo.alteriva.com
```

2. **Subir el script de deployment:**
Desde tu máquina local:
```bash
scp -i ssh/it-prove-demo-gabriel.pem deploy.sh ubuntu@it-prove-demo.alteriva.com:~/
```

3. **Ejecutar el script en el servidor:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Opción 2: Deployment Manual

Ejecuta estos comandos en el servidor:

```bash
# 1. Instalar dependencias del sistema
sudo apt update
sudo apt install -y nodejs nginx
sudo npm install -g pm2

# 2. Crear directorio
sudo mkdir -p /var/www/hotel-simulator
sudo chown -R $USER:$USER /var/www/hotel-simulator
cd /var/www/hotel-simulator

# 3. Clonar código
git clone https://github.com/GabrielManzanilla/hotel-simulator.git .

# 4. Instalar dependencias
npm install --production

# 5. Crear directorio de logs
mkdir -p logs

# 6. Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Ejecuta el comando que te muestre

# 7. Configurar nginx
sudo nano /etc/nginx/sites-available/hotel-simulator
# (Pega la configuración de nginx)

sudo ln -s /etc/nginx/sites-available/hotel-simulator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Verificación

```bash
# Verificar que la app está corriendo
pm2 status
curl http://localhost:3000/health

# Verificar nginx
curl http://it-prove-demo.alteriva.com/health
```

## Comandos de Gestión

```bash
# Ver logs
pm2 logs hotel-simulator

# Reiniciar
pm2 restart hotel-simulator

# Ver estado
pm2 status

# Ver logs de nginx
sudo tail -f /var/log/nginx/hotel-simulator-access.log
```

