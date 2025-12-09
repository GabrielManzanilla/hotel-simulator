/**
 * Caso de Uso: Consultar Costos de Habitaciones
 * Responsabilidad única: Ejecutar la lógica de negocio para consultar precios
 * Principio SOLID: Single Responsibility Principle (SRP)
 * Dependencias inyectadas: RoomsService (Dependency Inversion Principle)
 */
class GetRoomPricesUseCase {
  constructor(roomsService, logger) {
    this.roomsService = roomsService;
    this.logger = logger;
  }

  /**
   * Ejecutar el caso de uso
   * @param {Object} args - Argumentos del caso de uso
   * @returns {Promise<string>} Respuesta formateada
   */
  async execute(args) {
    this.logger.info('Ejecutando caso de uso: Consultar Costos de Habitaciones');
    
    const roomType = args?.room_type || args?.tipo_habitacion || null;
    const checkInDate = args?.check_in_date || args?.fecha_entrada || null;
    const checkOutDate = args?.check_out_date || args?.fecha_salida || null;
    
    let nights = null;
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    } else if (args?.nights || args?.noches) {
      nights = parseInt(args.nights || args.noches);
    }
    
    this.logger.info(`Parámetros: roomType=${roomType}, checkInDate=${checkInDate}, checkOutDate=${checkOutDate}, nights=${nights}`);
    
    const result = await this.roomsService.getRoomPrices(roomType, checkInDate, checkOutDate, nights);
    
    if (result.total === 0) {
      return roomType 
        ? `No se encontraron habitaciones del tipo "${roomType}".`
        : 'No hay habitaciones disponibles.';
    }

    const roomsList = result.rooms.map(r => {
      let priceInfo = `Precio por noche: $${r.base_price_per_night.toFixed(2)}`;
      if (r.nights && r.total_price) {
        priceInfo = `Precio por noche: $${r.base_price_per_night.toFixed(2)} | Total (${r.nights} noches): $${r.total_price.toFixed(2)}`;
      }
      return `- ${r.name} (${r.type}): ${r.description}. ${priceInfo}. Capacidad: ${r.max_occupancy} personas. Disponibles: ${r.available_count}`;
    }).join('\n');
    
    const response = `Habitaciones disponibles (${result.total}):\n${roomsList}`;
    
    this.logger.success(`Habitaciones encontradas: ${result.total}`);
    
    return response;
  }

  /**
   * Obtener el nombre del caso de uso
   * @returns {string} Nombre del caso de uso
   */
  getName() {
    return 'Consultar Costos de Habitaciones';
  }
}

module.exports = GetRoomPricesUseCase;

