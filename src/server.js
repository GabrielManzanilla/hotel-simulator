/**
 * Servidor Principal del Hotel Simulator
 * Responsabilidad única: Configurar e iniciar el servidor Express
 * Principio SOLID: 
 *   - Single Responsibility Principle (SRP)
 *   - Dependency Inversion Principle (DIP) - Inyección de dependencias
 */

const express = require('express');
const cors = require('cors');

// Importar base de datos
const Database = require('./database/database');
const Schema = require('./database/schema');
const Seed = require('./database/seed');

// Importar servicios
const PromotionsService = require('./services/PromotionsService');
const RoomsService = require('./services/RoomsService');
const ReservationsService = require('./services/ReservationsService');
const PhoneDirectoryService = require('./services/PhoneDirectoryService');

// Importar casos de uso
const GetPromotionsUseCase = require('./use-cases/GetPromotionsUseCase');
const GetRoomPricesUseCase = require('./use-cases/GetRoomPricesUseCase');
const CreateReservationUseCase = require('./use-cases/CreateReservationUseCase');
const GetReservationsUseCase = require('./use-cases/GetReservationsUseCase');
const GetPhoneDirectoryUseCase = require('./use-cases/GetPhoneDirectoryUseCase');
const UseCaseRouter = require('./use-cases/UseCaseRouter');

// Importar controladores y middleware
const WebhookController = require('./controllers/WebhookController');
const Logger = require('./middleware/Logger');

// Configurar aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// Inicialización de Base de Datos
// ============================================
let database;
let promotionsService, roomsService, reservationsService, phoneDirectoryService;

async function initializeDatabase() {
  try {
    Logger.info('Inicializando base de datos...');
    
    // Conectar a la base de datos
    database = new Database();
    await database.connect();
    
    // Crear esquema
    const schema = new Schema(database);
    await schema.createTables();
    
    // Poblar datos iniciales
    const seed = new Seed(database);
    await seed.seed();
    
    Logger.success('Base de datos inicializada correctamente');
    
    // ============================================
    // Inicialización de Servicios (Dependency Injection)
    // ============================================
    Logger.info('Inicializando servicios...');
    
    promotionsService = new PromotionsService(database);
    roomsService = new RoomsService(database);
    reservationsService = new ReservationsService(roomsService, promotionsService, database);
    phoneDirectoryService = new PhoneDirectoryService(database);
    
    Logger.success('Servicios inicializados correctamente');
    
    return true;
  } catch (error) {
    Logger.error('Error inicializando base de datos:', error);
    throw error;
  }
}

// ============================================
// Inicialización de Casos de Uso (Dependency Injection)
// ============================================
let useCases, useCaseRouter, webhookController;

function initializeUseCases() {
  Logger.info('Inicializando casos de uso...');
  
  useCases = {
    'gen_get_promotions': new GetPromotionsUseCase(promotionsService, Logger),
    'gen_get_room_prices': new GetRoomPricesUseCase(roomsService, Logger),
    'gen_create_reservation': new CreateReservationUseCase(reservationsService, Logger),
    'gen_get_reservations': new GetReservationsUseCase(reservationsService, Logger),
    'gen_consultar_reservaciones': new GetReservationsUseCase(reservationsService, Logger),
    'gen_directorio_telef_nico_1764314627615': new GetPhoneDirectoryUseCase(phoneDirectoryService, Logger),
    // Mantener compatibilidad con el ID anterior
    'gen_get_phone_directory': new GetPhoneDirectoryUseCase(phoneDirectoryService, Logger)
  };
  
  useCaseRouter = new UseCaseRouter(useCases, Logger);
  
  Logger.success(`Casos de uso registrados: ${useCaseRouter.listUseCases().join(', ')}`);
  
  // ============================================
  // Inicialización de Controladores (Dependency Injection)
  // ============================================
  Logger.info('Inicializando controladores...');
  
  webhookController = new WebhookController(useCaseRouter, Logger);
  
  Logger.success('Controladores inicializados correctamente');
}

// ============================================
// Rutas
// ============================================

// Endpoint principal de webhooks
app.post('/webhook', (req, res) => webhookController.handleWebhook(req, res));

// Endpoint health
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Hotel Webhook Simulator is running',
    use_cases: useCaseRouter.listUseCases()
  });
});

// Endpoint show info
app.get('/', (req, res) => {
  res.json({
    message: 'Hotel Webhook Simulator Backend',
    endpoints: {
      'POST /webhook': 'Recibe webhooks (verificación y casos de uso genéricos)',
      'GET /services/status': 'Estado de los servicios internos',
      'GET /health': 'Endpoint de salud',
      'GET /': 'Esta información'
    },
    supported_use_cases: useCaseRouter.listUseCases().map(id => {
      const useCase = useCases[id];
      return {
        id: id,
        name: useCase ? useCase.getName() : 'Unknown'
      };
    })
  });
});

// Endpoint para consultar estado de servicios
app.get('/services/status', async (req, res) => {
  try {
    const allPromotions = await promotionsService.getAllPromotions();
    const allRooms = await roomsService.getAllRooms();
    const allReservations = await reservationsService.getAllReservations();
    
    res.json({
      promotions: {
        total: allPromotions.length,
        active: allPromotions.filter(p => p.is_active).length,
        promotions: allPromotions.map(p => ({
          id: p.id,
          name: p.name,
          is_active: p.is_active
        }))
      },
      rooms: {
        total: allRooms.length,
        rooms: allRooms.map(r => ({
          room_id: r.room_id,
          type: r.type,
          name: r.name,
          base_price_per_night: r.base_price_per_night,
          available_count: r.available_count
        }))
      },
      reservations: {
        total: allReservations.length,
        recent: allReservations.slice(0, 5).map(r => ({
          reservation_id: r.reservation_id,
          guest_name: r.guest_name,
          room_type: r.room_type,
          check_in_date: r.check_in_date,
          total_price: r.total_price,
          status: r.status
        }))
      },
      use_cases: useCaseRouter.listUseCases()
    });
  } catch (error) {
    Logger.error('Error obteniendo estado de servicios:', error);
    res.status(500).json({ error: 'Error obteniendo estado de servicios' });
  }
});

// ============================================
// Iniciar Servidor
// ============================================
async function startServer() {
  try {
    // Inicializar base de datos y servicios
    await initializeDatabase();
    
    // Inicializar casos de uso y controladores
    initializeUseCases();
    
    // Iniciar servidor Express
    app.listen(PORT, () => {
      Logger.info('='.repeat(80));
      Logger.info('🏨 Servidor Hotel Simulator iniciado');
      Logger.info('='.repeat(80));
      console.log(`\n📡 Endpoints disponibles:`);
      console.log(`   🌐 Servidor: http://localhost:${PORT}`);
      console.log(`   📥 Webhooks: http://localhost:${PORT}/webhook`);
      console.log(`   🔧 Estado: http://localhost:${PORT}/services/status`);
      console.log(`   💚 Salud: http://localhost:${PORT}/health`);
      console.log(`   📖 Info: http://localhost:${PORT}/`);
      console.log(`\n💡 Casos de uso registrados:`);
      useCaseRouter.listUseCases().forEach(id => {
        const useCase = useCases[id];
        console.log(`   ✅ ${id}: ${useCase ? useCase.getName() : 'Unknown'}`);
      });
      console.log(`\n💾 Base de datos: SQLite (data/hotel.db)`);
      console.log(`\n${'='.repeat(80)}\n`);
    });
    
    // Manejar cierre graceful
    process.on('SIGINT', async () => {
      Logger.info('Cerrando servidor...');
      if (database) {
        await database.close();
      }
      process.exit(0);
    });
    
  } catch (error) {
    Logger.error('Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();

module.exports = app;

