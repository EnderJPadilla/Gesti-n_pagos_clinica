# PRODUCT SPEC — Control Financiero de Clínica
## Especificación para Google AI Studio y desarrollo coordinado con Codex

**Versión:** 0.1  
**Estado:** Especificación del MVP — pendiente de implementación  
**País:** Colombia  
**Idioma de interfaz:** Español (es-CO)  
**Moneda:** Peso colombiano (COP)  
**Zona horaria:** `America/Bogota`  
**Despliegue inicial:** Local  
**Documento:** `PRODUCT_SPEC.md`

---

## 1. Instrucción principal para Google AI Studio

Diseña y genera el **frontend** de una aplicación web funcional llamada provisionalmente **Control Financiero de Clínica**.

La aplicación ayudará a una clínica colombiana a controlar:

1. Cuánto dinero recibió hoy, esta semana y este mes.
2. Cuánto dinero tiene pendiente por cobrar.
3. Qué entidades o personas le deben y cuánto.
4. Qué pagos se recibieron y a qué cuentas se aplicaron.

### Límites obligatorios

- En esta fase, genera **solo el frontend**.
- No implementes una API ni una base de datos dentro del frontend.
- No inventes endpoints, campos, reglas financieras ni respuestas de API que contradigan este documento.
- No presentes cifras ficticias como si fueran información real.
- Si la API aún no está conectada, utiliza datos de demostración claramente identificados con una etiqueta visible como **“Datos de demostración”**.
- Mantén la capa de acceso a datos separada de los componentes visuales para facilitar la conexión futura con una API REST.
- No guardes información financiera real en `localStorage`, `sessionStorage` ni en otros mecanismos de almacenamiento del navegador.
- No agregues funciones fuera del alcance del MVP.
- No uses datos clínicos, historias médicas ni información sensible de pacientes. Este producto administra información financiera y referencias administrativas.
- Todo el contenido visible debe estar en español colombiano y usar formatos monetarios y de fecha apropiados para Colombia.
- Genera una interfaz profesional, clara, accesible, responsive y orientada a la rapidez de consulta de un gerente.

Si existe una contradicción entre una decisión visual y una regla financiera de este documento, prevalece la regla financiera.

---

## 2. Problema que resuelve

Actualmente, la clínica registra sus cobros y pagos en hojas de Excel y cuadernos. El gerente no puede obtener rápidamente una respuesta confiable sobre el dinero recibido, la cartera pendiente o los responsables de pago.

La aplicación debe centralizar la información financiera y facilitar su consulta sin exigir conocimientos contables avanzados.

### Objetivo del MVP

Sustituir el control disperso de Excel y cuadernos por un registro centralizado, persistente y verificable de cuentas por cobrar y pagos recibidos.

### Preguntas que debe responder

- ¿Cuánto dinero entró hoy?
- ¿Cuánto dinero entró esta semana?
- ¿Cuánto dinero entró este mes?
- ¿Cuánto nos deben en total?
- ¿Cuánto de la cartera está vencido?
- ¿Quién nos debe y cuánto?
- ¿Qué pagos se registraron recientemente?
- ¿Hay dinero recibido que todavía no está aplicado a una cuenta?

---

## 3. Alcance funcional

### 3.1 Incluido en el MVP

1. Inicio de sesión.
2. Panel gerencial (dashboard).
3. Registro y consulta de pagadores.
4. Registro y consulta de cuentas por cobrar.
5. Registro de pagos totales y parciales.
6. Aplicación de un pago a una o varias cuentas.
7. Registro de pagos que todavía no se han asignado a una cuenta.
8. Consulta de cartera y principales deudores.
9. Historial de pagos.
10. Filtros por fecha, pagador, estado y vencimiento.
11. Estados de pago y de revisión separados.
12. Visualización de saldos calculados.
13. Vistas de acceso denegado, carga, error y ausencia de datos.
14. Interfaz preparada para conectarse a una API REST.

### 3.2 Fuera del alcance

No implementar ni simular como funciones reales:

- Registro de egresos o pagos a proveedores.
- Nómina.
- Contabilidad completa o libro mayor.
- Historias clínicas o datos médicos.
- Gestión de citas.
- Inventario.
- Facturación electrónica DIAN.
- Emisión legal de facturas.
- Integraciones con EPS, ADRES, aseguradoras o bancos.
- Conciliación bancaria automática.
- Envío automático de recordatorios de cobro.
- Multitenencia.
- Aplicación móvil nativa.
- Automatizaciones externas.

El sistema registra referencias de cuentas o facturas que la clínica ya haya generado; no las emite ni certifica su validez tributaria.

---

## 4. Usuarios y permisos

### Administrador

Puede:

- Consultar todos los módulos.
- Crear y editar pagadores.
- Crear cuentas por cobrar.
- Registrar pagos.
- Aplicar pagos.
- Solicitar la reversión de un pago mediante el flujo autorizado.
- Consultar historial y auditoría.
- Gestionar usuarios si esta función se habilita en el backend.

### Consulta gerencial

Puede:

- Consultar dashboard.
- Consultar pagadores, cuentas, pagos y deudores.
- Usar filtros y búsquedas.
- Consultar historial autorizado.

No puede crear, editar, aplicar ni revertir movimientos financieros.

El frontend debe ocultar o deshabilitar acciones no permitidas, pero la autorización definitiva siempre corresponde al backend.

---

## 5. Navegación y pantallas

Utiliza una navegación lateral en escritorio y un menú adaptable en pantallas pequeñas.

### Elementos de navegación

1. Dashboard
2. Cuentas por cobrar
3. Pagadores
4. Pagos recibidos
5. Auditoría (visible solo para roles autorizados)
6. Configuración de cuenta / cerrar sesión

No agregues módulos de egresos ni funcionalidades hospitalarias.

### 5.1 Dashboard

Debe presentar de forma destacada:

- **Recibido hoy**
- **Recibido esta semana**
- **Recibido este mes**
- **Cartera pendiente**
- **Cartera vencida**
- **Cantidad de cuentas abiertas**
- **Principales deudores**
- **Pagos recientes**
- **Pagos con saldo sin asignar**, cuando existan

Incluye filtros de periodo: Hoy, Esta semana, Este mes y Periodo personalizado. Los indicadores de dinero recibido deben respetar el periodo seleccionado o mostrar claramente qué periodo representa cada tarjeta.

Cada tarjeta o fila debe llevar a una vista de detalle cuando tenga sentido.

Los indicadores no deben mezclar dinero recibido con cartera pendiente. No mostrar utilidad, rentabilidad ni saldo bancario: el MVP no registra egresos ni conciliación bancaria.

### 5.2 Pagadores

Lista con:

- Nombre o razón social.
- Tipo de pagador.
- Identificación, si existe.
- Contacto, si existe.
- Estado activo/inactivo.
- Saldo total pendiente calculado.
- Acceso al detalle.

Tipos permitidos:

- EPS
- Aseguradora
- Particular

Formulario de alta/edición:

- Nombre o razón social (obligatorio).
- Tipo (obligatorio).
- Tipo y número de identificación (opcionales, con validación cuando se proporcionen).
- Nombre de contacto (opcional).
- Correo (opcional).
- Teléfono (opcional).
- Observaciones (opcional).
- Estado activo/inactivo.

Un pagador con historial financiero no debe ofrecerse para eliminación física. Puede marcarse inactivo.

### 5.3 Cuentas por cobrar

Tabla con columnas recomendadas:

- Referencia.
- Pagador.
- Descripción.
- Fecha de emisión/registro.
- Fecha de vencimiento.
- Valor original.
- Valor aplicado.
- Saldo pendiente.
- Estado de pago.
- Estado de revisión.
- Acciones permitidas.

Filtros:

- Búsqueda por referencia o pagador.
- Tipo de pagador.
- Pagador específico.
- Estado de pago.
- Estado de revisión.
- Vencida / no vencida.
- Rango de fechas.
- Orden por saldo, emisión o vencimiento.
- Paginación.

Formulario de alta:

- Pagador responsable (obligatorio).
- Referencia de factura/cuenta (obligatoria).
- Descripción (opcional).
- Fecha de emisión/registro (obligatoria).
- Fecha de vencimiento (opcional).
- Valor original en COP (obligatorio, mayor que cero).
- Estado de revisión (por defecto `not_reviewed`).
- Observaciones (opcional).

Detalle de cuenta:

- Datos generales.
- Valor original.
- Total de aplicaciones vigentes.
- Saldo pendiente calculado.
- Estado de pago calculado.
- Estado de revisión.
- Historial de aplicaciones de pago.
- Datos de auditoría que el backend autorice mostrar.

No permitir que el usuario edite directamente el saldo, el total aplicado o el estado de pago calculado.

### 5.4 Pagos recibidos

Lista con:

- Fecha efectiva de recepción.
- Pagador.
- Referencia del pago.
- Medio de pago.
- Valor recibido.
- Valor aplicado.
- Valor sin asignar.
- Estado.
- Usuario que lo registró, si está autorizado.
- Acciones permitidas.

Formulario de pago:

- Pagador (obligatorio).
- Fecha efectiva de recepción (obligatoria).
- Valor recibido (obligatorio, mayor que cero).
- Medio de pago (obligatorio).
- Referencia de transferencia/recibo (opcional).
- Observaciones (opcional).
- Distribución entre cuentas por cobrar (opcional al confirmar el pago).

Medios de pago iniciales:

- Transferencia bancaria.
- Consignación.
- Efectivo.
- Tarjeta.
- Otro.

Permitir agregar varias líneas de aplicación, cada una con una cuenta y un importe. El total aplicado no puede superar el pago y cada importe no puede superar el saldo disponible de su cuenta.

El flujo debe permitir registrar un pago sin asignarlo a ninguna cuenta y aplicarlo posteriormente. Mostrar claramente el saldo sin asignar.

La confirmación final, la validación de saldos y la persistencia pertenecen a la API. El frontend solo puede hacer validaciones preliminares.

### 5.5 Detalle de pago

Mostrar:

- Identificación del pago.
- Pagador.
- Fecha efectiva de recepción.
- Valor recibido.
- Valor aplicado.
- Saldo sin asignar.
- Medio y referencia.
- Cuentas a las que se aplicó.
- Estado.
- Historial de reversión, si existe.

Los pagos confirmados no deben tener controles normales de edición o eliminación. La reversión debe ser una acción explícita, restringida a usuarios autorizados, con confirmación y motivo obligatorio.

### 5.6 Principales deudores

Mostrar los pagadores ordenados por saldo pendiente descendente, con:

- Nombre.
- Tipo.
- Saldo pendiente.
- Cartera vencida.
- Número de cuentas abiertas.
- Acceso al detalle del pagador.

No mostrar deudores con saldo cero en el listado principal, salvo que el usuario aplique un filtro que los incluya.

### 5.7 Auditoría

Vista de solo lectura para usuarios autorizados. Mostrar:

- Fecha y hora.
- Usuario.
- Acción.
- Tipo de entidad.
- Referencia de la entidad.
- Motivo, si aplica.

No exponer credenciales, contraseñas, secretos ni metadatos sensibles.

---

## 6. Reglas de negocio

El frontend debe reflejar estas reglas y no contradecirlas. El backend será responsable de aplicarlas de forma definitiva.

### Cuentas por cobrar

**R01.** Cada cuenta pertenece a un único pagador.

**R02.** El valor original debe ser mayor que cero.

**R03.** El saldo se calcula usando el valor original menos las aplicaciones vigentes. En el MVP no se permiten ajustes manuales de saldo.

**R04.** Una cuenta está pagada cuando el saldo pendiente es exactamente cero.

**R05.** Una cuenta está parcialmente pagada cuando tiene aplicaciones vigentes y saldo pendiente mayor que cero.

**R06.** Una cuenta está vencida si tiene saldo pendiente y su vencimiento es anterior a la fecha actual en `America/Bogota`.

**R07.** Una cuenta sin fecha de vencimiento no se considera vencida automáticamente.

**R08.** Las referencias duplicadas se controlan dentro del contexto del pagador. La misma referencia puede existir en pagadores diferentes; para un mismo pagador, la misma referencia no debe duplicar el mismo documento.

### Pagos

**R09.** El valor de un pago debe ser positivo y su fecha efectiva válida.

**R10.** La suma de aplicaciones vigentes de un pago no puede superar el valor del pago.

**R11.** La aplicación a una cuenta no puede superar su saldo pendiente disponible.

**R12.** Un pago se cuenta una sola vez en ingresos, aunque se distribuya entre varias cuentas.

**R13.** Un pago puede quedar parcialmente o totalmente sin asignar.

**R14.** El pago confirmado se muestra en dinero recibido por su valor vigente total, incluso si tiene saldo sin asignar. El saldo sin asignar no reduce cartera.

**R15.** En el MVP, las aplicaciones de un pago deben corresponder al mismo pagador responsable del pago.

**R16.** El registro del pago y sus aplicaciones se confirma en una única transacción de base de datos. Si una parte falla, se revierte la operación completa.

**R17.** Usar importes monetarios exactos, como `NUMERIC(18,2)`, nunca `float` para cálculos financieros.

**R18.** Las operaciones sensibles requieren autenticación y permisos adecuados.

**R19.** Los pagos confirmados no se editan ni eliminan directamente. Se corrigen mediante una reversión auditada.

**R20.** La reversión conserva el movimiento original, registra usuario, fecha y motivo y actualiza los indicadores y saldos vigentes.

**R21.** La creación de pagos debe aceptar una clave de idempotencia para evitar duplicaciones por reintentos.

**R22.** El servidor valida importes, fechas, relaciones y permisos aunque el frontend también valide.

### Estados de pago

El estado de pago se calcula a partir del saldo y las aplicaciones vigentes:

- `pending`: no hay aplicaciones vigentes y queda saldo.
- `partial`: hay aplicaciones vigentes y queda saldo.
- `paid`: saldo pendiente igual a cero.

Una cuenta vencida puede además tener estado de pago `pending` o `partial`; el vencimiento es una condición derivada adicional, no un estado de pago sustituto.

### Estados de revisión

- `not_reviewed`: no revisada.
- `in_review`: en revisión.
- `accepted`: aceptada.
- `disputed`: con glosa/devolución.

El estado de revisión es independiente del estado de pago. Cambiarlo no altera automáticamente el saldo ni registra un ingreso, descuento o pérdida.

---

## 7. Contrato API previsto

Prefijo base: `/api/v1`.

La API todavía no está implementada. El frontend debe encapsular el acceso a datos en servicios para poder conectarla posteriormente. No inventes una API alternativa.

### Endpoints acordados

- `POST /auth/login`
- `GET /auth/me`
- `GET /dashboard/summary`
- `GET /dashboard/top-debtors`
- `GET /dashboard/recent-payments`
- `GET /payers`
- `POST /payers`
- `GET /payers/:id`
- `PATCH /payers/:id`
- `GET /receivables`
- `POST /receivables`
- `GET /receivables/:id`
- `PATCH /receivables/:id`
- `GET /payments`
- `POST /payments`
- `GET /payments/:id`
- `POST /payments/:id/reversals`
- `GET /audit-logs`

Todos los listados deben contemplar paginación. La autorización definitiva es del backend.

### Formato de importes y fechas

- Los importes se envían y reciben como cadenas decimales: `"1250000.00"`.
- La moneda es `COP`.
- Las fechas de calendario usan `YYYY-MM-DD`.
- Los instantes usan ISO 8601 con zona horaria.
- Zona horaria de negocio: `America/Bogota`.

### Crear una cuenta por cobrar: solicitud ilustrativa

```json
{
  "payerId": "uuid-del-pagador",
  "referenceNumber": "FAC-2026-00125",
  "description": "Servicios médicos",
  "issueDate": "2026-10-20",
  "dueDate": "2026-11-19",
  "originalAmount": "10000000.00",
  "reviewStatus": "not_reviewed",
  "notes": ""
}
```

La respuesta debe incluir el identificador generado, valor original, valor aplicado, saldo pendiente, estado de pago y moneda. El frontend no debe asumir que el saldo o estado enviado por el cliente es válido.

### Registrar un pago: solicitud ilustrativa

La creación debe usar el encabezado `Idempotency-Key`.

```json
{
  "payerId": "uuid-del-pagador",
  "receivedAt": "2026-10-29T10:00:00-05:00",
  "amount": "4000000.00",
  "paymentMethod": "bank_transfer",
  "reference": "TRX-12345",
  "allocations": [
    {
      "receivableId": "uuid-de-la-cuenta",
      "amount": "4000000.00"
    }
  ]
}
```

Las aplicaciones pueden ser una lista vacía si el pago aún no se asigna. El backend devuelve `allocatedAmount`, `unallocatedAmount` y el estado vigente del pago.

### Filtros del dashboard

`GET /dashboard/summary` acepta:

- `period=today|week|month|custom`
- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`

Para `custom`, ambos extremos son obligatorios.

### Filtros de cuentas

`GET /receivables` acepta:

- `payerId`
- `paymentStatus=pending|partial|paid`
- `reviewStatus`
- `overdue=true|false`
- `search`
- `page`
- `pageSize`
- `sortBy`
- `sortOrder`

### Filtros de pagos

`GET /payments` acepta:

- `payerId`
- `from`
- `to`
- `paymentMethod`
- `status`
- `page`
- `pageSize`

### Errores esperados

La interfaz debe manejar de forma legible al menos:

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `DUPLICATE_REFERENCE`
- `INSUFFICIENT_RECEIVABLE_BALANCE`
- `PAYMENT_ALREADY_REVERSED`
- `IDEMPOTENCY_CONFLICT`

No mostrar trazas técnicas ni detalles internos al usuario.

---

## 8. Definición de indicadores

### Dinero recibido durante un periodo

Suma de los pagos confirmados y no revertidos cuya fecha efectiva de recepción cae dentro del periodo seleccionado. Incluye pagos parcialmente o totalmente sin asignar.

### Cartera pendiente

Suma de los saldos pendientes de todas las cuentas por cobrar. No incluye el dinero sin asignar de los pagos.

### Cartera vencida

Suma de los saldos pendientes positivos de cuentas cuyo vencimiento sea anterior a la fecha actual de Colombia.

### Saldo sin asignar

Valor vigente del pago menos la suma de sus aplicaciones vigentes.

### Principales deudores

Agrupar los saldos pendientes por pagador y ordenar de mayor a menor. La cartera vencida se calcula por separado.

Los indicadores deben venir calculados por la API. El frontend no debe descargar todos los registros para calcular los totales localmente.

---

## 9. Diseño y experiencia de usuario

### Dirección visual

- Profesional y sobria, adecuada para una herramienta de gestión financiera.
- Jerarquía visual clara, con indicadores destacados.
- Navegación predecible y formularios simples.
- Tablas legibles con búsqueda, filtros y paginación.
- Espaciado consistente y uso moderado de colores.
- No usar gráficos decorativos que no aporten información.
- Evitar apariencia de plantilla genérica o de sistema hospitalario completo.
- Diseñar primero para escritorio, pero mantener usabilidad en tabletas y móviles.

### Moneda y fechas

- Moneda: pesos colombianos.
- Mostrar valores con separadores de miles y sin decimales cuando no aporten valor visual; conservar la precisión en los datos.
- Ejemplo visual: `$ 1.250.000`.
- Fechas de pantalla: `29/10/2026`.
- Semana de lunes a domingo.
- Zona horaria: `America/Bogota`.

### Accesibilidad y estados de interfaz

- Etiquetas explícitas en formularios.
- Contraste suficiente.
- Navegación por teclado.
- Indicadores de foco visibles.
- Confirmación antes de acciones financieras sensibles.
- Errores específicos junto al campo y un resumen cuando sea necesario.
- Estados de carga, éxito, error, lista vacía y búsqueda sin resultados.
- No depender únicamente del color para comunicar un estado.
- Confirmar explícitamente cuando una operación haya sido aceptada por la API; no mostrar éxito antes de recibir respuesta.

### Datos de demostración

Mientras no haya API, usa datos simulados coherentes entre todas las pantallas y etiquétalos claramente. No mezcles datos ficticios con datos reales ni los presentes como datos de una clínica real.

El adaptador de datos debe permitir sustituir la fuente simulada por la API sin reescribir los componentes visuales.

No persistir datos financieros de demostración o reales en el almacenamiento del navegador salvo que se apruebe una decisión de arquitectura explícita.

---

## 10. Criterios de aceptación del MVP

### Funcionalidad

- [ ] El usuario puede iniciar sesión mediante la interfaz de autenticación.
- [ ] El dashboard presenta dinero recibido hoy, esta semana y este mes.
- [ ] El dashboard presenta cartera pendiente y cartera vencida.
- [ ] Los principales deudores se ordenan por saldo pendiente.
- [ ] Se pueden consultar, buscar y filtrar pagadores.
- [ ] Se pueden consultar y filtrar cuentas por cobrar.
- [ ] Los formularios de cuenta validan campos obligatorios e importes positivos.
- [ ] Se puede registrar un pago total o parcial.
- [ ] Se puede registrar un pago sin asignarlo a una cuenta.
- [ ] El detalle del pago muestra valor recibido, aplicado y sin asignar.
- [ ] Los pagos pueden distribuirse entre varias cuentas del mismo pagador.
- [ ] El frontend distingue el estado de pago del estado de revisión.
- [ ] La interfaz contempla reversión autorizada con motivo.
- [ ] Se muestran estados de carga, error, ausencia de datos y acceso denegado.
- [ ] Los datos de demostración se identifican como tales.

### Integridad financiera

- [ ] No se puede aplicar a una cuenta más que su saldo pendiente.
- [ ] Las aplicaciones no pueden superar el valor del pago.
- [ ] Un pago distribuido entre varias cuentas se cuenta una sola vez en ingresos.
- [ ] El dinero sin asignar no reduce la cartera.
- [ ] Las fechas se interpretan usando la zona horaria acordada.
- [ ] El frontend no permite editar directamente saldos calculados.
- [ ] Las acciones no autorizadas no aparecen como disponibles para el perfil de consulta.
- [ ] Los errores del backend se presentan de forma clara.

### Integración

- [ ] Existe una capa de servicios separada de los componentes.
- [ ] Los nombres de campos y estados coinciden con este documento.
- [ ] La fuente simulada puede sustituirse por la API.
- [ ] No hay lógica financiera crítica implementada únicamente en el cliente.
- [ ] No hay datos reales incrustados como fixtures o valores por defecto.

---

## 11. Escenario de prueba de referencia

Crear tres cuentas:

- Cuenta A: $10.000.000, pagador EPS A.
- Cuenta B: $3.000.000, pagador EPS A.
- Cuenta C: $2.000.000, pagador aseguradora B.

Cartera inicial: $15.000.000.

Registrar un pago de $4.000.000 del pagador EPS A, aplicado así:

- $2.500.000 a la cuenta A.
- $1.500.000 a la cuenta B.

Resultado esperado:

- Dinero recibido por el movimiento: $4.000.000.
- Saldo cuenta A: $7.500.000.
- Saldo cuenta B: $1.500.000.
- Saldo cuenta C: $2.000.000.
- Cartera pendiente total: $11.000.000.
- Saldo pendiente de EPS A: $9.000.000.
- Saldo pendiente de aseguradora B: $2.000.000.

La suma de los saldos debe ser igual a la cartera pendiente total.

---

## 12. Arquitectura prevista y límites del frontend

Stack propuesto:

- React.
- TypeScript.
- Vite.
- API REST.
- Backend previsto: Node.js con TypeScript y NestJS.
- Base de datos prevista: PostgreSQL.
- Despliegue inicial local.

Google AI Studio es responsable de generar el frontend. No debe implementar la API ni modificar el esquema de base de datos como parte de esta tarea.

La estructura interna del frontend debe separar, como mínimo:

- Pantallas y componentes visuales.
- Tipos y esquemas de datos compartidos con el contrato.
- Servicios de API.
- Adaptador de datos de demostración.
- Estado de sesión y permisos de interfaz.
- Utilidades de formato monetario y fechas.
- Validaciones de formularios.

No dupliques reglas financieras en múltiples componentes. Centraliza el formato de fechas, moneda y estados.

No inventes un mecanismo de autenticación persistente. La sesión real será definida por el backend; para una vista de demostración puede usarse un modo demo claramente identificado, sin presentarlo como autenticación segura.

---

## 13. Seguridad y privacidad

- No recopilar datos clínicos ni historias médicas.
- No incluir contraseñas, tokens ni secretos en el código del frontend.
- No almacenar credenciales en texto plano.
- No exponer errores internos o trazas.
- No considerar la ocultación de botones como un control de autorización suficiente.
- No guardar información financiera real en almacenamiento del navegador.
- La API debe validar permisos, importes, fechas y relaciones.
- Los pagos confirmados y las reversiones deben conservar trazabilidad.
- Antes del uso real, el despliegue local debe contar con copias de seguridad, control de acceso al equipo y procedimiento de restauración verificado.

Este documento no declara que el producto sea un sistema contable, un facturador electrónico ni una solución certificada de cumplimiento sanitario.

---

## 14. Entregables de Google AI Studio

Generar:

1. Frontend React + TypeScript + Vite.
2. Pantallas y navegación del MVP.
3. Componentes reutilizables para indicadores, tablas, formularios, estados y filtros.
4. Datos de demostración coherentes, claramente identificados.
5. Capa de servicios preparada para API REST.
6. Tipos TypeScript alineados con el contrato descrito.
7. Instrucciones de ejecución local del frontend.
8. Un resumen de archivos creados y decisiones de implementación.
9. Lista explícita de cualquier requisito que no se haya implementado.

No generar una API, esquema SQL ni backend dentro de este entregable.

---

## 15. Instrucción final para el generador

Lee todo este documento antes de comenzar. Implementa exclusivamente el frontend del MVP descrito.

Prioriza precisión de la información financiera, claridad, facilidad de uso y coherencia con el contrato de API. Mantén los datos simulados claramente separados de la futura API. No amplíes el alcance ni inventes funciones.

Antes de finalizar, revisa cada criterio de aceptación de frontend, identifica cuáles se cumplen y documenta los pendientes. No declares integración real con backend mientras la API no exista y no haya sido probada.

**Fin de `PRODUCT_SPEC.md`.**
