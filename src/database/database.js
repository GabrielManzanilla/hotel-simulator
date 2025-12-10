/**
 * Módulo de Base de Datos PostgreSQL
 * Responsabilidad única: Gestionar la conexión y operaciones de base de datos
 * Principio SOLID: Single Responsibility Principle (SRP)
 */
const { Pool } = require('pg');

class Database {
  constructor(connectionConfig = null) {
    // Configuración por defecto desde variables de entorno
    this.pool = null;
    this.connectionConfig = connectionConfig || {
      connectionString: process.env.DATABASE_URL,
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'hotel_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20, // Máximo de conexiones en el pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
  }

  /**
   * Convertir placeholders de SQLite (?) a PostgreSQL ($1, $2, ...)
   * @param {string} sql - Consulta SQL con placeholders ?
   * @param {Array} params - Parámetros
   * @returns {string} SQL con placeholders de PostgreSQL
   */
  _convertPlaceholders(sql, params = []) {
    if (!params || params.length === 0) {
      return sql;
    }
    
    let paramIndex = 1;
    return sql.replace(/\?/g, () => `$${paramIndex++}`);
  }

  /**
   * Conectar a la base de datos (crear pool de conexiones)
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      this.pool = new Pool(this.connectionConfig);
      
      // Probar la conexión
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      console.log('✅ Conectado a la base de datos PostgreSQL');
    } catch (error) {
      console.error('❌ Error conectando a PostgreSQL:', error.message);
      throw error;
    }
  }

  /**
   * Cerrar conexión a la base de datos (cerrar pool)
   * @returns {Promise<void>}
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Conexión a la base de datos cerrada');
    }
  }

  /**
   * Ejecutar una consulta SQL (INSERT, UPDATE, DELETE)
   * @param {string} sql - Consulta SQL
   * @param {Array} params - Parámetros de la consulta
   * @returns {Promise<any>}
   */
  async run(sql, params = []) {
    if (!this.pool) {
      throw new Error('Base de datos no conectada. Llama a connect() primero.');
    }

    try {
      // Convertir placeholders ? a $1, $2, ...
      const pgSql = this._convertPlaceholders(sql, params);
      const result = await this.pool.query(pgSql, params);
      
      return {
        lastID: result.rows[0]?.id || result.insertId || null,
        changes: result.rowCount || 0
      };
    } catch (error) {
      console.error('Error ejecutando query:', sql, error);
      throw error;
    }
  }

  /**
   * Obtener una fila
   * @param {string} sql - Consulta SQL
   * @param {Array} params - Parámetros de la consulta
   * @returns {Promise<Object|null>}
   */
  async get(sql, params = []) {
    if (!this.pool) {
      throw new Error('Base de datos no conectada. Llama a connect() primero.');
    }

    try {
      // Convertir placeholders ? a $1, $2, ...
      const pgSql = this._convertPlaceholders(sql, params);
      const result = await this.pool.query(pgSql, params);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error ejecutando query:', sql, error);
      throw error;
    }
  }

  /**
   * Obtener múltiples filas
   * @param {string} sql - Consulta SQL
   * @param {Array} params - Parámetros de la consulta
   * @returns {Promise<Array>}
   */
  async all(sql, params = []) {
    if (!this.pool) {
      throw new Error('Base de datos no conectada. Llama a connect() primero.');
    }

    try {
      // Convertir placeholders ? a $1, $2, ...
      const pgSql = this._convertPlaceholders(sql, params);
      const result = await this.pool.query(pgSql, params);
      
      return result.rows || [];
    } catch (error) {
      console.error('Error ejecutando query:', sql, error);
      throw error;
    }
  }

  /**
   * Ejecutar múltiples consultas en una transacción
   * @param {Array<{sql: string, params: Array}>} queries - Array de consultas
   * @returns {Promise<void>}
   */
  async transaction(queries) {
    if (!this.pool) {
      throw new Error('Base de datos no conectada. Llama a connect() primero.');
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const query of queries) {
        const pgSql = this._convertPlaceholders(query.sql, query.params);
        await client.query(pgSql, query.params);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtener el pool de conexiones (para uso avanzado)
   * @returns {Pool}
   */
  getDB() {
    return this.pool;
  }
}

module.exports = Database;
