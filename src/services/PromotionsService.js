/**
 * Servicio de Promociones
 * Responsabilidad única: Gestionar promociones del hotel
 * Principio SOLID: Single Responsibility Principle (SRP)
 * Dependencias inyectadas: Database (Dependency Inversion Principle)
 */
class PromotionsService {
  constructor(database) {
    this.db = database;
  }

  /**
   * Consultar promociones disponibles
   * @param {string|null} roomType - Tipo de habitación para filtrar
   * @param {string|null} checkInDate - Fecha de entrada para validar vigencia
   * @returns {Object} Resultado con promociones disponibles
   */
  async getAvailablePromotions(roomType = null, checkInDate = null) {
    const now = new Date();
    const nowStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    let sql = `
      SELECT DISTINCT p.*, 
             GROUP_CONCAT(prt.room_type) as applicable_room_types
      FROM promotions p
      LEFT JOIN promotion_room_types prt ON p.id = prt.promotion_id
      WHERE p.is_active = 1
        AND p.valid_from <= ?
        AND p.valid_until >= ?
    `;
    const params = [nowStr, nowStr];

    if (roomType) {
      sql += ` AND EXISTS (
        SELECT 1 FROM promotion_room_types prt2 
        WHERE prt2.promotion_id = p.id AND prt2.room_type = ?
      )`;
      params.push(roomType);
    }

    sql += ` GROUP BY p.id`;

    const rows = await this.db.all(sql, params);

    const promotions = rows.map(row => {
      const applicableRoomTypes = row.applicable_room_types 
        ? row.applicable_room_types.split(',')
        : [];

      return {
        id: row.id,
        name: row.name,
        description: row.description,
        discount_percentage: row.discount_percentage,
        valid_from: row.valid_from,
        valid_until: row.valid_until,
        applicable_room_types: applicableRoomTypes,
        min_nights: row.min_nights || null
      };
    });

    return {
      success: true,
      total: promotions.length,
      promotions: promotions
    };
  }

  /**
   * Obtener una promoción específica
   * @param {string} promotionId - ID de la promoción
   * @returns {Object} Resultado con la promoción o error
   */
  async getPromotion(promotionId) {
    const promotion = await this.db.get(
      `SELECT * FROM promotions WHERE id = ?`,
      [promotionId]
    );

    if (!promotion) {
      return {
        success: false,
        message: `Promoción ${promotionId} no encontrada`
      };
    }

    // Obtener tipos de habitación aplicables
    const roomTypes = await this.db.all(
      `SELECT room_type FROM promotion_room_types WHERE promotion_id = ?`,
      [promotionId]
    );

    const applicableRoomTypes = roomTypes.map(rt => rt.room_type);

    return {
      success: true,
      promotion: {
        id: promotion.id,
        name: promotion.name,
        description: promotion.description,
        discount_percentage: promotion.discount_percentage,
        valid_from: promotion.valid_from,
        valid_until: promotion.valid_until,
        applicable_room_types: applicableRoomTypes,
        min_nights: promotion.min_nights || null,
        is_active: promotion.is_active === 1
      }
    };
  }

  /**
   * Obtener todas las promociones (para estado del sistema)
   * @returns {Array} Lista de todas las promociones
   */
  async getAllPromotions() {
    const rows = await this.db.all(`
      SELECT p.*, 
             GROUP_CONCAT(prt.room_type) as applicable_room_types
      FROM promotions p
      LEFT JOIN promotion_room_types prt ON p.id = prt.promotion_id
      GROUP BY p.id
    `);

    return rows.map(row => {
      const applicableRoomTypes = row.applicable_room_types 
        ? row.applicable_room_types.split(',')
        : [];

      return {
        id: row.id,
        name: row.name,
        description: row.description,
        discount_percentage: row.discount_percentage,
        valid_from: row.valid_from,
        valid_until: row.valid_until,
        applicable_room_types: applicableRoomTypes,
        min_nights: row.min_nights || null,
        is_active: row.is_active === 1
      };
    });
  }
}

module.exports = PromotionsService;
