/**
 * Controlador de Webhooks
 * Responsabilidad única: Manejar requests HTTP de webhooks
 * Principio SOLID: Single Responsibility Principle (SRP)
 * Dependencias inyectadas: UseCaseRouter (Dependency Inversion Principle)
 */
class WebhookController {
  constructor(useCaseRouter, logger) {
    this.useCaseRouter = useCaseRouter;
    this.logger = logger;
  }

  /**
   * Manejar verificación de webhook
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  handleWebhookVerification(req, res) {
    const { challenge } = req.body;
    
    this.logger.info('Procesando verificación de webhook');
    
    if (!challenge) {
      this.logger.error('Challenge faltante en verificación de webhook');
      return res.status(400).json({ 
        error: 'Missing challenge field in request body' 
      });
    }
    
    const response = { challenge };
    
    this.logger.success('Verificación de webhook exitosa');
    return res.json(response);
  }

  /**
   * Manejar invocación de caso de uso genérico
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async handleGenericUseCase(req, res) {
    const metadata = req.body.metadata;
    const useCaseArgs = req.body.arguments;
    
    this.logger.info('Procesando invocación de caso de uso genérico');
    
    const useCaseId = metadata?.use_case_id;
    
    if (!useCaseId) {
      this.logger.error('use_case_id faltante en metadata');
      return res.status(400).json({
        error: 'Missing use_case_id in metadata'
      });
    }
    
    try {
      // Ejecutar caso de uso a través del router
      const response = await this.useCaseRouter.execute(useCaseId, useCaseArgs, metadata);
      
      // Asegurar que la respuesta sea string
      const finalResponse = typeof response !== 'string' 
        ? JSON.stringify(response) 
        : response;
      
      this.logger.success('Caso de uso ejecutado exitosamente');
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(finalResponse);
    } catch (error) {
      this.logger.error('Error procesando caso de uso:', error);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(500).send(`Error: ${error.message}`);
    }
  }

  /**
   * Manejar request de webhook (método principal)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async handleWebhook(req, res) {
    try {
      // Log del request HTTP
      this.logger.httpRequest(req);
      
      const { type } = req.body;
      const metadata = req.body.metadata;
      const useCaseArgs = req.body.arguments;
      
      // Manejar verificación de webhook
      if (type === 'webhook_verification') {
        return this.handleWebhookVerification(req, res);
      }
      
      // Manejar invocación de caso de uso genérico
      if (metadata && useCaseArgs !== undefined) {
        return await this.handleGenericUseCase(req, res);
      }
      
      // Formato desconocido
      this.logger.warn('Webhook recibido con formato desconocido', {
        bodyKeys: Object.keys(req.body)
      });
      
      return res.status(400).json({
        error: 'Unknown webhook format',
        received_body_keys: Object.keys(req.body),
        supported_formats: [
          'webhook_verification: { type: "webhook_verification", challenge: "..." }',
          'generic_use_case: { metadata: {...}, arguments: {...} }'
        ]
      });
      
    } catch (error) {
      this.logger.error('Error procesando webhook:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

module.exports = WebhookController;

