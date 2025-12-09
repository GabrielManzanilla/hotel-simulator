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
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        discount_percentage REAL NOT NULL,
        valid_from TEXT NOT NULL,
        valid_until TEXT NOT NULL,
        min_nights INTEGER,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de tipos de habitación aplicables a promociones (relación muchos a muchos)
      `CREATE TABLE IF NOT EXISTS promotion_room_types (
        promotion_id TEXT NOT NULL,
        room_type TEXT NOT NULL,
        PRIMARY KEY (promotion_id, room_type),
        FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE
      )`,

      // Tabla de habitaciones
      `CREATE TABLE IF NOT EXISTS rooms (
        room_id TEXT PRIMARY KEY,
        type TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        base_price_per_night REAL NOT NULL,
        max_occupancy INTEGER NOT NULL,
        available_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de amenidades de habitaciones (relación muchos a muchos)
      `CREATE TABLE IF NOT EXISTS room_amenities (
        room_id TEXT NOT NULL,
        amenity TEXT NOT NULL,
        PRIMARY KEY (room_id, amenity),
        FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
      )`,

      // Tabla de reservaciones
      `CREATE TABLE IF NOT EXISTS reservations (
        reservation_id TEXT PRIMARY KEY,
        guest_name TEXT NOT NULL,
        guest_email TEXT NOT NULL,
        guest_phone TEXT NOT NULL,
        room_type TEXT NOT NULL,
        room_name TEXT NOT NULL,
        check_in_date TEXT NOT NULL,
        check_out_date TEXT NOT NULL,
        nights INTEGER NOT NULL,
        base_price REAL NOT NULL,
        discount REAL DEFAULT 0,
        total_price REAL NOT NULL,
        promotion_id TEXT,
        status TEXT DEFAULT 'confirmed',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_type) REFERENCES rooms(type),
        FOREIGN KEY (promotion_id) REFERENCES promotions(id)
      )`,

      // Tabla de directorio telefónico
      `CREATE TABLE IF NOT EXISTS phone_directory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        area TEXT NOT NULL,
        name TEXT NOT NULL,
        position TEXT,
        phone TEXT,
        extension TEXT,
        email TEXT,
        schedule TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Índices para mejorar rendimiento
      `CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active)`,
      `CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(valid_from, valid_until)`,
      `CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type)`,
      `CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status)`,
      `CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date)`,
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

