/**
 * Caso de Uso: Consultar Reservaciones
 * Responsabilidad única: Ejecutar la lógica de negocio para consultar reservaciones
 * Principio SOLID: Single Responsibility Principle (SRP)
 * Dependencias inyectadas: ReservationsService (Dependency Inversion Principle)
 */
class GetReservationsUseCase {
  constructor(reservationsService, logger) {
    this.reservationsService = reservationsService;
    this.logger = logger;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} args - Argumentos del caso de uso
   * @returns {Promise<string>} Respuesta en formato JSON string
   */
  async execute(args) {
    this.logger.info('Ejecutando caso de uso: Consultar Reservaciones');

    // Extraer argumentos
    const reservationId = args.reservation_id || args.reservationId || null;
    const limit = args.limit || args.limite || 10;
    const guestEmail = args.guest_email || args.guestEmail || args.email || null;
    const status = args.status || null;

    try {
      // Si se proporciona un ID específico, consultar esa reservación
      if (reservationId) {
        this.logger.info(`Consultando reservación específica: ${reservationId}`);
        const result = await this.reservationsService.getReservation(reservationId);

        if (!result.success) {
          return JSON.stringify({
            success: false,
            message: result.message,
            reservation: null
          });
        }

        const response = {
          success: true,
          message: `Reservación ${reservationId} encontrada`,
          reservation: result.reservation,
          total: 1
        };

        this.logger.success(`Reservación encontrada: ${reservationId}`);
        return JSON.stringify(response);
      }

      // Si se proporciona un email, buscar por email
      if (guestEmail) {
        this.logger.info(`Buscando reservaciones por email: ${guestEmail}`);
        const allReservations = await this.reservationsService.getAllReservations();
        const filtered = allReservations.filter(r => 
          r.guest_email && r.guest_email.toLowerCase() === guestEmail.toLowerCase()
        );

        if (filtered.length === 0) {
          return JSON.stringify({
            success: false,
            message: `No se encontraron reservaciones para el email: ${guestEmail}`,
            reservations: [],
            total: 0
          });
        }

        const response = {
          success: true,
          message: `Se encontraron ${filtered.length} reservación(es) para ${guestEmail}`,
          reservations: filtered,
          total: filtered.length
        };

        this.logger.success(`Encontradas ${filtered.length} reservaciones para ${guestEmail}`);
        return JSON.stringify(response);
      }

      // Listar reservaciones (con filtro de status si se proporciona)
      this.logger.info(`Listando reservaciones (límite: ${limit}, status: ${status || 'todos'})`);
      const allReservations = await this.reservationsService.getAllReservations();
      
      let filtered = allReservations;
      if (status) {
        filtered = allReservations.filter(r => r.status === status);
      }

      // Aplicar límite
      const limited = filtered.slice(0, parseInt(limit));

      let responseMessage = `Reservaciones encontradas: ${limited.length}`;
      if (status) {
        responseMessage += ` (filtradas por status: ${status})`;
      }
      if (filtered.length > limited.length) {
        responseMessage += ` (mostrando ${limited.length} de ${filtered.length} totales)`;
      }

      const response = {
        success: true,
        message: responseMessage,
        reservations: limited,
        total: filtered.length,
        showing: limited.length,
        filters: {
          limit: parseInt(limit),
          status: status || null
        }
      };

      this.logger.success(`Listadas ${limited.length} reservaciones`);
      return JSON.stringify(response);

    } catch (error) {
      this.logger.error(`Error consultando reservaciones: ${error.message}`);
      return JSON.stringify({
        success: false,
        message: `Error al consultar reservaciones: ${error.message}`,
        reservations: [],
        total: 0
      });
    }
  }

  /**
   * Obtener nombre del caso de uso
   * @returns {string}
   */
  getName() {
    return 'Consultar Reservaciones';
  }
}

module.exports = GetReservationsUseCase;

