/**
 * Servicio de Reservaciones
 * Responsabilidad única: Gestionar reservaciones del hotel
 * Principio SOLID: Single Responsibility Principle (SRP)
 * Dependencias inyectadas: RoomsService, PromotionsService, Database (Dependency Inversion Principle)
 */
class ReservationsService {
  constructor(roomsService, promotionsService, database) {
    this.roomsService = roomsService;
    this.promotionsService = promotionsService;
    this.db = database;
    this.nextReservationId = 1000;
  }

  /**
   * Obtener el siguiente ID de reservación
   * @returns {Promise<string>} Siguiente ID de reservación
   */
  async getNextReservationId() {
    const lastReservation = await this.db.get(
      `SELECT reservation_id FROM reservations 
       WHERE reservation_id LIKE 'RES-%' 
       ORDER BY reservation_id DESC LIMIT 1`
    );

    if (lastReservation) {
      const lastNumber = parseInt(lastReservation.reservation_id.replace('RES-', ''));
      this.nextReservationId = lastNumber + 1;
    }

    return `RES-${this.nextReservationId++}`;
  }

  /**
   * Crear reservación
   * @param {string} guestName - Nombre del huésped
   * @param {string} guestEmail - Email del huésped
   * @param {string} guestPhone - Teléfono del huésped
   * @param {string} roomType - Tipo de habitación
   * @param {string} checkInDate - Fecha de entrada
   * @param {string} checkOutDate - Fecha de salida
   * @param {string|null} promotionId - ID de promoción opcional
   * @returns {Object} Resultado de la creación de reservación
   */
  async createReservation(guestName, guestEmail, guestPhone, roomType, checkInDate, checkOutDate, promotionId = null) {
    // Verificar disponibilidad usando el servicio inyectado
    const availability = await this.roomsService.checkAvailability(roomType, checkInDate, checkOutDate);
    
    if (!availability.success || !availability.available) {
      return {
        success: false,
        message: availability.message || 'Habitación no disponible'
      };
    }

    // Calcular precio
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    const room = availability.room;
    let totalPrice = room.base_price_per_night * nights;
    let discount = 0;
    let appliedPromotion = null;

    // Aplicar promoción si existe usando el servicio inyectado
    if (promotionId) {
      const promoResult = await this.promotionsService.getPromotion(promotionId);
      if (promoResult.success) {
        const promo = promoResult.promotion;
        if (promo.applicable_room_types.includes(roomType)) {
          discount = totalPrice * (promo.discount_percentage / 100);
          totalPrice = totalPrice - discount;
          appliedPromotion = {
            id: promo.id,
            name: promo.name,
            discount_percentage: promo.discount_percentage
          };
        }
      }
    }

    // Generar ID de reservación
    const reservationId = await this.getNextReservationId();
    
    // Crear reservación en la base de datos
    await this.db.run(
      `INSERT INTO reservations (
        reservation_id, guest_name, guest_email, guest_phone, room_type, room_name,
        check_in_date, check_out_date, nights, base_price, discount, total_price,
        promotion_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reservationId, guestName, guestEmail, guestPhone, roomType, room.name,
        checkInDate, checkOutDate, nights, room.base_price_per_night * nights,
        discount, totalPrice, promotionId, 'confirmed'
      ]
    );

    // Reducir disponibilidad usando el servicio inyectado
    await this.roomsService.decreaseAvailability(roomType);

    // Obtener la reservación creada
    const reservation = await this.getReservation(reservationId);

    return {
      success: true,
      reservation: reservation.reservation
    };
  }

  /**
   * Consultar reservación por ID
   * @param {string} reservationId - ID de la reservación
   * @returns {Object} Resultado con la reservación o error
   */
  async getReservation(reservationId) {
    const row = await this.db.get(
      `SELECT * FROM reservations WHERE reservation_id = ?`,
      [reservationId]
    );
    
    if (!row) {
      return {
        success: false,
        message: `Reservación ${reservationId} no encontrada`
      };
    }

    // Obtener información de promoción si existe
    let promotion = null;
    if (row.promotion_id) {
      const promoResult = await this.promotionsService.getPromotion(row.promotion_id);
      if (promoResult.success) {
        promotion = {
          id: promoResult.promotion.id,
          name: promoResult.promotion.name,
          discount_percentage: promoResult.promotion.discount_percentage
        };
      }
    }

    return {
      success: true,
      reservation: {
        reservation_id: row.reservation_id,
        guest_name: row.guest_name,
        guest_email: row.guest_email,
        guest_phone: row.guest_phone,
        room_type: row.room_type,
        room_name: row.room_name,
        check_in_date: row.check_in_date,
        check_out_date: row.check_out_date,
        nights: row.nights,
        base_price: row.base_price,
        discount: row.discount,
        total_price: row.total_price,
        promotion: promotion,
        status: row.status,
        created_at: row.created_at
      }
    };
  }

  /**
   * Listar reservaciones
   * @param {number} limit - Límite de resultados
   * @returns {Object} Lista de reservaciones
   */
  async listReservations(limit = 10) {
    const rows = await this.db.all(
      `SELECT reservation_id, guest_name, room_type, check_in_date, check_out_date, total_price, status
       FROM reservations
       ORDER BY created_at DESC
       LIMIT ?`,
      [limit]
    );

    return {
      success: true,
      total: await this.getTotalReservations(),
      reservations: rows
    };
  }

  /**
   * Obtener total de reservaciones
   * @returns {Promise<number>} Total de reservaciones
   */
  async getTotalReservations() {
    const result = await this.db.get(`SELECT COUNT(*) as count FROM reservations`);
    return result ? result.count : 0;
  }

  /**
   * Obtener todas las reservaciones (para estado del sistema)
   * @returns {Array} Lista de todas las reservaciones
   */
  async getAllReservations() {
    const rows = await this.db.all(`SELECT * FROM reservations ORDER BY created_at DESC`);
    
    // Enriquecer con información de promoción
    const reservations = [];
    for (const row of rows) {
      let promotion = null;
      if (row.promotion_id) {
        const promoResult = await this.promotionsService.getPromotion(row.promotion_id);
        if (promoResult.success) {
          promotion = {
            id: promoResult.promotion.id,
            name: promoResult.promotion.name,
            discount_percentage: promoResult.promotion.discount_percentage
          };
        }
      }

      reservations.push({
        reservation_id: row.reservation_id,
        guest_name: row.guest_name,
        guest_email: row.guest_email,
        guest_phone: row.guest_phone,
        room_type: row.room_type,
        room_name: row.room_name,
        check_in_date: row.check_in_date,
        check_out_date: row.check_out_date,
        nights: row.nights,
        base_price: row.base_price,
        discount: row.discount,
        total_price: row.total_price,
        promotion: promotion,
        status: row.status,
        created_at: row.created_at
      });
    }

    return reservations;
  }
}

module.exports = ReservationsService;
