/**
 * Middleware de Logging
 * Responsabilidad única: Proporcionar logging estructurado y visible
 * Principio SOLID: Single Responsibility Principle (SRP)
 */
class Logger {
  /**
   * Log de información general
   * @param {string} message - Mensaje a loguear
   * @param {Object} data - Datos adicionales opcionales
   */
  static info(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ℹ️  ${message}`);
    if (data) {
      console.log('   📦 Datos:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log de éxito
   * @param {string} message - Mensaje a loguear
   * @param {Object} data - Datos adicionales opcionales
   */
  static success(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ ${message}`);
    if (data) {
      console.log('   📦 Datos:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log de advertencia
   * @param {string} message - Mensaje a loguear
   * @param {Object} data - Datos adicionales opcionales
   */
  static warn(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ⚠️  ${message}`);
    if (data) {
      console.log('   📦 Datos:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log de error
   * @param {string} message - Mensaje a loguear
   * @param {Error} error - Error opcional
   */
  static error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ ${message}`);
    if (error) {
      console.error('   🔴 Error:', error.message);
      if (error.stack) {
        console.error('   📚 Stack:', error.stack);
      }
    }
  }

  /**
   * Log de consulta a caso de uso (VISIBLE)
   * @param {string} useCaseId - ID del caso de uso
   * @param {Object} args - Argumentos del caso de uso
   * @param {Object} metadata - Metadata del caso de uso
   */
  static useCaseQuery(useCaseId, args, metadata) {
    const timestamp = new Date().toISOString();
    console.log('\n' + '='.repeat(80));
    console.log(`[${timestamp}] 🔍 CONSULTA A CASO DE USO`);
    console.log('='.repeat(80));
    console.log(`   📋 Use Case ID: "${useCaseId}"`);
    console.log(`   🤖 Agent ID: ${metadata?.agent_id || 'N/A'}`);
    console.log(`   📥 Argumentos recibidos:`);
    console.log(JSON.stringify(args, null, 6));
    console.log(`   📊 Metadata:`);
    console.log(JSON.stringify(metadata, null, 6));
    console.log('='.repeat(80) + '\n');
  }

  /**
   * Log de ejecución de caso de uso
   * @param {string} useCaseId - ID del caso de uso
   * @param {string} useCaseName - Nombre del caso de uso
   * @param {Object} result - Resultado de la ejecución
   */
  static useCaseExecution(useCaseId, useCaseName, result) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ⚙️  EJECUTANDO CASO DE USO: ${useCaseName}`);
    console.log(`   🔑 ID: ${useCaseId}`);
    console.log(`   ✅ Resultado: ${result.success ? 'Éxito' : 'Error'}`);
    if (result.message) {
      console.log(`   💬 Mensaje: ${result.message}`);
    }
  }

  /**
   * Log de respuesta de caso de uso
   * @param {string} useCaseId - ID del caso de uso
   * @param {string} response - Respuesta generada
   */
  static useCaseResponse(useCaseId, response) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 📤 RESPUESTA DEL CASO DE USO`);
    console.log(`   🔑 ID: ${useCaseId}`);
    const preview = typeof response === 'string' 
      ? response.substring(0, 200) + (response.length > 200 ? '...' : '')
      : JSON.stringify(response).substring(0, 200) + '...';
    console.log(`   📝 Preview: ${preview}`);
    console.log('='.repeat(80) + '\n');
  }

  /**
   * Log de request HTTP
   * @param {Object} req - Request object
   */
  static httpRequest(req) {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] 📥 REQUEST HTTP`);
    console.log(`   🌐 Método: ${req.method}`);
    console.log(`   🔗 URL: ${req.url}`);
    console.log(`   📋 Headers:`);
    console.log(`      Content-Type: ${req.headers['content-type'] || 'N/A'}`);
    console.log(`      X-Roddy-Timestamp: ${req.headers['x-roddy-timestamp'] || 'N/A'}`);
    console.log(`      X-Roddy-Webhook-Id: ${req.headers['x-roddy-webhook-id'] || 'N/A'}`);
    console.log(`      X-Roddy-Signature: ${req.headers['x-roddy-signature'] ? '***' + req.headers['x-roddy-signature'].slice(-8) : 'N/A'}`);
    console.log(`   📦 Body:`, JSON.stringify(req.body, null, 2));
  }
}

module.exports = Logger;

