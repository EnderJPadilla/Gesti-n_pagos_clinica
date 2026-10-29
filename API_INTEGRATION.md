# Documento de Integración API REST — Control Financiero de Clínica
**Versión:** 1.0 (Provisional para Codex)  
**País:** Colombia  
**Zona Horaria de Negocio:** `America/Bogota` (UTC-5)  
**Moneda:** Peso Colombiano (`COP`) — Cadenas decimales exactas (`MoneyAmount`)  
**Estado:** Capa de integración implementada en el frontend con soporte para modo `mock` y modo `api`.

---

## 1. Arquitectura de Integración

El frontend implementa una única capa centralizada de acceso a datos para desacoplar los componentes visuales de la red:

```text
src/
├── config/
│   ├── env.ts                   # Validación de variables de entorno de Vite
│   └── api.config.ts            # URL base (/api/v1), timeouts y diccionario de endpoints
├── types/
│   ├── api.types.ts             # MoneyAmount, PaginatedResponse, ApiErrorPayload
│   ├── auth.types.ts            # Credenciales, sesiones y DTOs de login
│   ├── payer.types.ts           # EPS, Aseguradoras, Particulares
│   ├── receivable.types.ts      # Facturas, estados de pago y revisión
│   ├── payment.types.ts         # Pagos, métodos, reversiones y asignaciones
│   ├── dashboard.types.ts       # Indicadores financieros y principales deudores
│   ├── audit.types.ts           # Bitácora inmutable de auditoría
│   └── index.ts                 # Exportación unificada de contratos
├── lib/
│   └── api/
│       ├── api-client.ts        # Cliente HttpClient reutilizable (fetch + AbortController + X-Correlation-Id)
│       ├── api-error.ts         # Clase ApiClientError con tipado de códigos y mensajes accesibles
│       └── api-serialization.ts # Serialización limpia de QueryParams y MoneyAmount
├── services/
│   ├── authService.ts           # Servicio de autenticación (DemoAuthService y HttpAuthService)
│   ├── payers.service.ts        # Operaciones de pagadores (HttpPayersService y MockPayersService)
│   ├── receivables.service.ts   # Cuentas por cobrar (HttpReceivablesService y MockReceivablesService)
│   ├── payments.service.ts      # Pagos y aplicaciones (HttpPaymentsService y MockPaymentsService)
│   ├── dashboard.service.ts     # Indicadores gerenciales (HttpDashboardService y MockDashboardService)
│   ├── audit.service.ts         # Auditoría (HttpAuditService y MockAuditService)
│   └── index.ts                 # Fachada central unificada (apiService)
├── hooks/
│   ├── use-auth.ts              # Hook de sesión y perfil
│   ├── use-dashboard.ts         # Hook del panel gerencial con filtros y recarga manual
│   ├── use-payers.ts            # Hook de pagadores
│   ├── use-receivables.ts       # Hook de cuentas por cobrar con paginación
│   ├── use-payments.ts          # Hook de pagos y reversiones
│   └── use-audit.ts             # Hook de auditoría
├── mocks/
│   ├── mock-api-adapter.ts      # Motor contable simulado en memoria (Reglas R01-R22)
│   └── mock-data.ts             # Semilla con el escenario de prueba de la Sección 11
└── tests/
    └── api-integration.test.ts  # Suite de pruebas automatizadas del cliente HTTP y serialización
```

---

## 2. Variables de Configuración

Las variables se definen en el archivo `.env` o en el entorno de despliegue:

| Variable | Tipo | Valor por Defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `string` | `/api/v1` | URL base del servidor backend desarrollado por Codex. |
| `VITE_DATA_MODE` | `'mock' \| 'api'` | `mock` | Controla si las peticiones van a memoria (`mock`) o a la red (`api`). |
| `VITE_AUTH_MODE` | `'demo' \| 'api'` | `demo` | Controla si la autenticación valida credenciales demo o llama a `POST /auth/login`. |
| `VITE_API_TIMEOUT_MS` | `number` | `15000` | Tiempo máximo de espera en milisegundos antes de abortar la solicitud. |

### Cómo activar el modo API real
En `.env`:
```dotenv
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_DATA_MODE=api
VITE_AUTH_MODE=api
```
*Nota:* En modo `api`, la aplicación **nunca realiza un fallback silencioso a datos simulados** si la API falla; en su lugar, propaga un `ApiClientError` claro con opción de reintento.

---

## 3. Catálogo de Endpoints Provisionales

Todos los endpoints descritos a continuación son **provisionales** y están basados en la convención REST acordada en la especificación funcional. Codex podrá ajustar las rutas modificando exclusivamente `src/config/api.config.ts`.

### 3.1 Autenticación y Perfil

#### `POST /auth/login` (Provisional)
- **Método:** `POST`
- **Cuerpo de solicitud:**
  ```json
  {
    "email": "admin@clinica-demo.local",
    "password": "DemoClinica2026!"
  }
  ```
- **Respuesta esperada (200 OK):**
  ```json
  {
    "user": {
      "id": "usr-uuid",
      "name": "Dra. Andrea Morales",
      "email": "admin@clinica-demo.local",
      "role": "admin",
      "roleTitle": "Tesorera y Administradora Financiera"
    },
    "token": "token-jwt-opcional-si-no-usa-cookie"
  }
  ```

#### `GET /auth/me` (Provisional)
- **Método:** `GET`
- **Cabeceras:** Cookie de sesión (`HttpOnly`) o `Authorization: Bearer <token>`
- **Respuesta (200 OK):** Perfil de usuario (`UserProfile`).

#### `POST /auth/logout` (Provisional)
- **Método:** `POST`
- **Respuesta (200 OK / 204 No Content):** Sesión revocada en el backend.

---

### 3.2 Pagadores (`/payers`)

#### `GET /payers`
- **Método:** `GET`
- **Parámetros de consulta (Query Params):**
  - `search` (opcional): Filtro por texto en nombre, NIT o contacto.
  - `type` (opcional): `'EPS' | 'Aseguradora' | 'Particular'`
  - `isActive` (opcional): `true | false`
- **Respuesta (200 OK):** `Payer[]`

#### `GET /payers/:id`
- **Método:** `GET`
- **Respuesta (200 OK):** `Payer`

#### `POST /payers`
- **Método:** `POST`
- **Cuerpo:**
  ```json
  {
    "name": "EPS Sanitas S.A.S.",
    "type": "EPS",
    "idType": "NIT",
    "idNumber": "800.251.440-6",
    "contactName": "Dra. Claudia Rincón",
    "email": "cartera@epssanitas.com.co",
    "phone": "+57 (601) 375-9000",
    "notes": "Convenio 2026",
    "isActive": true
  }
  ```
- **Respuesta (201 Created):** `Payer`

#### `PATCH /payers/:id`
- **Método:** `PATCH`
- **Cuerpo:** Campos a actualizar de `UpdatePayerDto`.
- **Respuesta (200 OK):** `Payer`

---

### 3.3 Cuentas por Cobrar (`/receivables`)

#### `GET /receivables`
- **Método:** `GET`
- **Parámetros de consulta:**
  - `payerId` (opcional): Identificador del pagador.
  - `paymentStatus` (opcional): `'pending' | 'partial' | 'paid'`
  - `reviewStatus` (opcional): `'not_reviewed' | 'in_review' | 'accepted' | 'disputed'`
  - `overdue` (opcional): `true | false`
  - `search` (opcional): Texto de búsqueda.
  - `page` (número, defecto: 1)
  - `pageSize` (número, defecto: 10)
  - `sortBy` (`'balance' | 'issueDate' | 'dueDate' | 'reference'`)
  - `sortOrder` (`'asc' | 'desc'`)
- **Respuesta (200 OK):**
  ```json
  {
    "data": [ ... ],
    "total": 42,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
  ```

#### `POST /receivables`
- **Método:** `POST`
- **Cuerpo:**
  ```json
  {
    "payerId": "payer-uuid",
    "referenceNumber": "FAC-2026-00101",
    "description": "Servicios hospitalarios Lote 101",
    "issueDate": "2026-10-05",
    "dueDate": "2026-11-15",
    "originalAmount": "10000000.00",
    "reviewStatus": "not_reviewed",
    "notes": ""
  }
  ```
- **Respuesta (201 Created):** `Receivable` con `allocatedAmount: "0.00"`, `pendingBalance: "10000000.00"`.

---

### 3.4 Pagos Recibidos (`/payments`)

#### `GET /payments`
- **Método:** `GET`
- **Parámetros:** `payerId`, `from`, `to`, `paymentMethod`, `status`, `search`, `page`, `pageSize`.
- **Respuesta (200 OK):** `PaginatedResponse<Payment>`.

#### `POST /payments`
- **Método:** `POST`
- **Cabeceras obligatorias:** `Idempotency-Key` (clave única para evitar dobles cobros).
- **Cuerpo:**
  ```json
  {
    "payerId": "payer-eps-sanitas",
    "receivedAt": "2026-10-29T10:00:00-05:00",
    "amount": "4000000.00",
    "paymentMethod": "bank_transfer",
    "reference": "TRX-BCO-99824",
    "notes": "Giro quincenal",
    "allocations": [
      {
        "receivableId": "rec-cta-a-fac-001",
        "amount": "2500000.00"
      },
      {
        "receivableId": "rec-cta-b-fac-002",
        "amount": "1500000.00"
      }
    ]
  }
  ```
- **Respuesta (201 Created):** `Payment` confirmado con `allocatedAmount: "4000000.00"`, `unallocatedAmount: "0.00"`.

#### `POST /payments/:id/reversals`
- **Método:** `POST`
- **Cuerpo:**
  ```json
  {
    "reason": "Cheque devuelto por fondos insuficientes en Banco emisor"
  }
  ```
- **Respuesta (200 OK):** `Payment` con `status: "reversed"`.

#### `POST /payments/:id/allocations`
- **Método:** `POST`
- **Cuerpo:**
  ```json
  {
    "allocations": [
      {
        "receivableId": "rec-cta-c-fac-003",
        "amount": "1200000.00"
      }
    ]
  }
  ```
- **Respuesta (200 OK):** `Payment` actualizado con los nuevos importes asignados.

---

### 3.5 Dashboard (`/dashboard`)

#### `GET /dashboard/summary`
- **Parámetros:** `period=today|week|month|custom`, `from=YYYY-MM-DD`, `to=YYYY-MM-DD`.
- **Respuesta (200 OK):** `DashboardSummary`.

#### `GET /dashboard/top-debtors`
- **Respuesta (200 OK):** `TopDebtor[]` (ordenados por saldo pendiente descendente).

#### `GET /dashboard/recent-payments`
- **Parámetros:** `limit=5`.
- **Respuesta (200 OK):** `Payment[]`.

---

### 3.6 Auditoría (`/audit-logs`)

#### `GET /audit-logs`
- **Respuesta (200 OK):** `AuditLog[]` (restringido a usuarios con rol `admin`).

---

## 4. Estructura de Errores Manejados

El cliente HTTP transforma automáticamente las respuestas de error en instancias de `ApiClientError`:

| Código de Error | HTTP Status | Causa |
| :--- | :---: | :--- |
| `UNAUTHORIZED` | 401 | Credenciales inválidas o token expirado. Redirige al login de forma limpia. |
| `FORBIDDEN` | 403 | El usuario tiene sesión activa pero carece de permisos (ej. rol Consulta intentando revertir). |
| `NOT_FOUND` | 404 | El recurso solicitado no existe en el sistema. |
| `VALIDATION_ERROR` | 422 / 400 | Fallo en validación de campos obligatorios, fechas o importes negativos. |
| `DUPLICATE_REFERENCE` | 409 | La referencia de la factura ya existe para ese pagador específico (R08). |
| `INSUFFICIENT_RECEIVABLE_BALANCE` | 422 | El abono supera el saldo pendiente de la cuenta (R11). |
| `PAYMENT_ALREADY_REVERSED` | 409 | El pago ya se encuentra en estado revertido (R19). |
| `IDEMPOTENCY_CONFLICT` | 409 | Se detectó una solicitud repetida con la misma clave de idempotencia (R21). |
| `NETWORK_ERROR` | 0 | El servidor no respondió o falló la conexión a internet. |
| `TIMEOUT_ERROR` | 408 | La solicitud superó los 15 segundos de timeout. |
| `SERVER_ERROR` | 500 | Error no controlado en el backend. |

---

## 5. Puntos de Adaptación que Codex Deberá Ajustar

Cuando Codex finalice los endpoints en NestJS/Express, los ajustes se concentrarán en los siguientes archivos puntuales:

1. **Rutas URL:**
   - Si las rutas difieren (ej. `/api/v1/invoices` en lugar de `/api/v1/receivables`), cambiar únicamente los strings en `src/config/api.config.ts`.
2. **Formato de Envoltorio (Envelope vs Plano):**
   - Si el backend entrega respuestas envueltas como `{ success: true, data: { ... } }`, ajustar el deserializador en `src/lib/api/api-client.ts` (línea 110).
3. **Manejo de Sesión (Cookie HttpOnly vs Header Authorization):**
   - Si se utiliza Cookie `HttpOnly`, el cliente ya incluye `credentials: 'same-origin'`. Si se utiliza un dominio cruzado, configurar `credentials: 'include'` y CORS en NestJS.
   - Si se utiliza JWT en cabecera `Authorization: Bearer <token>`, agregar la lectura del token en `src/lib/api/api-client.ts` dentro de la preparación de cabeceras.
4. **Idempotencia:**
   - Confirmar si el backend espera la cabecera `Idempotency-Key` o `X-Idempotency-Key`. Se configuró por defecto `Idempotency-Key`.
