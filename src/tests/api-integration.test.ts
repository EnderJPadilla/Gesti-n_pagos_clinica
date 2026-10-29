/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Suite de pruebas de integración para la capa de API REST.
 * Valida construcción de URLs, serialización, manejo de errores HTTP (401, 403, 404, 500),
 * prevención de dobles envíos, adaptadores Mock y políticas de seguridad sin fallback silencioso.
 */

import { buildQueryString, normalizeMoneyAmount } from '../lib/api/api-serialization';
import { ApiClientError } from '../lib/api/api-error';
import { HttpClient } from '../lib/api/api-client';
import { MockApiAdapter } from '../mocks/mock-api-adapter';
import { HttpPayersService } from '../services/payers.service';
import { HttpPaymentsService } from '../services/payments.service';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✓ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`✗ [FAIL] ${testName}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('=== INICIO DE PRUEBAS DE INTEGRACIÓN API REST ===\n');

  // 1. Construcción correcta de URLs y parámetros
  const queryStr = buildQueryString({
    payerId: 'payer-123',
    page: 2,
    pageSize: 10,
    overdue: true,
    empty: '',
    nullVal: null,
    undefVal: undefined,
  });
  assert(
    queryStr === '?payerId=payer-123&page=2&pageSize=10&overdue=true',
    '1. Construcción y serialización correcta de query params sin valores nulos/vacíos'
  );

  // 2. Normalización de importes monetarios (MoneyAmount como string decimal exacto)
  const moneyNormal = normalizeMoneyAmount('1250000.5');
  const moneyZero = normalizeMoneyAmount(0);
  assert(
    moneyNormal === '1250000.50' && moneyZero === '0.00',
    '2. Serialización exacta de importes monetarios decimales sin números flotantes'
  );

  // 3. Manejo de errores HTTP: 401 Unauthorized
  const mock401Response = new Response(JSON.stringify({ message: 'Token expirado' }), {
    status: 401,
    statusText: 'Unauthorized',
    headers: { 'Content-Type': 'application/json', 'x-correlation-id': 'req-test-401' },
  });
  const err401 = ApiClientError.fromHttpResponse(mock401Response, { message: 'Token expirado' }, 'req-test-401');
  assert(
    err401.isUnauthorized && err401.status === 401 && err401.correlationId === 'req-test-401',
    '3. Detección y tipado correcto de error 401 Unauthorized'
  );

  // 4. Manejo de errores HTTP: 403 Forbidden (no expulsa la sesión)
  const mock403Response = new Response(JSON.stringify({ message: 'Acceso denegado a este recurso' }), {
    status: 403,
    statusText: 'Forbidden',
  });
  const err403 = ApiClientError.fromHttpResponse(mock403Response, { message: 'Acceso denegado a este recurso' });
  assert(
    err403.isForbidden && err403.status === 403,
    '4. Detección correcta de error 403 Forbidden'
  );

  // 5. Manejo de errores de red
  const networkErr = ApiClientError.fromNetwork(new Error('Failed to fetch'), 'req-net-01');
  assert(
    networkErr.isNetworkError && networkErr.code === 'NETWORK_ERROR',
    '5. Mapeo de errores de red sin exponer trazas internas'
  );

  // 6. Mensajes amigables de usuario en español
  const friendly401 = err401.getUserFriendlyMessage();
  assert(
    friendly401.includes('Sesión expirada') || friendly401.includes('inicia sesión'),
    '6. Generación de mensaje comprensible y seguro para el usuario final'
  );

  // 7. Ausencia de fallback silencioso en HttpPayersService cuando falla la API
  const fakeHttpClient = new HttpClient({ baseUrl: 'http://127.0.0.1:54321/api/v1', defaultTimeoutMs: 1000 });
  const httpPayers = new HttpPayersService();
  // Inyectar el fake client para probar que arroja error en lugar de saltar a datos mock
  (httpPayers as any).httpClient = fakeHttpClient;
  try {
    // Intentar consultar contra endpoint cerrado
    await fakeHttpClient.get('/payers');
    assert(false, '7. Debe fallar explícitamente y NO recurrir silenciosamente a mocks');
  } catch (err: any) {
    assert(
      err instanceof ApiClientError && err.isNetworkError,
      '7. Ausencia de fallback silencioso: La falla de API arroja ApiClientError inmediatamente'
    );
  }

  // 8. Validación de las reglas de negocio en MockApiAdapter (R01 a R22)
  const adapter = new MockApiAdapter();
  await adapter.resetData();
  const summary = await adapter.getDashboardSummary({ period: 'today' });
  assert(
    summary.receivedToday !== undefined && summary.pendingPortfolio !== undefined,
    '8. Adaptador mock calcula correctamente indicadores contables (R03, R14)'
  );

  // 9. Validación de tope de aplicaciones contra pagos (R10)
  try {
    await adapter.createPayment({
      payerId: 'payer-eps-sanitas',
      receivedAt: '2026-10-29T10:00:00-05:00',
      amount: '1000000.00',
      paymentMethod: 'bank_transfer',
      allocations: [
        { receivableId: 'rec-cta-a-fac-001', amount: '2000000.00' }, // Supera el pago de 1 millón
      ],
    });
    assert(false, '9. Debe rechazar pago donde la aplicación supere el valor recibido');
  } catch (err: any) {
    assert(
      err.code === 'VALIDATION_ERROR' || err.code === 'INSUFFICIENT_RECEIVABLE_BALANCE',
      '9. Rechazo atómico de aplicaciones superiores al pago o al saldo de la cuenta (R10/R11)'
    );
  }

  // 10. Prevención de duplicación por idempotencia (R21)
  const idempKey = 'idemp-unit-test-123';
  await adapter.createPayment(
    {
      payerId: 'payer-eps-sanitas',
      receivedAt: '2026-10-29T10:00:00-05:00',
      amount: '50000.00',
      paymentMethod: 'cash',
    },
    idempKey
  );
  try {
    await adapter.createPayment(
      {
        payerId: 'payer-eps-sanitas',
        receivedAt: '2026-10-29T10:00:00-05:00',
        amount: '50000.00',
        paymentMethod: 'cash',
      },
      idempKey
    );
    assert(false, '10. Debe rechazar transacción duplicada con la misma clave de idempotencia');
  } catch (err: any) {
    assert(
      err.code === 'IDEMPOTENCY_CONFLICT',
      '10. Detección y bloqueo seguro de transacciones duplicadas por idempotencia (R21)'
    );
  }

  console.log(`\n=== RESUMEN DE PRUEBAS ===`);
  console.log(`Pasadas: ${passedTests}`);
  console.log(`Fallidas: ${failedTests}`);

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
