# Casos de Uso - Hotel Simulator

Este documento contiene la configuración completa de los 4 casos de uso implementados en el simulador hotelero.

## 📋 Casos de Uso Disponibles

### 1. Consultar Promociones Disponibles

**Configuración:**
```json
{
  "use_case_id": "gen_get_promotions",
  "name": "Consultar Promociones Disponibles",
  "description": "Consulta las promociones y descuentos disponibles en el hotel",
  "tool_name": "consultar_promociones",
  "tool_description": "Consulta las promociones y descuentos disponibles en el hotel. Devuelve información sobre descuentos, fechas de vigencia, tipos de habitaciones aplicables y condiciones especiales.",
  "parameter_schema": {
    "type": "object",
    "properties": {
      "room_type": {
        "type": "string",
        "description": "Tipo de habitación para filtrar promociones (opcional): standard, deluxe, suite",
        "enum": ["standard", "deluxe", "suite"]
      },
      "check_in_date": {
        "type": "string",
        "description": "Fecha de entrada para verificar promociones vigentes (opcional, formato: YYYY-MM-DD)",
        "format": "date"
      }
    },
    "required": []
  }
}
```

**Ejemplo de uso:**
- Usuario: "¿Qué promociones hay disponibles?"
- Respuesta: Lista de promociones activas con descuentos y fechas de vigencia

**Promociones disponibles:**
- PROM001: Descuento de Temporada (20% en marzo)
- PROM002: Promoción Fin de Semana (15% viernes a domingo)
- PROM003: Estancia Larga (10% para 5+ noches)
- PROM004: Promoción Suite Premium (25% en suites, temporada baja)

---

### 2. Consultar Costos de Habitaciones

**Configuración:**
```json
{
  "use_case_id": "gen_get_room_prices",
  "name": "Consultar Costos de Habitaciones",
  "description": "Consulta los precios y costos de las habitaciones disponibles",
  "tool_name": "consultar_precios_habitaciones",
  "tool_description": "Consulta los precios y costos de las habitaciones disponibles. Devuelve información detallada sobre tipos de habitación, precios por noche, precios totales para estancias, capacidad, amenidades y disponibilidad.",
  "parameter_schema": {
    "type": "object",
    "properties": {
      "room_type": {
        "type": "string",
        "description": "Tipo de habitación específico (opcional): standard, deluxe, suite",
        "enum": ["standard", "deluxe", "suite"]
      },
      "check_in_date": {
        "type": "string",
        "description": "Fecha de entrada (opcional, formato: YYYY-MM-DD)",
        "format": "date"
      },
      "check_out_date": {
        "type": "string",
        "description": "Fecha de salida (opcional, formato: YYYY-MM-DD)",
        "format": "date"
      },
      "nights": {
        "type": "number",
        "description": "Número de noches (opcional)"
      }
    },
    "required": []
  }
}
```

**Ejemplo de uso:**
- Usuario: "¿Cuánto cuesta una habitación deluxe?"
- Respuesta: Información detallada de precios, capacidad y amenidades

**Tipos de habitaciones:**
- **Standard**: $1,500/noche - 2 personas
- **Deluxe**: $2,500/noche - 3 personas
- **Suite**: $4,500/noche - 4 personas

---

### 3. Hacer Reservación y Generar Código de Recepción

**Configuración:**
```json
{
  "use_case_id": "gen_create_reservation",
  "name": "Hacer Reservación y Generar Código de Recepción",
  "description": "Crea una reservación de habitación y genera un código alfanumérico para el check-in en recepción",
  "tool_name": "crear_reservacion",
  "tool_description": "Crea una reservación de habitación en el hotel. Requiere datos del huésped, tipo de habitación, fechas de entrada y salida. Genera un código alfanumérico único (formato REC-XXXX-YYYY) que el huésped debe presentar en recepción al llegar para agilizar el check-in. Opcionalmente puede aplicar una promoción si se proporciona el ID de promoción.",
  "parameter_schema": {
    "type": "object",
    "properties": {
      "guest_name": {
        "type": "string",
        "description": "Nombre completo del huésped"
      },
      "guest_email": {
        "type": "string",
        "description": "Email del huésped",
        "format": "email"
      },
      "guest_phone": {
        "type": "string",
        "description": "Teléfono del huésped"
      },
      "room_type": {
        "type": "string",
        "description": "Tipo de habitación: standard, deluxe, suite",
        "enum": ["standard", "deluxe", "suite"]
      },
      "check_in_date": {
        "type": "string",
        "description": "Fecha de entrada (formato: YYYY-MM-DD)",
        "format": "date"
      },
      "check_out_date": {
        "type": "string",
        "description": "Fecha de salida (formato: YYYY-MM-DD)",
        "format": "date"
      },
      "promotion_id": {
        "type": "string",
        "description": "ID de promoción a aplicar (opcional)"
      }
    },
    "required": ["guest_name", "guest_email", "guest_phone", "room_type", "check_in_date", "check_out_date"]
  }
}
```

**Ejemplo de uso:**
- Usuario: "Quiero reservar una habitación deluxe del 15 al 18 de marzo"
- Respuesta: Confirmación de reservación con ID, detalles y código de recepción

**Características:**
- Verifica disponibilidad antes de crear la reservación
- Calcula el precio total basado en las noches
- Aplica promociones si se proporciona un `promotion_id` válido
- Genera automáticamente un código alfanumérico único para recepción
- **El código de recepción siempre se incluye en la respuesta**
- Formato del código: `REC-XXXX-YYYY` (ej: REC-1000-A1B2)
- El código es único por reservación y fácil de usar en recepción

**Formato de respuesta:**
La respuesta es un JSON serializado como string que incluye:
- `message`: Mensaje de confirmación en texto (incluye el código de recepción)
- `reservation`: Detalles completos de la reservación
- `reception_code`: Código alfanumérico de recepción (ej: "REC-1000-A1B2")
- `reception_code_format`: Formato del código ("alphanumeric")

El frontend puede parsear el JSON y mostrar el código de recepción al usuario. El código debe presentarse en recepción al llegar al hotel.

---

## 🔧 Cómo Registrar en el Sistema

1. **Copia la configuración** de cada caso de uso desde `use-cases-config.json`

2. **En el frontend**, crea cada caso de uso genérico con:
   - El `use_case_id` especificado
   - El `parameter_schema` completo
   - El `tool_name` y `tool_description`
   - Asocia el webhook verificado

3. **Asegúrate** de que el `use_case_id` contenga las palabras clave:
   - Para promociones: debe contener `promocion`, `promotion`, `descuento`
   - Para precios: debe contener `precio`, `costo`, `price`, `room`
   - Para reservaciones: debe contener `reservar`, `reservation`, `book`

4. **Asocia los casos de uso** a los agentes que los necesiten

---

## 🧪 Pruebas

### Consultar Promociones
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

### Consultar Precios
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

### Crear Reservación
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

---

### 4. Consultar Directorio Telefónico

**Configuración:**
```json
{
  "use_case_id": "gen_get_phone_directory",
  "name": "Consultar Directorio Telefónico",
  "description": "Consulta el directorio telefónico de diferentes áreas del hotel",
  "tool_name": "consultar_directorio_telefonico",
  "tool_description": "Consulta el directorio telefónico del hotel. Permite buscar contactos por área, por nombre, por extensión telefónica, o ver todo el directorio completo.",
  "parameter_schema": {
    "type": "object",
    "properties": {
      "area": {
        "type": "string",
        "description": "Área del hotel (opcional): recepción, piscina, cocina, spa, etc."
      },
      "name": {
        "type": "string",
        "description": "Nombre del contacto a buscar (opcional)"
      },
      "extension": {
        "type": "string",
        "description": "Número de extensión telefónica (opcional)"
      },
      "all": {
        "type": "boolean",
        "description": "Si es true, devuelve todo el directorio (opcional)"
      }
    },
    "required": []
  }
}
```

**Ejemplo de uso:**
- Usuario: "¿Cuál es el teléfono de recepción?"
- Usuario: "Necesito contactar con el spa"
- Usuario: "¿Quién tiene la extensión 301?"
- Usuario: "Muéstrame todo el directorio telefónico"
- Respuesta: Información de contacto con teléfono, extensión, email y horarios

**Áreas disponibles:**
- **Recepción**: Contactos de recepción y front desk
- **Piscina**: Supervisores y lifeguards
- **Cocina**: Chef ejecutivo y personal de cocina
- **Servicio a Habitaciones**: Room service
- **Spa**: Directora y terapeutas
- **Mantenimiento**: Jefe de mantenimiento
- **Seguridad**: Departamento de seguridad
- **Conserjería**: Concierge
- **Lavandería**: Departamento de lavandería

**Características:**
- Búsqueda por área del hotel
- Búsqueda por nombre de contacto
- Búsqueda por extensión telefónica
- Ver todo el directorio completo
- Información detallada: teléfono, extensión, email, horarios

**Formato de respuesta:**
La respuesta es un string formateado que incluye:
- Área del contacto
- Nombre y cargo
- Teléfono y extensión
- Email
- Horario de atención

**Ejemplo de respuesta:**
```
📞 Directorio - Recepción

👤 María González - Recepcionista Principal
   📞 Teléfono: +52 55 1111 2222 (Ext. 101)
   📧 Email: recepcion@hotel.com
   ⏰ Horario: Lunes a Domingo: 24 horas
```

---

## 📚 Archivos de Referencia

- `use-cases-config.json`: Configuración completa de todos los casos de uso
- `server.js`: Implementación de los servicios (PromotionsService, RoomsService, ReservationsService, PhoneDirectoryService)
- `README.md`: Documentación general del proyecto

---

## 💡 Notas Importantes

1. **Código de Recepción**: El código alfanumérico se genera automáticamente al crear una reservación. Tiene el formato REC-XXXX-YYYY y debe presentarse en recepción para agilizar el check-in.

2. **Promociones**: Las promociones se validan automáticamente por fechas de vigencia y tipos de habitación aplicables.

3. **Disponibilidad**: El sistema verifica disponibilidad antes de crear una reservación. Si no hay habitaciones disponibles, la reservación no se crea.

4. **Precios**: Los precios se calculan automáticamente basándose en el número de noches y se pueden aplicar descuentos de promociones.

5. **Formato de fechas**: Todas las fechas deben estar en formato `YYYY-MM-DD` (ISO 8601).
