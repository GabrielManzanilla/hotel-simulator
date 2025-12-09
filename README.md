# Hotel Webhook Simulator

Backend de prueba para webhooks orientado a un negocio hotelero. Este simulador proporciona casos de uso para consultar promociones, precios de habitaciones y crear reservaciones con códigos alfanuméricos de recepción.

## 🏨 Características

- **Consultar Promociones Disponibles**: Obtén información sobre descuentos y ofertas especiales
- **Consultar Costos de Habitaciones**: Consulta precios por tipo de habitación y estancia
- **Crear Reservación con Código de Recepción**: Realiza reservaciones y genera códigos alfanuméricos para check-in rápido
- **Consultar Directorio Telefónico**: Busca contactos por área, nombre o extensión telefónica

## 🚀 Instalación

```bash
npm install
```

## ▶️ Ejecución

```bash
npm start
```

La primera vez que ejecutes el servidor, se creará automáticamente:
- La base de datos SQLite en `data/hotel.db`
- El esquema de base de datos con todas las tablas
- Los datos iniciales (seed) con promociones, habitaciones y directorio telefónico

El servidor se ejecutará en `http://localhost:3001`

## 📋 Casos de Uso Disponibles

### 1. Consultar Promociones Disponibles

**Use Case ID**: `gen_get_promotions`

Consulta las promociones y descuentos disponibles en el hotel.

**Parámetros opcionales**:
- `room_type`: Tipo de habitación (standard, deluxe, suite)
- `check_in_date`: Fecha de entrada (YYYY-MM-DD)

**Ejemplo de uso**:
```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "use_case_id": "gen_get_promotions",
      "agent_id": "test"
    },
    "arguments": {
      "room_type": "suite"
    }
  }'
```

### 2. Consultar Costos de Habitaciones

**Use Case ID**: `gen_get_room_prices`

Consulta los precios y costos de las habitaciones disponibles.

**Parámetros opcionales**:
- `room_type`: Tipo de habitación específico
- `check_in_date`: Fecha de entrada
- `check_out_date`: Fecha de salida
- `nights`: Número de noches

**Ejemplo de uso**:
```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "use_case_id": "gen_get_room_prices",
      "agent_id": "test"
    },
    "arguments": {
      "check_in_date": "2025-03-15",
      "check_out_date": "2025-03-18",
      "room_type": "deluxe"
    }
  }'
```

### 3. Crear Reservación y Generar Código de Recepción

**Use Case ID**: `gen_create_reservation`

Crea una reservación de habitación y genera un código alfanumérico para el check-in en recepción.

**Parámetros requeridos**:
- `guest_name`: Nombre completo del huésped
- `guest_email`: Email del huésped
- `guest_phone`: Teléfono del huésped
- `room_type`: Tipo de habitación (standard, deluxe, suite)
- `check_in_date`: Fecha de entrada (YYYY-MM-DD)
- `check_out_date`: Fecha de salida (YYYY-MM-DD)

**Parámetros opcionales**:
- `promotion_id`: ID de promoción a aplicar

**Respuesta**:
La respuesta es un JSON que incluye:
- `message`: Mensaje de confirmación en texto (incluye el código de recepción)
- `reservation`: Detalles completos de la reservación
- `reception_code`: Código alfanumérico de recepción (formato: REC-XXXX-YYYY)
- `reception_code_format`: Formato del código ("alphanumeric")

**Ejemplo de uso**:
```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "use_case_id": "gen_create_reservation",
      "agent_id": "test"
    },
    "arguments": {
      "guest_name": "Juan Pérez",
      "guest_email": "juan@example.com",
      "guest_phone": "+52 55 1234 5678",
      "room_type": "deluxe",
      "check_in_date": "2025-03-15",
      "check_out_date": "2025-03-18",
      "promotion_id": "PROM001"
    }
  }'
```

## 📊 Tipos de Habitaciones

- **standard**: Habitación Estándar - $1,500/noche - 2 personas
- **deluxe**: Habitación Deluxe - $2,500/noche - 3 personas
- **suite**: Suite Premium - $4,500/noche - 4 personas

## 🎁 Promociones Disponibles

- **PROM001**: Descuento de Temporada - 20% descuento en marzo
- **PROM002**: Promoción Fin de Semana - 15% descuento viernes a domingo
- **PROM003**: Estancia Larga - 10% descuento para 5+ noches
- **PROM004**: Promoción Suite Premium - 25% descuento en suites (temporada baja)

## 🔍 Endpoints

- `POST /webhook`: Endpoint principal para recibir webhooks
- `GET /health`: Endpoint de salud del servidor
- `GET /services/status`: Estado de los servicios internos
- `GET /`: Información general del simulador

## 📝 Código de Recepción

Cuando se crea una reservación, se genera automáticamente un código alfanumérico único que se incluye **siempre** en la respuesta del backend. El código tiene el formato `REC-XXXX-YYYY` donde:
- `XXXX`: Número de reservación (ej: 1000, 1001, etc.)
- `YYYY`: Timestamp codificado en base36 (ej: A1B2, C3D4, etc.)

**Formato de respuesta:**
La respuesta es un JSON serializado como string que incluye:
- `reception_code`: Código alfanumérico de recepción (ej: "REC-1000-A1B2")
- `reception_code_format`: Formato del código ("alphanumeric")
- `message`: Mensaje de confirmación (incluye el código de recepción)
- `reservation`: Detalles completos de la reservación

El frontend puede parsear el JSON y mostrar el código de recepción al usuario. El código debe presentarse en recepción al llegar al hotel para agilizar el proceso de check-in.

## 💾 Base de Datos SQLite

El sistema utiliza **SQLite** para persistir todos los datos. La base de datos se crea automáticamente al iniciar el servidor por primera vez.

### Estructura de la Base de Datos

- **promotions**: Promociones del hotel
- **promotion_room_types**: Relación muchos a muchos entre promociones y tipos de habitación
- **rooms**: Habitaciones disponibles
- **room_amenities**: Amenidades de cada habitación
- **reservations**: Reservaciones creadas
- **phone_directory**: Directorio telefónico del hotel

### Ubicación

La base de datos se guarda en: `data/hotel.db`

### Inicialización Automática

Al iniciar el servidor por primera vez:
1. Se crea la base de datos si no existe
2. Se crean todas las tablas del esquema
3. Se insertan los datos iniciales (seed):
   - 4 promociones
   - 3 tipos de habitaciones
   - 13 contactos del directorio telefónico

### Ventajas de SQLite

- ✅ **Sin configuración**: No requiere servidor de base de datos separado
- ✅ **Persistencia**: Los datos se mantienen entre reinicios
- ✅ **Portable**: Un solo archivo `.db` contiene toda la información
- ✅ **Rápido**: Ideal para desarrollo y pruebas
- ✅ **Transaccional**: Soporta transacciones ACID

## 📞 Directorio Telefónico

El sistema incluye un directorio telefónico completo con contactos de diferentes áreas del hotel.

**Use Case ID**: `gen_get_phone_directory`

**Parámetros opcionales**:
- `area`: Área del hotel (recepción, piscina, cocina, spa, mantenimiento, seguridad, conserjería, lavandería, room_service)
- `name`: Nombre del contacto a buscar
- `extension`: Número de extensión telefónica
- `all`: Si es `true`, devuelve todo el directorio completo

**Áreas disponibles**:
- Recepción
- Piscina
- Cocina
- Servicio a Habitaciones
- Spa
- Mantenimiento
- Seguridad
- Conserjería
- Lavandería

**Ejemplo de uso**:
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "use_case_id": "gen_get_phone_directory",
      "agent_id": "test"
    },
    "arguments": {
      "area": "recepción"
    }
  }'
```

**Respuesta**:
La respuesta incluye información detallada de contacto:
- Nombre y cargo
- Teléfono y extensión
- Email
- Horario de atención

## 🔧 Configuración en Roddy

1. Crea un webhook apuntando a tu servidor (usando ngrok para desarrollo local)
2. Verifica el webhook desde el frontend
3. Crea los casos de uso genéricos usando la configuración en `use-cases-config.json`
4. Asocia los casos de uso a tus agentes

## 📚 Archivos de Referencia

- `use-cases-config.json`: Configuración completa de todos los casos de uso
- `server.js`: Implementación de los servicios
- `package.json`: Dependencias del proyecto

## 🛠️ Tecnologías

- Node.js
- Express

## 📄 Licencia

MIT
