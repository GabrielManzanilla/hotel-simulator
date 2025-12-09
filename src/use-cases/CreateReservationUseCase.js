/**
 * Caso de Uso: Crear Reservación y Generar Código de Recepción
 * Responsabilidad única: Ejecutar la lógica de negocio para crear reservaciones
 * Principio SOLID: Single Responsibility Principle (SRP)
 * Dependencias inyectadas: ReservationsService (Dependency Inversion Principle)
 */
class CreateReservationUseCase {
  constructor(reservationsService, logger) {
    this.reservationsService = reservationsService;
    this.logger = logger;
  }

  /**
   * Generar código alfanumérico único para recepción
   * @param {string} reservationId - ID de la reservación
   * @returns {string} Código alfanumérico de recepción
   */
  generateReceptionCode(reservationId) {
    // Generar código basado en el ID de reservación y timestamp
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const reservationNum = reservationId.replace('RES-', '').padStart(4, '0');
    // Formato: REC-XXXX-YYYY donde XXXX es el número de reserva y YYYY es timestamp
    return `REC-${reservationNum}-${timestamp}`;
  }

  /**
   * Ejecutar el caso de uso
   * @param {Object} args - Argumentos del caso de uso
   * @returns {Promise<string>} Respuesta formateada con JSON que incluye código de recepción
   */
  async execute(args) {
    this.logger.info('Ejecutando caso de uso: Crear Reservación y Generar Código de Recepción');
    
    const guestName = args?.guest_name || args?.nombre || args?.nombre_huesped;
    const guestEmail = args?.guest_email || args?.email || args?.correo;
    const guestPhone = args?.guest_phone || args?.telefono || args?.phone;
    const roomType = args?.room_type || args?.tipo_habitacion;
    const checkInDate = args?.check_in_date || args?.fecha_entrada || args?.check_in;
    const checkOutDate = args?.check_out_date || args?.fecha_salida || args?.check_out;
    const promotionId = args?.promotion_id || args?.promocion_id || null;
    
    this.logger.info(`Parámetros: guestName=${guestName}, roomType=${roomType}, checkIn=${checkInDate}, checkOut=${checkOutDate}, promotionId=${promotionId}`);
    
    if (!guestName || !guestEmail || !guestPhone || !roomType || !checkInDate || !checkOutDate) {
      const errorMsg = 'Error: Se requieren los siguientes datos: nombre del huésped, email, teléfono, tipo de habitación, fecha de entrada y fecha de salida.';
      this.logger.error(errorMsg);
      return errorMsg;
    }

    const result = await this.reservationsService.createReservation(
      guestName,
      guestEmail,
      guestPhone,
      roomType,
      checkInDate,
      checkOutDate,
      promotionId
    );
    
    if (!result.success) {
      this.logger.error(`Error al crear reservación: ${result.message}`);
      return result.message;
    }

    const reservation = result.reservation;
    
    // Generar código alfanumérico para recepción
    const receptionCode = this.generateReceptionCode(reservation.reservation_id);
    
    this.logger.info(`Código de recepción generado: ${receptionCode}`);

    let responseMessage = `Reservación confirmada exitosamente.\n`;
    responseMessage += `ID de Reservación: ${reservation.reservation_id}\n`;
    responseMessage += `Huésped: ${reservation.guest_name}\n`;
    responseMessage += `Habitación: ${reservation.room_name} (${reservation.room_type})\n`;
    responseMessage += `Check-in: ${reservation.check_in_date}\n`;
    responseMessage += `Check-out: ${reservation.check_out_date}\n`;
    responseMessage += `Noches: ${reservation.nights}\n`;
    responseMessage += `Precio total: $${reservation.total_price.toFixed(2)}\n`;
    
    if (reservation.promotion) {
      responseMessage += `Promoción aplicada: ${reservation.promotion.name} (${reservation.promotion.discount_percentage}% descuento)\n`;
    }
    
    responseMessage += `\n📋 Código de Recepción: ${receptionCode}\n`;
    responseMessage += `Presenta este código en recepción al llegar al hotel para agilizar tu check-in.`;

    const response = {
      message: responseMessage,
      reservation: {
        reservation_id: reservation.reservation_id,
        guest_name: reservation.guest_name,
        guest_email: reservation.guest_email,
        guest_phone: reservation.guest_phone,
        room_type: reservation.room_type,
        room_name: reservation.room_name,
        check_in_date: reservation.check_in_date,
        check_out_date: reservation.check_out_date,
        nights: reservation.nights,
        base_price: reservation.base_price,
        discount: reservation.discount,
        total_price: reservation.total_price,
        promotion: reservation.promotion,
        status: reservation.status
      },
      reception_code: receptionCode,
      reception_code_format: 'alphanumeric'
    };

    this.logger.success(`Reservación creada exitosamente: ${reservation.reservation_id} con código: ${receptionCode}`);
    
    return JSON.stringify(response);
  }

  /**
   * Obtener el nombre del caso de uso
   * @returns {string} Nombre del caso de uso
   */
  getName() {
    return 'Crear Reservación y Generar Código de Recepción';
  }
}

module.exports = CreateReservationUseCase;

