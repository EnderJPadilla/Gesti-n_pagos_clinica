# Gestión de Pagos en clinica de la Salud

Aplicación web para apoyar el control del dinero recibido y las cuentas por cobrar de una clínica.

## Objetivo del proyecto

Desarrollar una aplicación sencilla que permita registrar y consultar los pagos recibidos, controlar las cuentas pendientes de cobro y conocer la situación financiera de las cuentas por cobrar.

## Funcionalidades principales

La primera versión contempla las siguientes funcionalidades:

- **Panel principal:** consultar un resumen del dinero recibido y las cuentas pendientes.
- **Gestión de pagadores:** registrar y consultar EPS, aseguradoras y pacientes particulares.
- **Cuentas por cobrar:** registrar las cuentas pendientes de pago y consultar sus saldos.
- **Registro de pagos:** registrar pagos recibidos, incluyendo pagos parciales.
- **Asignación de pagos:** relacionar un pago con una o varias cuentas por cobrar.
- **Pagos sin asignar:** identificar el dinero recibido que todavía no se ha relacionado con una cuenta.
- **Seguimiento de vencimientos:** identificar cuentas pendientes y vencidas.
- **Historial de movimientos:** facilitar la revisión de los cambios y operaciones realizados.
- **Control de acceso:** contemplar usuarios con diferentes permisos.

## Alcance de la primera versión

La primera versión se enfoca exclusivamente en el control de los ingresos recibidos y las cuentas por cobrar.

**No incluye inicialmente:**

- Registro y control de gastos.
- Nómina.
- Contabilidad completa.
- Historias clínicas o gestión de citas.
- Inventario de medicamentos o insumos.
- Facturación electrónica.
- Integraciones automáticas con EPS, bancos u otros sistemas.
- Aplicación móvil independiente.

## Tecnología y estructura

La interfaz se desarrolla con apoyo de **Google AI Studio**, con el objetivo de contar con una estructura organizada, fácil de mantener y preparada para conectarse a un backend mediante una API.

Durante el desarrollo se puede utilizar un modo de demostración con datos ficticios para probar la interfaz. Este modo debe mantenerse separado del funcionamiento con datos reales.

## Integración con la API

La aplicación está diseñada para prepararse para una conexión con una API que permita consultar y registrar la información del sistema.

La integración contempla servicios para:

- Autenticación y usuarios.
- Pagadores.
- Cuentas por cobrar.
- Pagos y asignaciones.
- Información del panel principal.
- Historial de movimientos.

## Documentación relacionada

- `PRODUCT_SPEC.md`: definición del producto, sus funcionalidades y las reglas del negocio.
- `API_INTEGRATION.md`: documento previsto para coordinar la integración entre la interfaz y la API.


## Paso a paso para ejecutar la APP Localmente

1.	Revisar la configuración inicial
Verifiqué que existan los archivos clave y su contenido:
•	package.json
•	vite.config.ts
•	README.md
2.	Resolver cualquier incompatibilidad de dependencias
Comando: npm install
3.	Verificar que el proyecto compila
Comando: npm run build
4.	Arrancar la aplicación en modo desarrollo
Comando: npm run dev
Resultado verificado:
•	Vite quedó levantado
•	URL disponible: http://localhost:3000
