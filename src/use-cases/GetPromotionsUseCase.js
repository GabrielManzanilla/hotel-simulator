/**
 * Caso de Uso: Consultar Promociones Disponibles
 * Responsabilidad única: Ejecutar la lógica de negocio para consultar promociones
 * Principio SOLID: Single Responsibility Principle (SRP)
 * Dependencias inyectadas: PromotionsService (Dependency Inversion Principle)
 */
class GetPromotionsUseCase {
  constructor(promotionsService, logger) {
    this.promotionsService = promotionsService;
    this.logger = logger;
  }

  /**
   * Ejecutar el caso de uso
   * @param {Object} args - Argumentos del caso de uso
   * @returns {Promise<string>} Respuesta formateada
   */
  async execute(args) {
    this.logger.info('Ejecutando caso de uso: Consultar Promociones Disponibles');
    
    const roomType = args?.room_type || args?.tipo_habitacion || null;
    const checkInDate = args?.check_in_date || args?.fecha_entrada || null;
    
    this.logger.info(`Parámetros: roomType=${roomType}, checkInDate=${checkInDate}`);
    
    const result = await this.promotionsService.getAvailablePromotions(roomType, checkInDate);
    
    if (result.total === 0) {
      return 'No hay promociones disponibles en este momento.';
    }

    const promotionsList = result.promotions.map(p => 
      `- ${p.name}: ${p.description} (${p.discount_percentage}% descuento). Válida del ${p.valid_from} al ${p.valid_until}.`
    ).join('\n');
    
    const response = `Promociones disponibles (${result.total}):\n${promotionsList}`;
    
    this.logger.success(`Promociones encontradas: ${result.total}`);
    
    return response;
  }

  /**
   * Obtener el nombre del caso de uso
   * @returns {string} Nombre del caso de uso
   */
  getName() {
    return 'Consultar Promociones Disponibles';
  }
}

module.exports = GetPromotionsUseCase;

