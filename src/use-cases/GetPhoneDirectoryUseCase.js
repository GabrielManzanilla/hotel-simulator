/**
 * Caso de Uso: Consultar Directorio Telefónico
 * Responsabilidad única: Ejecutar la lógica de negocio para consultar el directorio telefónico
 * Principio SOLID: Single Responsibility Principle (SRP)
 * Dependencias inyectadas: PhoneDirectoryService (Dependency Inversion Principle)
 */
class GetPhoneDirectoryUseCase {
  constructor(phoneDirectoryService, logger) {
    this.phoneDirectoryService = phoneDirectoryService;
    this.logger = logger;
  }

  /**
   * Ejecutar el caso de uso
   * @param {Object} args - Argumentos del caso de uso
   * @returns {Promise<string>} Respuesta formateada
   */
  async execute(args) {
    this.logger.info('Ejecutando caso de uso: Consultar Directorio Telefónico');
    
    const area = args?.area || args?.departamento || args?.department || null;
    const name = args?.name || args?.nombre || null;
    const extension = args?.extension || args?.ext || null;
    const all = args?.all || args?.todos || args?.todo || false;
    
    this.logger.info(`Parámetros: area=${area}, name=${name}, extension=${extension}, all=${all}`);
    
    // Si se solicita todo el directorio
    if (all) {
      const result = await this.phoneDirectoryService.getAllDirectory();
      
      if (!result.success) {
        return 'Error al obtener el directorio completo.';
      }

      let response = `📞 Directorio Telefónico Completo del Hotel\n\n`;
      
      for (const [areaKey, contacts] of Object.entries(result.directory)) {
        const areaName = this._formatAreaName(areaKey);
        response += `📍 ${areaName}:\n`;
        
        contacts.forEach(contact => {
          response += `   👤 ${contact.name} - ${contact.position}\n`;
          response += `      📞 Teléfono: ${contact.phone} (Ext. ${contact.extension})\n`;
          response += `      📧 Email: ${contact.email}\n`;
          response += `      ⏰ Horario: ${contact.schedule}\n\n`;
        });
      }
      
      this.logger.success(`Directorio completo obtenido: ${result.total_areas} áreas`);
      return response;
    }

    // Si se busca por extensión
    if (extension) {
      const result = await this.phoneDirectoryService.getContactByExtension(extension);
      
      if (!result.success) {
        return result.message;
      }

      const contact = result.contact;
      const areaName = this._formatAreaName(contact.area);
      
      let response = `📞 Contacto encontrado:\n\n`;
      response += `📍 Área: ${areaName}\n`;
      response += `👤 Nombre: ${contact.name}\n`;
      response += `💼 Cargo: ${contact.position}\n`;
      response += `📞 Teléfono: ${contact.phone}\n`;
      response += `🔢 Extensión: ${contact.extension}\n`;
      response += `📧 Email: ${contact.email}\n`;
      response += `⏰ Horario: ${contact.schedule}`;
      
      this.logger.success(`Contacto encontrado por extensión: ${extension}`);
      return response;
    }

    // Si se busca por nombre
    if (name) {
      const result = await this.phoneDirectoryService.searchContactByName(name);
      
      if (!result.success) {
        return result.message;
      }

      let response = `📞 Contactos encontrados (${result.total}):\n\n`;
      
      result.contacts.forEach(contact => {
        const areaName = this._formatAreaName(contact.area);
        response += `📍 ${areaName}:\n`;
        response += `   👤 ${contact.name} - ${contact.position}\n`;
        response += `   📞 Teléfono: ${contact.phone} (Ext. ${contact.extension})\n`;
        response += `   📧 Email: ${contact.email}\n`;
        response += `   ⏰ Horario: ${contact.schedule}\n\n`;
      });
      
      this.logger.success(`Contactos encontrados por nombre: ${result.total}`);
      return response;
    }

    // Si se busca por área
    if (area) {
      const result = await this.phoneDirectoryService.getDirectoryByArea(area);
      
      if (!result.success) {
        let errorMsg = result.message;
        if (result.available_areas) {
          errorMsg += `\n\nÁreas disponibles: ${result.available_areas.join(', ')}`;
        }
        return errorMsg;
      }

      const areaName = this._formatAreaName(result.area);
      let response = `📞 Directorio - ${areaName}\n\n`;
      
      result.contacts.forEach(contact => {
        response += `👤 ${contact.name} - ${contact.position}\n`;
        response += `   📞 Teléfono: ${contact.phone} (Ext. ${contact.extension})\n`;
        response += `   📧 Email: ${contact.email}\n`;
        response += `   ⏰ Horario: ${contact.schedule}\n\n`;
      });
      
      this.logger.success(`Directorio obtenido para área: ${area} (${result.total} contactos)`);
      return response;
    }

    // Si no se especifica ningún parámetro, mostrar áreas disponibles
    const availableAreas = await this.phoneDirectoryService.getAvailableAreas();
    let response = `📞 Directorio Telefónico del Hotel\n\n`;
    response += `Para consultar contactos, puedes especificar:\n`;
    response += `- Un área específica (ej: recepción, piscina, cocina)\n`;
    response += `- Un nombre de contacto\n`;
    response += `- Una extensión telefónica\n`;
    response += `- "all: true" para ver todo el directorio\n\n`;
    response += `📍 Áreas disponibles:\n`;
    availableAreas.forEach(areaKey => {
      const areaName = this._formatAreaName(areaKey);
      response += `   - ${areaName}\n`;
    });
    
    this.logger.info('Mostrando áreas disponibles');
    return response;
  }

  /**
   * Formatear nombre de área para mostrar
   * @param {string} areaKey - Clave del área
   * @returns {string} Nombre formateado
   */
  _formatAreaName(areaKey) {
    const areaNames = {
      'recepcion': 'Recepción',
      'piscina': 'Piscina',
      'cocina': 'Cocina',
      'room_service': 'Servicio a Habitaciones',
      'spa': 'Spa',
      'mantenimiento': 'Mantenimiento',
      'seguridad': 'Seguridad',
      'conserjeria': 'Conserjería',
      'lavanderia': 'Lavandería'
    };
    
    return areaNames[areaKey] || areaKey.charAt(0).toUpperCase() + areaKey.slice(1);
  }

  /**
   * Obtener el nombre del caso de uso
   * @returns {string} Nombre del caso de uso
   */
  getName() {
    return 'Consultar Directorio Telefónico';
  }
}

module.exports = GetPhoneDirectoryUseCase;

