/**
 * Módulo de Base de Datos SQLite
 * Responsabilidad única: Gestionar la conexión y operaciones de base de datos
 * Principio SOLID: Single Responsibility Principle (SRP)
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor(dbPath = null) {
    this.dbPath = dbPath || path.join(__dirname, '../../data/hotel.db');
    this.db = null;
  }

  /**
   * Conectar a la base de datos
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      // Crear directorio data si no existe
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Conectado a la base de datos SQLite');
          resolve();
        }
      });
    });
  }

  /**
   * Cerrar conexión a la base de datos
   * @returns {Promise<void>}
   */
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✅ Conexión a la base de datos cerrada');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Ejecutar una consulta SQL
   * @param {string} sql - Consulta SQL
   * @param {Array} params - Parámetros de la consulta
   * @returns {Promise<any>}
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Obtener una fila
   * @param {string} sql - Consulta SQL
   * @param {Array} params - Parámetros de la consulta
   * @returns {Promise<Object|null>}
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Obtener múltiples filas
   * @param {string} sql - Consulta SQL
   * @param {Array} params - Parámetros de la consulta
   * @returns {Promise<Array>}
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Ejecutar múltiples consultas en una transacción
   * @param {Array<{sql: string, params: Array}>} queries - Array de consultas
   * @returns {Promise<void>}
   */
  async transaction(queries) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        queries.forEach((query, index) => {
          this.db.run(query.sql, query.params, (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              reject(err);
            } else if (index === queries.length - 1) {
              this.db.run('COMMIT', (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            }
          });
        });
      });
    });
  }

  /**
   * Obtener la instancia de la base de datos
   * @returns {sqlite3.Database}
   */
  getDB() {
    return this.db;
  }
}

module.exports = Database;

