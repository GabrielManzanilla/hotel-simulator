/**
 * Script de prueba para el Hotel Webhook Simulator
 * Ejecuta pruebas básicas de los casos de uso
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';
const WEBHOOK_ENDPOINT = `${BASE_URL}/webhook`;

// Función helper para hacer requests
function makeRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'X-Roddy-Timestamp': new Date().toISOString(),
        'X-Roddy-Webhook-Id': 'test_webhook_id',
        'X-Roddy-Signature': 'test_signature'
      }
    };

    const req = http.request(endpoint, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          // Intentar parsear como JSON, si falla devolver como texto
          let parsed;
          try {
            parsed = JSON.parse(responseData);
          } catch (e) {
            parsed = responseData;
          }
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test 1: Verificación de webhook
async function testWebhookVerification() {
  console.log('\n🧪 Test 1: Verificación de Webhook');
  try {
    const response = await makeRequest(WEBHOOK_ENDPOINT, {
      type: 'webhook_verification',
      challenge: 'test-challenge-123'
    });
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 2: Consultar promociones
async function testGetPromotions() {
  console.log('\n🧪 Test 2: Consultar Promociones Disponibles');
  try {
    const response = await makeRequest(WEBHOOK_ENDPOINT, {
      metadata: {
        use_case_id: 'gen_get_promotions',
        agent_id: 'test_agent',
        client_id: 'test_client',
        webhook_id: 'test_webhook',
        contact_id: 'test_contact',
        channel_id: 'test_channel',
        contact: {
          name: 'Test User',
          phone: '+1234567890',
          email: 'test@example.com'
        }
      },
      arguments: {
        room_type: 'suite'
      }
    });
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 3: Consultar precios de habitaciones
async function testGetRoomPrices() {
  console.log('\n🧪 Test 3: Consultar Precios de Habitaciones');
  try {
    const response = await makeRequest(WEBHOOK_ENDPOINT, {
      metadata: {
        use_case_id: 'gen_get_room_prices',
        agent_id: 'test_agent',
        client_id: 'test_client',
        webhook_id: 'test_webhook',
        contact_id: 'test_contact',
        channel_id: 'test_channel',
        contact: {
          name: 'Test User',
          phone: '+1234567890',
          email: 'test@example.com'
        }
      },
      arguments: {
        check_in_date: '2025-03-15',
        check_out_date: '2025-03-18',
        room_type: 'deluxe'
      }
    });
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 4: Crear reservación
async function testCreateReservation() {
  console.log('\n🧪 Test 4: Crear Reservación con QR');
  try {
    const response = await makeRequest(WEBHOOK_ENDPOINT, {
      metadata: {
        use_case_id: 'gen_create_reservation',
        agent_id: 'test_agent',
        client_id: 'test_client',
        webhook_id: 'test_webhook',
        contact_id: 'test_contact',
        channel_id: 'test_channel',
        contact: {
          name: 'Juan Pérez',
          phone: '+52 55 1234 5678',
          email: 'juan@example.com'
        }
      },
      arguments: {
        guest_name: 'Juan Pérez',
        guest_email: 'juan@example.com',
        guest_phone: '+52 55 1234 5678',
        room_type: 'deluxe',
        check_in_date: '2025-03-15',
        check_out_date: '2025-03-18',
        promotion_id: 'PROM001'
      }
    });
    console.log('✅ Status:', response.status);
    
    // Intentar parsear la respuesta como JSON
    let parsedResponse;
    try {
      parsedResponse = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      
      if (parsedResponse && parsedResponse.qr_code_image) {
        console.log('✅ Response (JSON con QR):');
        console.log('   - Message:', parsedResponse.message);
        console.log('   - Reservation ID:', parsedResponse.reservation?.reservation_id);
        console.log('   - QR Code Image: [Base64 data URL -', parsedResponse.qr_code_image.substring(0, 50) + '...]');
        console.log('   - QR Code Data:', parsedResponse.qr_code_data);
        console.log('   - QR Code Format:', parsedResponse.qr_code_format);
      } else {
        console.log('✅ Response:', JSON.stringify(parsedResponse, null, 2));
      }
    } catch (e) {
      // Si no es JSON, mostrar como texto
      const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
      if (responseText.length > 500) {
        console.log('✅ Response (truncado):', responseText.substring(0, 500) + '...');
      } else {
        console.log('✅ Response:', responseText);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 5: Health check
async function testHealthCheck() {
  console.log('\n🧪 Test 5: Health Check');
  try {
    const http = require('http');
    const response = await new Promise((resolve, reject) => {
      http.get(`${BASE_URL}/health`, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      }).on('error', reject);
    });
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log('🚀 Iniciando pruebas del Hotel Webhook Simulator...\n');
  console.log('⚠️  Asegúrate de que el servidor esté ejecutándose en http://localhost:3001\n');
  
  await testHealthCheck();
  await testWebhookVerification();
  await testGetPromotions();
  await testGetRoomPrices();
  await testCreateReservation();
  
  console.log('\n✅ Todas las pruebas completadas');
}

// Ejecutar
runAllTests().catch(console.error);
