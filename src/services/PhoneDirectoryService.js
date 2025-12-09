/**
 * Servicio de Directorio Telefónico
 * Responsabilidad única: Gestionar el directorio telefónico de diferentes áreas del hotel
 * Principio SOLID: Single Responsibility Principle (SRP)
 * Dependencias inyectadas: Database (Dependency Inversion Principle)
 */
class PhoneDirectoryService {
  constructor(database) {
    this.db = database;
  }

  /**
   * Obtener directorio por área específica
   * @param {string} area - Área del hotel (recepcion, piscina, cocina, etc.)
   * @returns {Object} Resultado con contactos del área
   */
  async getDirectoryByArea(area) {
    const areaLower = (area || '').toLowerCase().trim();
    
    // Mapeo de sinónimos y variaciones
    const areaMap = {
      'recepcion': 'recepcion',
      'recepción': 'recepcion',
      'reception': 'recepcion',
      'front desk': 'recepcion',
      'piscina': 'piscina',
      'pool': 'piscina',
      'alberca': 'piscina',
      'cocina': 'cocina',
      'kitchen': 'cocina',
      'chef': 'cocina',
      'room service': 'room_service',
      'servicio a habitaciones': 'room_service',
      'servicio habitaciones': 'room_service',
      'spa': 'spa',
      'mantenimiento': 'mantenimiento',
      'maintenance': 'mantenimiento',
      'seguridad': 'seguridad',
      'security': 'seguridad',
      'conserjeria': 'conserjeria',
      'concierge': 'conserjeria',
      'lavanderia': 'lavanderia',
      'laundry': 'lavanderia',
      'lavandería': 'lavanderia'
    };

    const normalizedArea = areaMap[areaLower] || areaLower;

    const contacts = await this.db.all(
      `SELECT * FROM phone_directory WHERE area = ?`,
      [normalizedArea]
    );

    if (contacts.length === 0) {
      const availableAreas = await this.getAvailableAreas();
      return {
        success: false,
        message: `Área "${area}" no encontrada en el directorio`,
        available_areas: availableAreas
      };
    }

    return {
      success: true,
      area: normalizedArea,
      contacts: contacts,
      total: contacts.length
    };
  }

  /**
   * Obtener todo el directorio
   * @returns {Object} Directorio completo
   */
  async getAllDirectory() {
    const contacts = await this.db.all(`SELECT * FROM phone_directory ORDER BY area, name`);
    
    // Agrupar por área
    const directory = {};
    for (const contact of contacts) {
      if (!directory[contact.area]) {
        directory[contact.area] = [];
      }
      directory[contact.area].push({
        name: contact.name,
        position: contact.position,
        phone: contact.phone,
        extension: contact.extension,
        email: contact.email,
        schedule: contact.schedule
      });
    }

    return {
      success: true,
      total_areas: Object.keys(directory).length,
      directory: directory
    };
  }

  /**
   * Buscar contacto por nombre
   * @param {string} name - Nombre a buscar
   * @returns {Object} Resultado con contactos encontrados
   */
  async searchContactByName(name) {
    const nameLower = `%${(name || '').toLowerCase()}%`;
    const contacts = await this.db.all(
      `SELECT * FROM phone_directory WHERE LOWER(name) LIKE ?`,
      [nameLower]
    );

    const results = contacts.map(contact => ({
      name: contact.name,
      position: contact.position,
      phone: contact.phone,
      extension: contact.extension,
      email: contact.email,
      schedule: contact.schedule,
      area: contact.area
    }));

    return {
      success: results.length > 0,
      total: results.length,
      contacts: results,
      message: results.length === 0 ? `No se encontraron contactos con el nombre "${name}"` : null
    };
  }

  /**
   * Obtener lista de áreas disponibles
   * @returns {Array<string>} Lista de áreas
   */
  async getAvailableAreas() {
    const rows = await this.db.all(
      `SELECT DISTINCT area FROM phone_directory ORDER BY area`
    );
    return rows.map(row => row.area);
  }

  /**
   * Obtener contacto por extensión
   * @param {string} extension - Número de extensión
   * @returns {Object} Contacto encontrado o null
   */
  async getContactByExtension(extension) {
    const contact = await this.db.get(
      `SELECT * FROM phone_directory WHERE extension = ?`,
      [extension]
    );

    if (!contact) {
      return {
        success: false,
        message: `No se encontró contacto con extensión "${extension}"`
      };
    }

    return {
      success: true,
      contact: {
        name: contact.name,
        position: contact.position,
        phone: contact.phone,
        extension: contact.extension,
        email: contact.email,
        schedule: contact.schedule,
        area: contact.area
      }
    };
  }
}

module.exports = PhoneDirectoryService;
