/**
 * Servicio de Habitaciones y Precios
 * Responsabilidad única: Gestionar habitaciones y sus precios
 * Principio SOLID: Single Responsibility Principle (SRP)
 * Dependencias inyectadas: Database (Dependency Inversion Principle)
 */
class RoomsService {
  constructor(database) {
    this.db = database;
  }

  /**
   * Consultar costos de habitaciones
   * @param {string|null} roomType - Tipo de habitación para filtrar
   * @param {string|null} checkInDate - Fecha de entrada
   * @param {string|null} checkOutDate - Fecha de salida
   * @param {number|null} nights - Número de noches
   * @returns {Object} Resultado con precios de habitaciones
   */
  async getRoomPrices(roomType = null, checkInDate = null, checkOutDate = null, nights = null) {
    let sql = `
      SELECT r.*, 
             STRING_AGG(ra.amenity, ',') as amenities
      FROM rooms r
      LEFT JOIN room_amenities ra ON r.room_id = ra.room_id
    `;
    const params = [];

    if (roomType) {
      sql += ` WHERE r.type = ?`;
      params.push(roomType);
    }

    sql += ` GROUP BY r.room_id, r.type, r.name, r.description, r.base_price_per_night, r.max_occupancy, r.available_count, r.created_at`;

    const rows = await this.db.all(sql, params);

    const rooms = rows.map(row => {
      const amenities = row.amenities ? row.amenities.split(',') : [];
      let totalPrice = row.base_price_per_night;
      
      if (nights) {
        totalPrice = row.base_price_per_night * nights;
      }

      return {
        room_id: row.room_id,
        type: row.type,
        name: row.name,
        description: row.description,
        base_price_per_night: parseFloat(row.base_price_per_night) || 0,
        total_price: nights ? totalPrice : null,
        nights: nights || null,
        max_occupancy: row.max_occupancy,
        amenities: amenities,
        available_count: row.available_count
      };
    });

    return {
      success: true,
      total: rooms.length,
      rooms: rooms
    };
  }

  /**
   * Verificar disponibilidad de habitación
   * @param {string} roomType - Tipo de habitación
   * @param {string} checkInDate - Fecha de entrada
   * @param {string} checkOutDate - Fecha de salida
   * @returns {Object} Resultado de disponibilidad
   */
  async checkAvailability(roomType, checkInDate, checkOutDate) {
    const room = await this.getRoomByType(roomType);
    
    if (!room) {
      return {
        success: false,
        message: `Tipo de habitación "${roomType}" no encontrado`
      };
    }

    if (room.available_count === 0) {
      return {
        success: false,
        available: false,
        message: `No hay habitaciones ${room.name} disponibles`
      };
    }

    return {
      success: true,
      available: true,
      room_type: room.type,
      room_name: room.name,
      available_count: room.available_count,
      price_per_night: room.base_price_per_night,
      room: room
    };
  }

  /**
   * Obtener habitación por tipo
   * @param {string} roomType - Tipo de habitación
   * @returns {Object|null} Habitación encontrada o null
   */
  async getRoomByType(roomType) {
    const row = await this.db.get(
      `SELECT r.*, 
              STRING_AGG(ra.amenity, ',') as amenities
       FROM rooms r
       LEFT JOIN room_amenities ra ON r.room_id = ra.room_id
       WHERE r.type = ?
       GROUP BY r.room_id, r.type, r.name, r.description, r.base_price_per_night, r.max_occupancy, r.available_count, r.created_at`,
      [roomType]
    );

    if (!row) {
      return null;
    }

    const amenities = row.amenities ? row.amenities.split(',') : [];

    return {
      room_id: row.room_id,
      type: row.type,
      name: row.name,
      description: row.description,
      base_price_per_night: parseFloat(row.base_price_per_night) || 0,
      max_occupancy: row.max_occupancy,
      amenities: amenities,
      available_count: row.available_count
    };
  }

  /**
   * Reducir disponibilidad de habitación
   * @param {string} roomType - Tipo de habitación
   * @returns {boolean} true si se redujo exitosamente
   */
  async decreaseAvailability(roomType) {
    // Obtener el valor actual
    const room = await this.db.get(
      `SELECT available_count FROM rooms WHERE type = ?`,
      [roomType]
    );

    if (!room || room.available_count <= 0) {
      return false;
    }

    // Actualizar reduciendo en 1
    const result = await this.db.run(
      `UPDATE rooms 
       SET available_count = available_count - 1
       WHERE type = ? AND available_count > 0`,
      [roomType]
    );

    return result.changes > 0;
  }

  /**
   * Obtener todas las habitaciones (para estado del sistema)
   * @returns {Array} Lista de todas las habitaciones
   */
  async getAllRooms() {
    const rows = await this.db.all(`
      SELECT r.*, 
             STRING_AGG(ra.amenity, ',') as amenities
      FROM rooms r
      LEFT JOIN room_amenities ra ON r.room_id = ra.room_id
      GROUP BY r.room_id, r.type, r.name, r.description, r.base_price_per_night, r.max_occupancy, r.available_count, r.created_at
    `);

    return rows.map(row => {
      const amenities = row.amenities ? row.amenities.split(',') : [];
      return {
        room_id: row.room_id,
        type: row.type,
        name: row.name,
        description: row.description,
        base_price_per_night: row.base_price_per_night,
        max_occupancy: row.max_occupancy,
        amenities: amenities,
        available_count: row.available_count
      };
    });
  }
}

module.exports = RoomsService;
