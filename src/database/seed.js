/**
 * Script de Inicialización de Datos (Seed)
 * Responsabilidad única: Poblar la base de datos con datos iniciales
 * Principio SOLID: Single Responsibility Principle (SRP)
 */
class Seed {
  constructor(database) {
    this.db = database;
  }

  /**
   * Verificar si la base de datos ya tiene datos
   * @returns {Promise<boolean>}
   */
  async hasData() {
    const promotions = await this.db.get('SELECT COUNT(*) as count FROM promotions');
    return promotions && promotions.count > 0;
  }

  /**
   * Poblar la base de datos con datos iniciales
   * @returns {Promise<void>}
   */
  async seed() {
    const hasData = await this.hasData();
    if (hasData) {
      console.log('ℹ️  La base de datos ya contiene datos, omitiendo seed');
      return;
    }

    console.log('🌱 Inicializando datos en la base de datos...');

    // Promociones
    const promotions = [
      {
        id: 'PROM001',
        name: 'Descuento de Temporada',
        description: '20% de descuento en todas las habitaciones durante el mes de marzo',
        discount_percentage: 20,
        valid_from: '2025-03-01',
        valid_until: '2025-03-31',
        min_nights: null,
        is_active: true,
        room_types: ['standard', 'deluxe', 'suite']
      },
      {
        id: 'PROM002',
        name: 'Promoción Fin de Semana',
        description: '15% de descuento en reservas de fin de semana (viernes a domingo)',
        discount_percentage: 15,
        valid_from: '2025-01-01',
        valid_until: '2025-12-31',
        min_nights: null,
        is_active: true,
        room_types: ['standard', 'deluxe']
      },
      {
        id: 'PROM003',
        name: 'Estancia Larga',
        description: '10% de descuento adicional para estancias de 5 o más noches',
        discount_percentage: 10,
        valid_from: '2025-01-01',
        valid_until: '2025-12-31',
        min_nights: 5,
        is_active: true,
        room_types: ['standard', 'deluxe', 'suite']
      },
      {
        id: 'PROM004',
        name: 'Promoción Suite Premium',
        description: '25% de descuento en suites durante temporada baja',
        discount_percentage: 25,
        valid_from: '2025-02-01',
        valid_until: '2025-04-30',
        min_nights: null,
        is_active: true,
        room_types: ['suite']
      }
    ];

    // Habitaciones
    const rooms = [
      {
        room_id: 'ROOM001',
        type: 'standard',
        name: 'Habitación Estándar',
        description: 'Habitación cómoda con cama doble, baño privado y todas las comodidades básicas',
        base_price_per_night: 1500.00,
        max_occupancy: 2,
        available_count: 15,
        amenities: ['Wi-Fi', 'TV', 'Aire acondicionado', 'Baño privado', 'Caja fuerte']
      },
      {
        room_id: 'ROOM002',
        type: 'deluxe',
        name: 'Habitación Deluxe',
        description: 'Habitación amplia con vista, cama king size, minibar y balcón',
        base_price_per_night: 2500.00,
        max_occupancy: 3,
        available_count: 8,
        amenities: ['Wi-Fi', 'TV 55"', 'Aire acondicionado', 'Baño privado', 'Minibar', 'Balcón', 'Vista']
      },
      {
        room_id: 'ROOM003',
        type: 'suite',
        name: 'Suite Premium',
        description: 'Suite de lujo con sala, dormitorio separado, jacuzzi y vista panorámica',
        base_price_per_night: 4500.00,
        max_occupancy: 4,
        available_count: 3,
        amenities: ['Wi-Fi', 'TV 65"', 'Aire acondicionado', 'Jacuzzi', 'Sala de estar', 'Balcón', 'Vista panorámica', 'Servicio de conserjería']
      }
    ];

    // Directorio telefónico
    const phoneDirectory = [
      { area: 'recepcion', name: 'María González', position: 'Recepcionista Principal', phone: '+52 55 1111 2222', extension: '101', email: 'recepcion@hotel.com', schedule: 'Lunes a Domingo: 24 horas' },
      { area: 'recepcion', name: 'Carlos Ramírez', position: 'Recepcionista', phone: '+52 55 1111 2223', extension: '102', email: 'carlos.ramirez@hotel.com', schedule: 'Lunes a Viernes: 8:00 - 16:00' },
      { area: 'piscina', name: 'Ana Martínez', position: 'Supervisora de Piscina', phone: '+52 55 2222 3333', extension: '201', email: 'piscina@hotel.com', schedule: 'Lunes a Domingo: 6:00 - 22:00' },
      { area: 'piscina', name: 'Luis Hernández', position: 'Lifeguard', phone: '+52 55 2222 3334', extension: '202', email: 'luis.hernandez@hotel.com', schedule: 'Lunes a Domingo: 10:00 - 18:00' },
      { area: 'cocina', name: 'Chef Roberto Sánchez', position: 'Chef Ejecutivo', phone: '+52 55 3333 4444', extension: '301', email: 'chef@hotel.com', schedule: 'Lunes a Domingo: 5:00 - 23:00' },
      { area: 'cocina', name: 'Sofía López', position: 'Sous Chef', phone: '+52 55 3333 4445', extension: '302', email: 'sofia.lopez@hotel.com', schedule: 'Lunes a Sábado: 6:00 - 15:00' },
      { area: 'room_service', name: 'Servicio a Habitaciones', position: 'Departamento', phone: '+52 55 4444 5555', extension: '401', email: 'roomservice@hotel.com', schedule: 'Lunes a Domingo: 6:00 - 24:00' },
      { area: 'spa', name: 'Elena Torres', position: 'Directora de Spa', phone: '+52 55 5555 6666', extension: '501', email: 'spa@hotel.com', schedule: 'Lunes a Domingo: 8:00 - 20:00' },
      { area: 'spa', name: 'Miguel Ángel', position: 'Terapeuta', phone: '+52 55 5555 6667', extension: '502', email: 'miguel.angel@hotel.com', schedule: 'Martes a Sábado: 9:00 - 18:00' },
      { area: 'mantenimiento', name: 'Jorge Mendoza', position: 'Jefe de Mantenimiento', phone: '+52 55 6666 7777', extension: '601', email: 'mantenimiento@hotel.com', schedule: 'Lunes a Domingo: 24 horas (emergencias)' },
      { area: 'seguridad', name: 'Seguridad', position: 'Departamento', phone: '+52 55 7777 8888', extension: '701', email: 'seguridad@hotel.com', schedule: 'Lunes a Domingo: 24 horas' },
      { area: 'conserjeria', name: 'Pedro Jiménez', position: 'Concierge', phone: '+52 55 8888 9999', extension: '801', email: 'concierge@hotel.com', schedule: 'Lunes a Domingo: 7:00 - 23:00' },
      { area: 'lavanderia', name: 'Lavandería', position: 'Departamento', phone: '+52 55 9999 0000', extension: '901', email: 'lavanderia@hotel.com', schedule: 'Lunes a Sábado: 7:00 - 19:00' }
    ];

    // Insertar promociones
    for (const promo of promotions) {
      await this.db.run(
        `INSERT INTO promotions (id, name, description, discount_percentage, valid_from, valid_until, min_nights, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [promo.id, promo.name, promo.description, promo.discount_percentage, promo.valid_from, promo.valid_until, promo.min_nights, promo.is_active]
      );

      // Insertar tipos de habitación aplicables
      for (const roomType of promo.room_types) {
        await this.db.run(
          `INSERT INTO promotion_room_types (promotion_id, room_type) VALUES (?, ?)`,
          [promo.id, roomType]
        );
      }
    }

    // Insertar habitaciones
    for (const room of rooms) {
      await this.db.run(
        `INSERT INTO rooms (room_id, type, name, description, base_price_per_night, max_occupancy, available_count)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [room.room_id, room.type, room.name, room.description, room.base_price_per_night, room.max_occupancy, room.available_count]
      );

      // Insertar amenidades
      for (const amenity of room.amenities) {
        await this.db.run(
          `INSERT INTO room_amenities (room_id, amenity) VALUES (?, ?)`,
          [room.room_id, amenity]
        );
      }
    }

    // Insertar directorio telefónico
    for (const contact of phoneDirectory) {
      await this.db.run(
        `INSERT INTO phone_directory (area, name, position, phone, extension, email, schedule)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [contact.area, contact.name, contact.position, contact.phone, contact.extension, contact.email, contact.schedule]
      );
    }

    console.log('✅ Datos iniciales insertados correctamente');
  }
}

module.exports = Seed;

