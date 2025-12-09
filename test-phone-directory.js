/**
 * Script de prueba para el caso de uso de directorio telefónico
 */

const http = require('http');

const testCases = [
  {
    name: 'Test 1: Consultar por área (recepción)',
    data: {
      metadata: {
        use_case_id: 'gen_directorio_telef_nico_1764314627615',
        agent_id: 'test_agent'
      },
      arguments: {
        area: 'recepción'
      }
    }
  },
  {
    name: 'Test 2: Consultar todo el directorio',
    data: {
      metadata: {
        use_case_id: 'gen_directorio_telef_nico_1764314627615',
        agent_id: 'test_agent'
      },
      arguments: {
        all: true
      }
    }
  },
  {
    name: 'Test 3: Consultar por extensión',
    data: {
      metadata: {
        use_case_id: 'gen_directorio_telef_nico_1764314627615',
        agent_id: 'test_agent'
      },
      arguments: {
        extension: '101'
      }
    }
  },
  {
    name: 'Test 4: Consultar por nombre',
    data: {
      metadata: {
        use_case_id: 'gen_directorio_telef_nico_1764314627615',
        agent_id: 'test_agent'
      },
      arguments: {
        name: 'María'
      }
    }
  },
  {
    name: 'Test 5: Sin parámetros (debe mostrar áreas disponibles)',
    data: {
      metadata: {
        use_case_id: 'gen_directorio_telef_nico_1764314627615',
        agent_id: 'test_agent'
      },
      arguments: {}
    }
  }
];

function makeRequest(testCase) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testCase.data);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Iniciando pruebas del directorio telefónico...\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${testCase.name}`);
    console.log('='.repeat(80));
    console.log('📤 Request:');
    console.log(JSON.stringify(testCase.data, null, 2));

    try {
      const response = await makeRequest(testCase);
      console.log(`\n📥 Response (Status: ${response.statusCode}):`);
      
      // Intentar parsear como JSON
      try {
        const parsed = JSON.parse(response.body);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        // Si no es JSON, mostrar como texto
        console.log(response.body);
      }

      if (response.statusCode === 200) {
        console.log('\n✅ Test exitoso');
      } else {
        console.log(`\n❌ Test falló con status ${response.statusCode}`);
      }
    } catch (error) {
      console.error(`\n❌ Error en test: ${error.message}`);
    }

    // Esperar un poco entre tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(80));
  console.log('🏁 Pruebas completadas');
  console.log('='.repeat(80));
}

// Ejecutar pruebas
runTests().catch(console.error);

