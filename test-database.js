/**
 * Script de prueba para verificar el funcionamiento de la base de datos
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Iniciando pruebas de la base de datos...\n');

  // Test 1: Health check
  console.log('1️⃣  Probando endpoint de salud...');
  try {
    const health = await makeRequest('/health');
    console.log(`   ✅ Status: ${health.status}`);
    console.log(`   ✅ Use Cases: ${health.data.use_cases?.length || 0} registrados\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 2: Estado de servicios
  console.log('2️⃣  Probando estado de servicios...');
  try {
    const status = await makeRequest('/services/status');
    console.log(`   ✅ Status: ${status.status}`);
    console.log(`   ✅ Promociones: ${status.data.promotions?.total || 0}`);
    console.log(`   ✅ Habitaciones: ${status.data.rooms?.total || 0}`);
    console.log(`   ✅ Reservaciones: ${status.data.reservations?.total || 0}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 3: Consultar promociones
  console.log('3️⃣  Probando caso de uso: Consultar Promociones...');
  try {
    const response = await makeRequest('/webhook', {
      metadata: {
        use_case_id: 'gen_get_promotions',
        agent_id: 'test_agent'
      },
      arguments: {}
    });
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Respuesta: ${response.data.substring(0, 100)}...\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 4: Consultar precios de habitaciones
  console.log('4️⃣  Probando caso de uso: Consultar Precios de Habitaciones...');
  try {
    const response = await makeRequest('/webhook', {
      metadata: {
        use_case_id: 'gen_get_room_prices',
        agent_id: 'test_agent'
      },
      arguments: {
        room_type: 'deluxe'
      }
    });
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Respuesta: ${response.data.substring(0, 100)}...\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 5: Consultar directorio telefónico
  console.log('5️⃣  Probando caso de uso: Consultar Directorio Telefónico...');
  try {
    const response = await makeRequest('/webhook', {
      metadata: {
        use_case_id: 'gen_directorio_telef_nico_1764314627615',
        agent_id: 'test_agent'
      },
      arguments: {
        area: 'recepción'
      }
    });
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Respuesta: ${response.data.substring(0, 100)}...\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 6: Crear reservación
  console.log('6️⃣  Probando caso de uso: Crear Reservación...');
  try {
    const response = await makeRequest('/webhook', {
      metadata: {
        use_case_id: 'gen_create_reservation',
        agent_id: 'test_agent'
      },
      arguments: {
        guest_name: 'Juan Pérez',
        guest_email: 'juan@example.com',
        guest_phone: '+52 55 1234 5678',
        room_type: 'standard',
        check_in_date: '2025-03-15',
        check_out_date: '2025-03-18'
      }
    });
    console.log(`   ✅ Status: ${response.status}`);
    // La respuesta puede ser string JSON o ya parseado
    let parsed;
    if (typeof response.data === 'string') {
      try {
        parsed = JSON.parse(response.data);
      } catch (e) {
        parsed = { message: response.data };
      }
    } else {
      parsed = response.data;
    }
    console.log(`   ✅ Reservación ID: ${parsed.reservation?.reservation_id || 'N/A'}`);
    console.log(`   ✅ Código de Recepción: ${parsed.reception_code || 'N/A'}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 7: Verificar que la reservación se guardó en BD
  console.log('7️⃣  Verificando que la reservación se guardó en la base de datos...');
  try {
    const status = await makeRequest('/services/status');
    console.log(`   ✅ Total de reservaciones: ${status.data.reservations?.total || 0}`);
    if (status.data.reservations?.recent?.length > 0) {
      console.log(`   ✅ Última reservación: ${status.data.reservations.recent[0].reservation_id}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('🏁 Pruebas completadas');
  console.log('='.repeat(80));
}

runTests().catch(console.error);

