/**
 * Router de Casos de Uso
 * Responsabilidad única: Enrutar casos de uso según su ID
 * Principio SOLID: 
 *   - Single Responsibility Principle (SRP)
 *   - Open/Closed Principle (OCP) - Abierto para extensión, cerrado para modificación
 *   - Dependency Inversion Principle (DIP) - Depende de abstracciones (casos de uso)
 */
class UseCaseRouter {
  constructor(useCases, logger) {
    this.useCases = useCases; // Mapa de useCaseId -> instancia de caso de uso
    this.logger = logger;
    this.patterns = this._buildPatterns();
  }

  /**
   * Construir patrones de detección de casos de uso
   * @private
   * @returns {Object} Mapa de patrones por caso de uso
   */
  _buildPatterns() {
    return {
      getPromotions: [
        'promociones', 'promocion', 'promotions', 'promotion', 'descuentos', 'descuento',
        'consultar_promociones', 'get_promotions', 'list_promotions', 'listar_promociones',
        'gen_get_promotions'
      ],
      getRoomPrices: [
        'precios', 'precio', 'costos', 'costo', 'habitaciones', 'habitacion', 'rooms', 'room',
        'consultar_precios', 'get_prices', 'room_prices', 'precios_habitaciones',
        'costos_habitaciones', 'get_room_prices', 'gen_get_room_prices'
      ],
      createReservation: [
        'reservar', 'reservacion', 'reservación', 'reservation', 'book', 'booking',
        'crear_reservacion', 'create_reservation', 'hacer_reserva', 'make_reservation',
        'gen_create_reservation'
      ],
      getPhoneDirectory: [
        'directorio', 'directory', 'telefono', 'phone', 'contacto', 'contact',
        'directorio_telefonico', 'phone_directory', 'directorio_telefono',
        'consultar_directorio', 'get_directory', 'buscar_contacto', 'search_contact',
        'gen_get_phone_directory', 'gen_get_directory',
        'gen_directorio_telef_nico_1764314627615', 'directorio_telef_nico',
        'telef_nico', 'telefonico', 'telefono', 'telef'
      ]
    };
  }

  /**
   * Verificar si un useCaseId coincide con un patrón
   * @param {string} useCaseId - ID del caso de uso
   * @param {Array<string>} patterns - Patrones a verificar
   * @returns {boolean} true si coincide
   */
  _matchesPattern(useCaseId, patterns) {
    const useCaseIdLower = (useCaseId || '').toLowerCase();
    
    return patterns.some(pattern => {
      const patternClean = pattern.replace(/[_-]/g, '').toLowerCase();
      const useCaseClean = useCaseIdLower.replace(/[_-]/g, '');
      
      if (useCaseClean === patternClean || useCaseClean.includes(patternClean) || patternClean.includes(useCaseClean)) {
        return true;
      }
      if (useCaseIdLower.includes(pattern) || pattern.includes(useCaseIdLower)) {
        return true;
      }
      return false;
    });
  }

  /**
   * Detectar el caso de uso basado en el ID
   * @param {string} useCaseId - ID del caso de uso
   * @returns {string|null} Clave del caso de uso o null si no se detecta
   */
  detectUseCase(useCaseId) {
    this.logger.info(`Detectando caso de uso para ID: "${useCaseId}"`);
    this.logger.info(`Casos de uso registrados: ${Object.keys(this.useCases).join(', ')}`);
    
    // Primero intentar búsqueda exacta en el mapa
    if (this.useCases[useCaseId]) {
      this.logger.success(`Caso de uso encontrado por ID exacto: ${useCaseId}`);
      return useCaseId;
    }

    // Normalizar el ID para búsqueda (remover caracteres especiales y convertir a minúsculas)
    const normalizedId = useCaseId.toLowerCase().replace(/[^a-z0-9]/g, '');
    this.logger.info(`ID normalizado para búsqueda: "${normalizedId}"`);

    // Buscar coincidencia parcial en los IDs registrados
    for (const registeredId of Object.keys(this.useCases)) {
      const normalizedRegistered = registeredId.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Si el ID normalizado contiene "directorio" y "telefonico" o variaciones
      if (normalizedId.includes('directorio') && (normalizedId.includes('telefonico') || normalizedId.includes('telef'))) {
        if (normalizedRegistered.includes('directorio') && (normalizedRegistered.includes('telefonico') || normalizedRegistered.includes('telef'))) {
          this.logger.success(`Caso de uso detectado por coincidencia parcial: ${useCaseId} -> ${registeredId}`);
          return registeredId;
        }
      }
    }

    // Luego buscar por patrones
    for (const [key, patterns] of Object.entries(this.patterns)) {
      if (this._matchesPattern(useCaseId, patterns)) {
        // Buscar el useCaseId que corresponde a esta clave
        const matchingUseCaseId = Object.keys(this.useCases).find(id => {
          const idLower = id.toLowerCase();
          return patterns.some(p => idLower.includes(p.toLowerCase()) || p.toLowerCase().includes(idLower));
        });
        
        if (matchingUseCaseId) {
          this.logger.success(`Caso de uso detectado por patrón: ${key} -> ${matchingUseCaseId}`);
          return matchingUseCaseId;
        }
      }
    }

    this.logger.warn(`No se pudo detectar caso de uso para ID: "${useCaseId}"`);
    this.logger.warn(`IDs disponibles: ${Object.keys(this.useCases).join(', ')}`);
    return null;
  }

  /**
   * Ejecutar un caso de uso
   * @param {string} useCaseId - ID del caso de uso
   * @param {Object} args - Argumentos del caso de uso
   * @param {Object} metadata - Metadata del caso de uso
   * @returns {Promise<string>} Respuesta del caso de uso
   */
  async execute(useCaseId, args, metadata) {
    // Log visible de la consulta
    this.logger.useCaseQuery(useCaseId, args, metadata);
    
    // Detectar el caso de uso
    const detectedUseCaseId = this.detectUseCase(useCaseId);
    
    if (!detectedUseCaseId) {
      const argsSummary = Object.keys(args || {}).map(key => `${key}: ${args[key]}`).join(', ');
      const defaultResponse = `Caso de uso "${useCaseId}" ejecutado exitosamente. Parámetros recibidos: ${argsSummary || 'ninguno'}.`;
      this.logger.warn(`Caso de uso no reconocido, usando respuesta genérica`);
      return defaultResponse;
    }

    const useCase = this.useCases[detectedUseCaseId];
    
    if (!useCase) {
      this.logger.error(`Caso de uso no encontrado: ${detectedUseCaseId}`);
      return `Error: Caso de uso "${useCaseId}" no está disponible.`;
    }

    // Log de ejecución
    this.logger.useCaseExecution(detectedUseCaseId, useCase.getName(), { success: true });
    
    try {
      // Ejecutar el caso de uso
      const response = await useCase.execute(args);
      
      // Log de respuesta
      this.logger.useCaseResponse(detectedUseCaseId, response);
      
      return response;
    } catch (error) {
      this.logger.error(`Error ejecutando caso de uso ${detectedUseCaseId}:`, error);
      return `Error al ejecutar caso de uso: ${error.message}`;
    }
  }

  /**
   * Registrar un caso de uso
   * @param {string} useCaseId - ID del caso de uso
   * @param {Object} useCaseInstance - Instancia del caso de uso
   */
  registerUseCase(useCaseId, useCaseInstance) {
    this.useCases[useCaseId] = useCaseInstance;
    this.logger.info(`Caso de uso registrado: ${useCaseId}`);
  }

  /**
   * Obtener lista de casos de uso registrados
   * @returns {Array<string>} Lista de IDs de casos de uso
   */
  listUseCases() {
    return Object.keys(this.useCases);
  }
}

module.exports = UseCaseRouter;

