/**
 * Esquema de Base de Datos
 * Responsabilidad única: Definir y crear el esquema de la base de datos
 * Principio SOLID: Single Responsibility Principle (SRP)
 */
class Schema {
  constructor(database) {
    this.db = database;
  }

  /**
   * Crear todas las tablas
   * @returns {Promise<void>}
   */
  async createTables() {
    const queries = [
      // Tabla de promociones
      `CREATE TABLE IF NOT EXISTS promotions (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        discount_percentage DECIMAL(5,2) NOT NULL,
        valid_from DATE NOT NULL,
        valid_until DATE NOT NULL,
        min_nights INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de tipos de habitación aplicables a promociones (relación muchos a muchos)
      `CREATE TABLE IF NOT EXISTS promotion_room_types (
        promotion_id VARCHAR(50) NOT NULL,
        room_type VARCHAR(50) NOT NULL,
        PRIMARY KEY (promotion_id, room_type),
        FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE
      )`,

      // Tabla de habitaciones
      `CREATE TABLE IF NOT EXISTS rooms (
        room_id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        base_price_per_night DECIMAL(10,2) NOT NULL,
        max_occupancy INTEGER NOT NULL,
        available_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de amenidades de habitaciones (relación muchos a muchos)
      `CREATE TABLE IF NOT EXISTS room_amenities (
        room_id VARCHAR(50) NOT NULL,
        amenity VARCHAR(255) NOT NULL,
        PRIMARY KEY (room_id, amenity),
        FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
      )`,

      // Tabla de reservaciones
      `CREATE TABLE IF NOT EXISTS reservations (
        reservation_id VARCHAR(50) PRIMARY KEY,
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50) NOT NULL,
        room_type VARCHAR(50) NOT NULL,
        room_name VARCHAR(255) NOT NULL,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        nights INTEGER NOT NULL,
        base_price DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) DEFAULT 0,
        total_price DECIMAL(10,2) NOT NULL,
        promotion_id VARCHAR(50),
        status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_type) REFERENCES rooms(type),
        FOREIGN KEY (promotion_id) REFERENCES promotions(id)
      )`,

      // Tabla de directorio telefónico
      `CREATE TABLE IF NOT EXISTS phone_directory (
        id SERIAL PRIMARY KEY,
        area VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        phone VARCHAR(50),
        extension VARCHAR(20),
        email VARCHAR(255),
        schedule VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Índices para mejorar rendimiento
      `CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active)`,
      `CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(valid_from, valid_until)`,
      `CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type)`,
      `CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status)`,
      `CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date)`,
      `CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(guest_email)`,
      `CREATE INDEX IF NOT EXISTS idx_phone_directory_area ON phone_directory(area)`,
      `CREATE INDEX IF NOT EXISTS idx_phone_directory_extension ON phone_directory(extension)`
    ];

    for (const query of queries) {
      await this.db.run(query);
    }

    console.log('✅ Esquema de base de datos creado correctamente');
  }
}

module.exports = Schema;

